import Link from "next/link";
import { siteConfig } from "../data/config";

export default function Footer() {
  return (
    <footer className="border-t border-border py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <Link
              href="/"
              className="font-display text-lg text-foreground hover:text-accent transition-colors"
            >
              {siteConfig.companyName}
            </Link>
            <p className="text-xs text-muted mt-1 font-mono">
              P.IVA: XX XXX XXX XXX
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-xs text-muted">
            <a
              href="https://edizioniduepuntozero.it/privacy-gdpr/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <span>
              © {new Date().getFullYear()} {siteConfig.companyFullName}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
