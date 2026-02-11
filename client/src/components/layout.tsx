import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Menu, X, Star } from "lucide-react";
import { useState } from "react";
import logoImage from "@assets/AISelect_20260209_183938_Instagram_1770702468454.jpg";

function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex items-center gap-1" data-testid="language-toggle">
      <Button
        size="sm"
        variant={lang === "en" ? "default" : "ghost"}
        onClick={() => setLang("en")}
        className="toggle-elevate"
        data-testid="button-lang-en"
      >
        EN
      </Button>
      <Button
        size="sm"
        variant={lang === "es" ? "default" : "ghost"}
        onClick={() => setLang("es")}
        className="toggle-elevate"
        data-testid="button-lang-es"
      >
        ES
      </Button>
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
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-background/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between gap-4 h-16">
        <Link href="/" data-testid="link-home-logo">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Phillyzon" className="h-10 w-10 rounded-md object-cover border border-primary/20" />
            <span className="font-display text-2xl gold-text tracking-widest">PHILLYZON</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8" data-testid="nav-desktop">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} data-testid={`link-nav-${item.href.replace("/", "") || "home"}`}>
              <span className={`text-sm font-medium tracking-wider uppercase transition-colors ${location === item.href ? "gold-text" : "text-foreground/40"}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-primary/10 bg-background px-4 py-3 space-y-2" data-testid="nav-mobile">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              <div
                className={`block py-2 text-sm font-medium tracking-wider uppercase ${location === item.href ? "gold-text" : "text-foreground/40"}`}
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
    <footer className="border-t border-primary/10 py-10 mt-auto film-grain">
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          <Link href="/admin/login" data-testid="link-footer-admin" className="opacity-100">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="Phillyzon" className="h-8 w-8 rounded-md object-cover border border-primary/20" />
              <span className="font-display text-xl gold-text tracking-widest">PHILLYZON</span>
            </div>
          </Link>

          <div className="star-divider">
            <Star className="h-3 w-3 fill-current" />
          </div>

          <p className="text-xs text-foreground/30 tracking-wider uppercase" data-testid="text-footer-rights">
            &copy; {new Date().getFullYear()} Phillyzon. {t("footer.rights")}
          </p>
        </div>
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
