import SEO from "@/components/SEO";
import { motion } from "framer-motion";

const Features = () => (
  <div className="container mx-auto py-12">
    <SEO title="Features — Police Positive" description="Explore key features of Police Positive." canonical="/features" />
    <motion.h1 initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="text-3xl font-bold mb-4">
      Features
    </motion.h1>
    <ul className="list-disc pl-6 space-y-2 text-foreground/90">
      <li>Real-time dashboards for operators and supervisors</li>
      <li>AI-powered insights and prioritization</li>
      <li>Transparent civilian reporting and tracking</li>
    </ul>
  </div>
);

export default Features;
