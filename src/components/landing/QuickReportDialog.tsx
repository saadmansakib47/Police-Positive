import { PropsWithChildren, useCallback, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const RATE_LIMIT_SECONDS = 60; // simple client-side limiter

const QuickReportDialog = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const { toast } = useToast();

  const handleSubmit = useCallback(() => {
    const last = Number(localStorage.getItem("pp:lastReportTs") || 0);
    const now = Date.now();
    const diff = Math.floor((now - last) / 1000);
    if (diff < RATE_LIMIT_SECONDS) {
      toast({ title: "Slow down", description: `Please wait ${RATE_LIMIT_SECONDS - diff}s before sending again.` });
      return;
    }

    if (!phone || details.length < 10) {
      toast({ title: "Missing info", description: "Enter a valid phone and at least 10 characters." });
      return;
    }

    localStorage.setItem("pp:lastReportTs", String(now));
    toast({ title: "Submitted", description: "Your quick report has been recorded (demo)." });
    setOpen(false);
    setPhone("");
    setDetails("");
  }, [phone, details, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Crime Report</DialogTitle>
          <DialogDescription>Provide your phone and a short description. Requests are rate-limited to prevent spam.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="phone">Phone number</label>
            <Input id="phone" placeholder="e.g., +1 555 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label htmlFor="details">Short description</label>
            <Textarea id="details" placeholder="Describe the incident..." value={details} onChange={(e) => setDetails(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuickReportDialog;
