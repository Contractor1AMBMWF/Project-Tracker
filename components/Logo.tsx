import Image from "next/image";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Ambassador"
      width={97}
      height={101}
      className={className}
      unoptimized
    />
  );
}
