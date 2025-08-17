import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const Contact = () => (
  <div className="container mx-auto py-12">
    <SEO title="Contact — Police Positive" description="Get in touch with Police Positive." canonical="/contact" />
    <motion.h1 initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="text-3xl font-bold mb-4">
      Contact
    </motion.h1>
    <form className="max-w-xl grid gap-4">
      <Input placeholder="Your Name" />
      <Input placeholder="Email" type="email" />
      <Textarea placeholder="Message" rows={5} />
      <Button type="button">Send</Button>
    </form>
  </div>
);

export default Contact;
