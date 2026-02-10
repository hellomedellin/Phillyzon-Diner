import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logoImage from "@assets/AISelect_20260209_183938_Instagram_1770702468454.jpg";

function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex items-center gap-0 border border-border rounded-md overflow-visible" data-testid="language-toggle">
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1 text-sm font-medium transition-colors ${lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        data-testid="button-lang-en"
      >
        EN
      </button>
      <button
        onClick={() => setLang("es")}
        className={`px-3 py-1 text-sm font-medium transition-colors ${lang === "es" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        data-testid="button-lang-es"
      >
        ES
      </button>
    </div>
  );
}

export function Header() {
  const { t } = useLanguage();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/menu", label: t("nav.menu") },
    { href: "/promotions", label: t("nav.promotions") },
    { href: "/visit", label: t("nav.visit") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between gap-4 h-16">
        <Link href="/" data-testid="link-home-logo">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Phillyzon" className="h-10 w-10 rounded-md object-cover" />
            <span className="font-serif text-xl font-bold gold-text tracking-wide">PHILLYZON</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6" data-testid="nav-desktop">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} data-testid={`link-nav-${item.href.replace("/", "") || "home"}`}>
              <span className={`text-sm font-medium transition-colors ${location === item.href ? "gold-text" : "text-muted-foreground"}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-background px-4 py-3 space-y-2" data-testid="nav-mobile">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              <div
                className={`block py-2 text-sm font-medium ${location === item.href ? "gold-text" : "text-muted-foreground"}`}
                data-testid={`link-mobile-${item.href.replace("/", "") || "home"}`}
              >
                {item.label}
              </div>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-border bg-card py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="Phillyzon" className="h-8 w-8 rounded-md object-cover" />
          <span className="font-serif text-lg font-bold gold-text">PHILLYZON</span>
        </div>
        <p className="text-sm text-muted-foreground" data-testid="text-footer-rights">
          &copy; {new Date().getFullYear()} Phillyzon. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
