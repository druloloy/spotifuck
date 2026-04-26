interface KineticTextProps {
  text: string;
  className?: string;
  staggerMs?: number;
}

export default function KineticText({ text, className = '', staggerMs = 110 }: KineticTextProps) {
  return (
    <span className={className}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="kinetic-letter"
          style={{ animationDelay: `${i * staggerMs}ms` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}
