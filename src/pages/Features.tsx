import SEO from "@/components/SEO";

const Features = () => (
  <div className="container mx-auto py-12">
    <SEO title="Features — Police Positive" description="Explore key features of Police Positive." canonical="/features" />
    <h1 className="text-3xl font-bold mb-4">
      Features
    </h1>
    <ul className="list-disc pl-6 space-y-2 text-foreground/90">
      <li>Real-time dashboards for operators and supervisors</li>
      <li>AI-powered insights and prioritization</li>
      <li>Transparent civilian reporting and tracking</li>
    </ul>
  </div>
);

export default Features;
