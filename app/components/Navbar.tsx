import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/logo.png";
import { RainbowButton } from "@/components/ui/rainbow-button";

export function Navbar() {
  return (
    <div className="flex items-center justify-between py-5 px-6">
      <Link href="/" className="flex items-center gap-2 siz">
        <div className="w-8 h-8 sm:w-10 sm:h-10">
          <Image src={Logo} alt="Logo" className="object-contain" />
        </div>
        <h3 className="text-lg sm:text-2xl font-semibold">
          Invoice<span className="text-blue-500">Mate</span>
        </h3>
      </Link>
      <Link href="/login">
        <RainbowButton className="text-sm sm:text-base px-4 py-2">
          Get Started
        </RainbowButton>
      </Link>
    </div>
  );
}
