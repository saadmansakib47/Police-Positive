import { motion } from "framer-motion";
import TypingText from "../common/TypingText";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import QuickReportDialog from "./QuickReportDialog";

const fadeLeft = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const fadeRight = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto grid gap-8 py-16 md:py-24 md:grid-cols-2 items-center">
        <motion.div variants={fadeLeft} initial="initial" animate="animate">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight animate-fade-in-left">
            Bridging Citizens and Police with Transparency and Speed
          </h1>
          <TypingText
            text="A smart dashboard connecting civilians, operators, and supervisors to respond faster and smarter."
            className="mt-4 block text-lg text-muted-foreground"
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <QuickReportDialog>
              <Button size="lg" className="hover-scale">🔵 Report a Crime</Button>
            </QuickReportDialog>
            <Link to="/track"><Button size="lg" variant="secondary" className="hover-scale">🟡 Track Your Complaint</Button></Link>
            <Link to="/patrol"><Button size="lg" variant="outline" className="hover-scale">🟢 Request Patrol</Button></Link>
          </div>
        </motion.div>

        <motion.div variants={fadeRight} initial="initial" animate="animate">
          <div className="rounded-lg border p-6 shadow-[var(--shadow-elevated)] bg-card">
            <div className="text-sm text-muted-foreground">Live Overview</div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-md bg-accent text-accent-foreground p-4">
                <div className="text-xs uppercase opacity-90">Flare Alerts</div>
                <div className="text-2xl font-bold">12</div>
              </div>
              <div className="rounded-md bg-primary text-primary-foreground p-4">
                <div className="text-xs uppercase opacity-90">Emergencies</div>
                <div className="text-2xl font-bold">5</div>
              </div>
              <div className="rounded-md bg-muted p-4">
                <div className="text-xs uppercase opacity-90">Pending Cases</div>
                <div className="text-2xl font-bold">37</div>
              </div>
              <div className="rounded-md bg-muted p-4">
                <div className="text-xs uppercase opacity-90">Avg Response</div>
                <div className="text-2xl font-bold">7m 42s</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,theme(colors.accent.DEFAULT)/.15,transparent_40%),radial-gradient(ellipse_at_bottom_left,theme(colors.primary.DEFAULT)/.12,transparent_40%)]" />
    </section>
  );
};

export default Hero;
