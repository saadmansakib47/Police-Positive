import SEO from "@/components/SEO";
import Hero from "@/components/landing/Hero";
import UserTypeCards from "@/components/landing/UserTypeCards";
import FeaturesPreview from "@/components/landing/FeaturesPreview";
import Testimonials from "@/components/landing/Testimonials";

const Index = () => {
  return (
    <>
      <SEO title="Police Positive — Smart Police Dashboard" description="A smart dashboard bridging citizens and police for faster, transparent response." canonical="/" />
      <Hero />
      <section className="container mx-auto py-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 animate-fade-in-right">Our Mission</h2>
        <p className="text-muted-foreground max-w-3xl">
          This app is a smart law enforcement dashboard that helps civilians report crimes efficiently and enables police
          to respond faster and smarter.
        </p>
      </section>
      <UserTypeCards />
      <FeaturesPreview />
      <section className="container mx-auto py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 animate-fade-in-left">Quick Access</h2>
        <p className="text-muted-foreground">Use the "Report Crime" button in the header for instant access.</p>
      </section>
      <Testimonials />
    </>
  );
};

export default Index;
