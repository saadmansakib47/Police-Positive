const Footer = () => {
  return (
    <footer className="border-t mt-16">
      <div className="container mx-auto py-10 grid gap-6 md:grid-cols-3 text-sm">
        <div>
          <div className="font-semibold mb-2">Police Positive</div>
          <p className="text-muted-foreground">Bridging citizens and police with transparency and speed.</p>
        </div>
        <nav className="grid gap-2">
          <a href="/about" className="hover:underline">About</a>
          <a href="/features" className="hover:underline">Features</a>
          <a href="/contact" className="hover:underline">Contact</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
        </nav>
        <div>
          <div className="font-semibold mb-2">Contact</div>
          <p className="text-muted-foreground">support@policepositive.app</p>
          <div className="mt-3 flex gap-3 text-muted-foreground">
            <a href="#" aria-label="Twitter" className="hover:text-foreground">Twitter</a>
            <a href="#" aria-label="LinkedIn" className="hover:text-foreground">LinkedIn</a>
            <a href="#" aria-label="GitHub" className="hover:text-foreground">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
