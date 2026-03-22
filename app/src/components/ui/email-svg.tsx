export function EmailSVG({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 20"
      fill="currentColor"
      className={className}
      style={{ pointerEvents: "none", userSelect: "none" }}
      aria-hidden="true"
    >
      <text
        x="0"
        y="15"
        fontFamily="inherit"
        fontSize="14"
        fontWeight="500"
      >
        &#104;&#101;&#108;&#108;&#111;&#64;&#105;&#118;&#111;&#105;&#114;&#101;&#46;&#105;&#111;
      </text>
    </svg>
  );
}
