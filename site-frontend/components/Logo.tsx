import Image from "next/image";
import Link from "next/link";

export function Logo({ size = 44 }: { size?: number }) {
  return (
    <Image src="/logo.svg" alt="VolunSys-UY1" width={size} height={size} priority className="rounded-xl" />
  );
}

export function LogoWithText() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <Logo />
      <div>
        <p className="text-lg font-bold leading-tight text-white">VolunSys-UY1</p>
        <p className="text-xs text-cyan-300">Calcul volontaire UY1</p>
      </div>
    </Link>
  );
}
