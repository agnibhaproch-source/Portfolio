/** Placeholder figure that holds the photo space until the owner's photo arrives. */
export function Silhouette({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 250" className={className}>
      <circle cx="100" cy="80" r="42" fill="currentColor" />
      <path d="M20 250c0-60 36-100 80-100s80 40 80 100z" fill="currentColor" />
    </svg>
  );
}
