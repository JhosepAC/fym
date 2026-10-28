import Image from "next/image";

export default function Logo() {
  return (
    <Image
      className="fym-logo"
      src="/fym-logo.svg"
      alt="FyM"
      width={111}
      height={36}
      unoptimized
      priority
    />
  );
}
