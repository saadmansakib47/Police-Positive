import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Track = () => (
  <div className="container mx-auto py-12">
    <SEO title="Track Complaint — Police Positive" description="Check the status and priority of your complaint." canonical="/track" />
    <motion.h1 initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="text-3xl font-bold mb-6">
      Track Your Complaint
    </motion.h1>
    <div className="max-w-xl grid gap-4">
      <Input placeholder="Enter Case ID or Phone Number" />
      <Button>Check Status</Button>
      <div className="rounded-md border p-4 text-sm text-muted-foreground">
        Results will appear here (demo).
      </div>
    </div>
  </div>
);

export default Track;
