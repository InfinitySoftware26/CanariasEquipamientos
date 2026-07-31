import Link from "next/link";
import { cn } from "@/lib/utils";

interface AddButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function AddButtonLink({ href, children, className }: AddButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-[#F5A300] px-5 py-3 font-semibold !text-[#0D1B2A] transition hover:bg-[#ffb82c]",
        className,
      )}
    >
      {children}
    </Link>
  );
}
