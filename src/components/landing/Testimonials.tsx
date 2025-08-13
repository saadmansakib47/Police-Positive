const Testimonials = () => {
  const quotes = [
    {
      q: "This could transform how quickly we respond to emergencies.",
      a: "— On-duty operator",
    },
    {
      q: "The accountability tooling is exactly what we need.",
      a: "— Police supervisor",
    },
    {
      q: "Finally a simple way to report and track cases.",
      a: "— Community advocate",
    },
  ];
  return (
    <section className="container mx-auto py-12">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 animate-fade-in-right">Community Trust</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {quotes.map((t) => (
          <figure key={t.q} className="rounded-md border p-6 bg-card shadow-sm">
            <blockquote className="text-foreground">“{t.q}”</blockquote>
            <figcaption className="mt-3 text-sm text-muted-foreground">{t.a}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
