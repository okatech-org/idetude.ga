import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DemoUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  isDemo: boolean;
}

// Map display roles to app_role enum values
function mapToAppRole(displayRole: string): string {
  const roleMap: Record<string, string> = {
    // Super Admin
    "Super Administrateur": "super_admin",
    
    // Regional/Ministry level
    "Inspecteur Général": "regional_admin",
    "Directeur Enseignement": "regional_admin",
    "Conseiller Technique": "regional_admin",
    "Recteur": "regional_admin",
    "Inspecteur d'Académie": "regional_admin",
    "Secrétaire Général": "regional_admin",
    "Directeur Enseignement Primaire": "regional_admin",
    "Directeur Enseignement Secondaire": "regional_admin",
    "Directeur Provincial": "regional_admin",
    "Inspecteur Provincial": "regional_admin",
    
    // School Group Direction
    "Directeur Général": "school_director",
    "DAF": "school_admin",
    
    // School Administration
    "Directeur": "school_director",
    "Principal": "school_director",
    "Proviseur": "school_director",
    "Préfet des Études": "school_director",
    "Préfet": "school_director",
    "Principal Adjoint": "school_admin",
    "Proviseur Adjoint": "school_admin",
    "Secrétaire": "school_admin",
    "Secrétaire Académique": "school_admin",
    "CPE": "cpe",
    "Intendant": "school_admin",
    "Chef d'Atelier": "school_admin",
    "Directeur Discipline": "cpe",
    "Secrétaire Général Académique": "school_admin",
    "Directeur des Études": "school_admin",
    
    // Teachers
    "Prof. CM2-A": "main_teacher",
    "Prof. CE1-B": "teacher",
    "Prof. Maths 3ème-A": "main_teacher",
    "Prof. Français": "teacher",
    "Prof. SVT": "teacher",
    "Prof. Principal Tle S": "main_teacher",
    "Prof. Philosophie": "teacher",
    "Titulaire 6ème année": "main_teacher",
    "Titulaire 3ème année": "teacher",
    "Prof. Mathématiques": "teacher",
    "Prof. Sciences": "teacher",
    "Prof. Électricité": "teacher",
    "Prof. Informatique": "teacher",
    "Chef de Travaux Sciences": "main_teacher",
    "Professeur Pédagogie": "teacher",
    
    // Students
    "Élève CM2-A": "student",
    "Élève CE1-B": "student",
    "Élève 3ème-A": "student",
    "Élève 6ème-B": "student",
    "Élève Terminale S": "student",
    "Élève 2nde": "student",
    "Élève 6ème année": "student",
    "Élève 3ème année": "student",
    "Élève 4ème secondaire": "student",
    "Élève 2ème secondaire": "student",
    "Élève 6ème Électricité": "student",
    "Élève 5ème Informatique": "student",
    "Étudiant G3 Sciences": "student",
    "Étudiante G1 Lettres": "student",
    
    // Parents
    "Parent de Kévin": "parent_primary",
    "Parent d'Estelle": "parent_primary",
    "Parent d'Olivier": "parent_primary",
    "Parent de Jean-Pierre": "parent_primary",
    "Parent de Patrick": "parent_primary",
    "Parent de Christian": "parent_primary",
    "Parent de David": "parent_primary",
    "Parent d'Alain": "parent_primary",
  };
  
  // Check for partial matches for dynamic roles
  for (const [key, value] of Object.entries(roleMap)) {
    if (displayRole.includes(key) || key.includes(displayRole)) {
      return value;
    }
  }
  
  // Check for patterns
  if (displayRole.startsWith("Prof.") || displayRole.startsWith("Professeur") || displayRole.startsWith("Titulaire")) {
    return "teacher";
  }
  if (displayRole.startsWith("Élève") || displayRole.startsWith("Étudiant")) {
    return "student";
  }
  if (displayRole.startsWith("Parent")) {
    return "parent_primary";
  }
  
  // Default fallback
  return "student";
}

function parseNameToFirstLast(fullName: string): { firstName: string; lastName: string } {
  // Handle prefixes like "M.", "Mme", "Prof.", "Dr.", "Père", "Sœur"
  const prefixes = ["M.", "Mme", "Prof.", "Dr.", "Père", "Sœur"];
  let cleanName = fullName;
  
  for (const prefix of prefixes) {
    if (cleanName.startsWith(prefix + " ")) {
      cleanName = cleanName.substring(prefix.length + 1);
      break;
    }
  }
  
  const parts = cleanName.trim().split(" ");
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  
  // First word is first name, rest is last name
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { action, email, password, name, displayRole } = await req.json();

    if (action === "init") {
      // Initialize a specific demo account
      const userEmail = email || "superadmin@demo.idetude.app";
      const userPassword = password || "Demo2025!";
      const userName = name || "Super Admin";
      const userDisplayRole = displayRole || "Super Administrateur";
      
      // Parse name
      const { firstName, lastName } = parseNameToFirstLast(userName);
      
      // Map display role to app_role
      const appRole = mapToAppRole(userDisplayRole);

      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find((u) => u.email === userEmail);

      if (existingUser) {
        console.log(`User ${userEmail} already exists`);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Demo account already exists",
            userId: existingUser.id,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Create the demo user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        password: userPassword,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
        },
      });

      if (createError) {
        console.error("Error creating user:", createError);
        throw createError;
      }

      console.log(`Created user ${userEmail} with ID ${newUser.user.id}`);

      // Update profile to mark as demo
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ is_demo: true })
        .eq("id", newUser.user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
      }

      // Check if role already exists for this user
      const { data: existingRole } = await supabaseAdmin
        .from("user_roles")
        .select("*")
        .eq("user_id", newUser.user.id)
        .eq("role", appRole)
        .maybeSingle();

      if (!existingRole) {
        // Assign role
        const { error: roleError } = await supabaseAdmin
          .from("user_roles")
          .insert({
            user_id: newUser.user.id,
            role: appRole,
          });

        if (roleError) {
          console.error("Error assigning role:", roleError);
          throw roleError;
        }
        console.log(`Assigned role ${appRole} to user ${userEmail}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Demo account created successfully`,
          userId: newUser.user.id,
          role: appRole,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
