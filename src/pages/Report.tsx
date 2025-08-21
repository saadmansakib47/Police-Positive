<<<<<<< HEAD
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import CrimeReportForm from '@/components/forms/CrimeReportForm';
import { complaintsAPI } from '@/lib/api/complaints';
import { CreateComplaintData } from '@/types/complaint';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Report = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data: CreateComplaintData) => {
    setIsSubmitting(true);
    try {
      const complaint = await complaintsAPI.createComplaint(data);
      
      toast.success('Report submitted successfully!', {
        description: `Case number: ${complaint.caseNumber}`,
      });
      
      // Redirect to track page or complaint details
      navigate(`/track?case=${complaint.caseNumber}`);
    } catch (error: Error | unknown) {
      toast.error('Failed to submit report', {
        description: error instanceof Error ? error.message : 'Please try again later',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <SEO 
        title="Report Crime — Police Positive" 
        description="Submit a detailed crime report with evidence and location information" 
        canonical="/report" 
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold">Report a Crime</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Submit a detailed report about criminal activity. Your information helps law enforcement 
            respond effectively and keep the community safe.
          </p>
        </div>

        {/* Authentication Notice */}
        {!isAuthenticated && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You can submit reports anonymously, but creating an account allows you to track 
              your complaints and receive updates.
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <CrimeReportForm onSubmit={handleSubmit} isLoading={isSubmitting} />
      </motion.div>
=======
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
>>>>>>> dev
    </div>
  );
};

export default Report;
