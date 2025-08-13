import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const data = [
  { name: "Mon", resolved: 30 },
  { name: "Tue", resolved: 24 },
  { name: "Wed", resolved: 35 },
  { name: "Thu", resolved: 20 },
  { name: "Fri", resolved: 40 },
];
const pie = [
  { name: "Pending", value: 42 },
  { name: "Resolved", value: 118 },
];
const COLORS = ["hsl(var(--accent))", "hsl(var(--primary))"];

const Supervisor = () => (
  <div className="container mx-auto py-12">
    <SEO title="Supervisor Dashboard — Police Positive" description="High-level monitoring for supervisors." canonical="/supervisor" />
    <motion.h1 initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="text-3xl font-bold mb-6">
      Supervisor Monitoring
    </motion.h1>
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Resolved Complaints (last 5 days)</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Line type="monotone" dataKey="resolved" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Pending vs Resolved</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                {pie.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default Supervisor;
