import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface FileContent {
  name: string;
  type: string;
  content: string;
}

interface AnalyzeRequest {
  context: string;
  establishmentId?: string;
  files: FileContent[];
}

const getContextPrompt = (context: string): string => {
  const prompts: Record<string, string> = {
    subjects: `Tu analyses des fichiers pour pré-remplir la configuration des matières d'un établissement scolaire.
Extrait les informations suivantes si disponibles:
- Nom de la matière
- Code de la matière
- Catégorie (sciences, litterature, langues, arts, sport, technique, autre)
- Si c'est une langue étrangère, indique le code langue (en, es, de, it, pt, ar, zh, ru) et le niveau (LV1, LV2, LV3, Option, Spécialité)
- Coefficient
- Heures par semaine
- Si obligatoire ou optionnelle

Retourne un tableau JSON avec les matières détectées.`,

    students: `Tu analyses des fichiers pour pré-remplir l'inscription d'élèves.
Extrait les informations suivantes si disponibles:
- Email
- Prénom
- Nom
- Date de naissance (optionnel)
- Classe/Niveau (optionnel)

Retourne un tableau JSON avec les élèves détectés.`,

    classes: `Tu analyses des fichiers pour pré-remplir la création de classes.
Extrait les informations suivantes si disponibles:
- Nom de la classe
- Code
- Niveau (6ème, 5ème, etc.)
- Section (A, B, C, etc.)
- Capacité
- Salle

Retourne un tableau JSON avec les classes détectées.`,

    establishments: `Tu analyses des fichiers pour pré-remplir la création d'un établissement scolaire.
Extrait les informations suivantes si disponibles:
- Nom de l'établissement
- Type (école, collège, lycée, etc.)
- Adresse
- Téléphone
- Email
- Niveaux couverts

Retourne un objet JSON avec les informations détectées.`,

    linguistic_sections: `Tu analyses des fichiers pour configurer les sections linguistiques.
Extrait les informations suivantes si disponibles:
- Nom de la section
- Code
- Langue d'enseignement principale
- Description

Retourne un tableau JSON avec les sections linguistiques détectées.`,

    users: `Tu analyses des fichiers pour pré-remplir la création d'utilisateurs.
Extrait les informations suivantes si disponibles:
- Email
- Prénom
- Nom
- Rôle (teacher, student, parent_primary, etc.)

Retourne un tableau JSON avec les utilisateurs détectés.`,
  };

  return prompts[context] || prompts.subjects;
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, establishmentId, files } = (await req.json()) as AnalyzeRequest;

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ error: "Aucun fichier fourni" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing ${files.length} files for context: ${context}`);

    // Build content for AI
    const fileDescriptions = files.map((f) => {
      if (f.type === "image") {
        return `[Image: ${f.name}] - Contenu visuel à analyser`;
      }
      return `[${f.type.toUpperCase()}: ${f.name}]\n${f.content}`;
    }).join("\n\n---\n\n");

    const systemPrompt = getContextPrompt(context);

    // Prepare messages for the AI
    const messages: any[] = [
      {
        role: "system",
        content: `${systemPrompt}

INSTRUCTIONS IMPORTANTES:
- Réponds UNIQUEMENT en JSON valide
- Si tu ne trouves pas d'informations pertinentes, retourne un tableau vide []
- Ne fais pas d'hypothèses, n'invente pas de données
- Pour les images, décris ce que tu observes et extrait les informations textuelles visibles`,
      },
      {
        role: "user",
        content: `Analyse les fichiers suivants et extrait les informations pertinentes:\n\n${fileDescriptions}`,
      },
    ];

    // Check if any file is an image for multimodal handling
    const hasImages = files.some((f) => f.type === "image");
    
    if (hasImages) {
      // Use multimodal model for images
      const imageFiles = files.filter((f) => f.type === "image");
      const textFiles = files.filter((f) => f.type !== "image");

      // Build multimodal content
      const userContent: any[] = [
        {
          type: "text",
          text: `Analyse les fichiers suivants et extrait les informations pertinentes pour le contexte "${context}":\n\n${
            textFiles.map((f) => `[${f.type.toUpperCase()}: ${f.name}]\n${f.content}`).join("\n\n---\n\n")
          }`,
        },
      ];

      // Add images
      for (const img of imageFiles) {
        if (img.content.startsWith("data:")) {
          userContent.push({
            type: "image_url",
            image_url: { url: img.content },
          });
        }
      }

      messages[1] = {
        role: "user",
        content: userContent,
      };
    }

    // Call Lovable AI Gateway
    const response = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.2,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "[]";

    console.log("AI Response:", content);

    // Parse the JSON response
    let result;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      result = [];
    }

    // Generate suggestions based on context
    const suggestions: string[] = [];
    if (Array.isArray(result) && result.length > 0) {
      suggestions.push(`${result.length} élément(s) détecté(s) dans les fichiers`);
      suggestions.push("Vérifiez les informations avant de les appliquer");
    } else if (typeof result === "object" && Object.keys(result).length > 0) {
      suggestions.push("Informations détectées dans les fichiers");
      suggestions.push("Vérifiez les informations avant de les appliquer");
    } else {
      suggestions.push("Aucune information pertinente détectée");
      suggestions.push("Essayez avec un fichier différent ou plus détaillé");
    }

    return new Response(
      JSON.stringify({ 
        result, 
        suggestions,
        context,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in analyze-import:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
