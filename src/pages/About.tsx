import SEO from "@/components/SEO";
import { motion } from "framer-motion";

const About = () => (
  <div className="container mx-auto py-12">
    <SEO title="About — Police Positive" description="Learn about the mission of Police Positive." canonical="/about" />
    <motion.h1 initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="text-3xl font-bold mb-4">
      About Police Positive
    </motion.h1>
    <p className="text-muted-foreground max-w-3xl">
      Police Positive enhances responsiveness, transparency, and public trust by streamlining communication between
      civilians, on-duty police operators, and supervisors.
    </p>
  </div>
);

export default About;
