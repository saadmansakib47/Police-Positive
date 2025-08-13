import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Operator = () => (
  <div className="container mx-auto py-12">
    <SEO title="Operator Dashboard — Police Positive" description="On-duty operator view." canonical="/operator" />
    <motion.h1 initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="text-3xl font-bold mb-6">
      Real-time Operator Dashboard
    </motion.h1>
    <div className="grid gap-6 md:grid-cols-3">
      {[
        { k: "Flare Alerts", v: 12 },
        { k: "Emergency Requests", v: 5 },
        { k: "Patrol Requests", v: 9 },
      ].map((m) => (
        <Card key={m.k}>
          <CardHeader><CardTitle>{m.k}</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{m.v}</div></CardContent>
        </Card>
      ))}
    </div>
    <div className="mt-8 grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Live Incidents</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>• Disturbance near Central Park — units en route</li>
            <li>• Robbery reported at 4th Ave — awaiting backup</li>
            <li>• Traffic accident at Elm St — ambulance requested</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Map Overview (placeholder)</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64 rounded-md bg-[conic-gradient(at_top_left,theme(colors.muted.DEFAULT),theme(colors.accent.DEFAULT),theme(colors.primary.DEFAULT))]" />
        </CardContent>
      </Card>
    </div>
  </div>
);

export default Operator;
