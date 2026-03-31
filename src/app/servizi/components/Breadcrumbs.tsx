import Link from "next/link";

type BreadcrumbsProps = {
  serviceName: string;
};

export default function Breadcrumbs({ serviceName }: BreadcrumbsProps) {
  return (
    <div className="max-w-7xl mx-auto px-8 pt-28 pb-4">
      <nav
        aria-label="Breadcrumb"
        className="font-mono uppercase text-[11px] tracking-[0.15em] flex items-center gap-2 text-foreground/40"
      >
        <Link
          href="/"
          className="hover:text-foreground transition-colors duration-200"
        >
          Home
        </Link>
        <span className="text-foreground/40">&gt;</span>
        <Link
          href="/#servizi"
          className="hover:text-foreground transition-colors duration-200"
        >
          Servizi
        </Link>
        <span className="text-foreground/40">&gt;</span>
        <span className="text-[#c9b99a]">{serviceName}</span>
      </nav>
    </div>
  );
}
