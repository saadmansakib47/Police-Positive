import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const Report = () => {
  const { toast } = useToast();
  return (
    <div className="container mx-auto py-12">
      <SEO title="Report Crime — Police Positive" description="Submit GD or FIR online." canonical="/report" />
      <motion.h1 initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="text-3xl font-bold mb-6">
        Report a Crime (Demo)
      </motion.h1>
      <form className="max-w-2xl grid gap-4" onSubmit={(e) => { e.preventDefault(); toast({ title: "Submitted", description: "Your report has been submitted (demo)." }); }}>
        <Input placeholder="Full Name (optional for anonymous)" />
        <Input placeholder="Phone Number" required />
        <Input placeholder="Location (auto-detect in full version)" />
        <Select>
          <SelectTrigger><SelectValue placeholder="Select GD or FIR" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="gd">General Diary (GD)</SelectItem>
            <SelectItem value="fir">First Information Report (FIR)</SelectItem>
          </SelectContent>
        </Select>
        <Textarea placeholder="Describe the incident..." rows={6} required />
        <input type="file" multiple aria-label="Upload media" />
        <div className="flex gap-3">
          <Button type="submit">Submit</Button>
          <Button type="button" variant="secondary">Submit Anonymously</Button>
        </div>
      </form>
    </div>
  );
};

export default Report;
