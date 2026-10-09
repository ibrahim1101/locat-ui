/** Locat brand lockup. The mark is the exact approved artwork from /locat-mark.png. */
export function LocatMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <img
      src="/locat-mark.png"
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`select-none rounded-[24%] object-cover ${className}`}
    />
  );
}

export function LocatWordmark({ className = "" }: { className?: string }) {
  return <span className={`locat-wordmark ${className}`}>Locat</span>;
}
