import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const UserTypeCards = () => {
  const items = [
    { title: "Police Operator View", desc: "Track reports, manage patrols, handle emergencies.", to: "/operator" },
    { title: "Supervisor View", desc: "Monitor performance, oversee cases, maintain accountability.", to: "/supervisor" },
    { title: "Civilian View", desc: "Report crimes, track complaints, interact with AI chatbot.", to: "/civilian" },
  ];
  return (
    <section className="container mx-auto py-12">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 animate-fade-in-right">Choose Your View</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((it) => (
          <Link key={it.title} to={it.to} className="hover-scale">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{it.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{it.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default UserTypeCards;
