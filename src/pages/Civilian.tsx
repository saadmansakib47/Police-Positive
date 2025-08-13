import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Civilian = () => (
  <div className="container mx-auto py-12">
    <SEO title="Civilian Portal — Police Positive" description="Report, track, and get AI assistance." canonical="/civilian" />
    <motion.h1 initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="text-3xl font-bold mb-6">
      Civilian Portal
    </motion.h1>
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader><CardTitle>Report Crime</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Submit GD or FIR with media uploads.</p>
          <Link to="/report"><Button>Report</Button></Link>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Track Complaint</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Follow your case priority and status.</p>
          <Link to="/track"><Button variant="secondary">Track</Button></Link>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>AI Chatbot</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-2">Consult if your case qualifies as GD or FIR.</p>
          <p className="text-xs text-muted-foreground">(Demo placeholder)</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default Civilian;
