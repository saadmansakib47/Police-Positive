import { useEffect, useState } from "react";

type TypingTextProps = {
  text: string;
  speed?: number; // ms per char
  className?: string;
};

const TypingText = ({ text, speed = 35, className }: TypingTextProps) => {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setDisplay((prev) => (i < text.length ? prev + text[i++] : prev));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <span className={className} aria-label={text}>
      {display}
      <span className="inline-block w-2 h-5 bg-foreground/70 ml-1 animate-blink align-baseline" />
    </span>
  );
};

export default TypingText;
