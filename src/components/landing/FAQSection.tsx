import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GlassCard } from "@/components/ui/glass-card";

const faqItems = [
  {
    question: "Est-ce que ça fonctionne sans internet ?",
    answer: "Oui ! L'application mobile fonctionne hors connexion. Les données se synchronisent automatiquement dès que vous retrouvez une connexion. Idéal pour les zones à connectivité variable.",
  },
  {
    question: "Comment migrer mes données existantes ?",
    answer: "Notre équipe vous accompagne gratuitement pour importer vos listes d'élèves, enseignants et historiques de notes depuis Excel ou tout autre système.",
  },
  {
    question: "Les parents doivent-ils avoir un smartphone ?",
    answer: "Non ! Les parents peuvent recevoir les notifications par SMS et consulter les infos via un navigateur web sur n'importe quel téléphone.",
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: "Absolument. Vos données sont chiffrées, hébergées sur des serveurs en Afrique, avec des sauvegardes quotidiennes. Nous sommes conformes au RGPD.",
  },
  {
    question: "Puis-je tester avant de m'engager ?",
    answer: "Oui ! Profitez de 30 jours d'essai gratuit avec toutes les fonctionnalités, sans carte bancaire requise.",
  },
  {
    question: "Et si j'ai besoin d'aide ?",
    answer: "Notre support est disponible par email, WhatsApp et téléphone. Les établissements Premium bénéficient d'un accompagnement personnalisé.",
  },
];

export const FAQSection = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ❓ Questions fréquentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tout ce que vous devez savoir avant de commencer
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <GlassCard className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-foreground hover:text-primary">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </GlassCard>
        </div>
      </div>
    </section>
  );
};
