import { CheckCircle2, ShieldCheck, MessageSquareLock, Bot } from "lucide-react";

const items = [
  { title: "Real-time patrol requests", Icon: ShieldCheck },
  { title: "AI chatbot for complaint categorization", Icon: Bot },
  { title: "Priority queue for case tracking", Icon: CheckCircle2 },
  { title: "Anonymous reporting system", Icon: MessageSquareLock },
  { title: "Secure, encrypted submissions", Icon: MessageSquareLock },
];

const FeaturesPreview = () => {
  return (
    <section className="container mx-auto py-12">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 animate-fade-in-left">Key Features</h2>
      <ul className="grid gap-4 md:grid-cols-2">
        {items.map(({ title, Icon }) => (
          <li key={title} className="flex items-start gap-3 p-4 rounded-md border hover-scale">
            <Icon className="h-5 w-5 text-primary mt-1" />
            <span className="text-foreground/90">{title}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default FeaturesPreview;
