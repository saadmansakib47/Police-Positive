import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import QuickReportDialog from "../landing/QuickReportDialog";

const Header = () => {
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `${isActive ? "text-primary" : "text-foreground/80 hover:text-foreground"} story-link`;

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b">
      <div className="container mx-auto flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">👮</span>
          Police Positive
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" end className={linkCls}>Home</NavLink>
          <NavLink to="/about" className={linkCls}>About</NavLink>
          <NavLink to="/features" className={linkCls}>Features</NavLink>
          <NavLink to="/contact" className={linkCls}>Contact</NavLink>
          <NavLink to="/operator" className={linkCls}>Operator</NavLink>
          <NavLink to="/supervisor" className={linkCls}>Supervisor</NavLink>
          <NavLink to="/civilian" className={linkCls}>Civilian</NavLink>
        </nav>
        <div className="flex items-center gap-3">
          <QuickReportDialog>
            <Button size="sm" className="hover-scale">Report Crime</Button>
          </QuickReportDialog>
        </div>
      </div>
    </header>
  );
};

export default Header;
