import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const Patrol = () => (
  <div className="container mx-auto py-12">
    <SEO title="Request Patrol — Police Positive" description="Ask for increased police presence." canonical="/patrol" />
    <motion.h1 initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="text-3xl font-bold mb-6">
      Request Patrol
    </motion.h1>
    <form className="max-w-xl grid gap-4">
      <Input placeholder="Location / Area" />
      <Textarea placeholder="Reason / Details" rows={5} />
      <Button type="button">Send Request</Button>
    </form>
  </div>
);

export default Patrol;
