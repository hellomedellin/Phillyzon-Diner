import { useLanguage } from "@/lib/language-context";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { PublicLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, Clock, ChevronDown } from "lucide-react";
import { formatPrice } from "@/lib/i18n";
import type { MenuItem, Promotion } from "@shared/schema";
import logoImage from "@assets/AISelect_20260209_183938_Instagram_1770702468454.jpg";
import heroImage2 from "@assets/Screenshot_2026-02-10_112516_1770751825145.png";
import foodHeroImage from "@assets/food-hero.jpg";

function getUrgencyLabel(promo: Promotion, lang: "en" | "es"): string | null {
  if (!promo.endDate) return null;
  const end = new Date(promo.endDate);
  const now = new Date();
  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 0) return null;
  if (daysLeft <= 3) return lang === "en" ? "Ends Soon" : "Termina Pronto";
  if (daysLeft <= 7) return lang === "en" ? "This Week" : "Esta Semana";
  return lang === "en" ? "Limited Time" : "Tiempo Limitado";
}

function HeroSection() {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden" data-testid="section-hero">
      <div className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src={foodHeroImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/65 via-background/25 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/55 via-transparent to-background/55" />
          <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto py-24">
          <div className="mb-6 flex justify-center">
            <img
              src={logoImage}
              alt="Phillyzon"
              className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover border-2 border-primary/40 shadow-2xl"
              data-testid="img-hero-logo"
            />
          </div>

          <h1
            className="font-display text-5xl md:text-7xl lg:text-8xl gold-text mb-4 tracking-wider"
            data-testid="text-hero-tagline"
          >
            {t("hero.tagline")}
          </h1>

          <div className="star-divider my-6">
            <Star className="h-3 w-3 fill-current" />
          </div>

          <p
            className="text-base md:text-lg text-foreground/70 mb-10 max-w-xl mx-auto font-light italic font-serif"
            style={{ textTransform: "none" }}
            data-testid="text-hero-subtitle"
          >
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/menu">
              <Button size="lg" className="font-display text-lg tracking-wider px-10 py-6" data-testid="button-hero-cta">
                {t("hero.cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/visit">
              <Button size="lg" variant="outline" className="font-display text-lg tracking-wider px-10 py-6 border-primary/30 hover:border-primary">
                {t("nav.visit")}
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-foreground/25 animate-bounce">
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>
    </section>
  );
}

function FeaturedSection() {
  const { t, bilingual } = useLanguage();
  const { data: items, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items/featured"],
  });

  return (
    <section className="py-20 md:py-28 px-4 relative film-grain" data-testid="section-featured">
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className="section-title text-3xl md:text-4xl"
            data-testid="text-featured-title"
          >
            {t("home.featured")}
          </h2>
          <div className="star-divider mt-5">
            <Star className="h-3 w-3 fill-current" />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-0 overflow-hidden">
                <Skeleton className="h-56 w-full" />
                <div className="p-6">
                  <Skeleton className="h-5 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : items && items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.map((item) => (
              <Card
                key={item.id}
                className="p-0 overflow-hidden hover-elevate group border-primary/10"
                data-testid={`card-featured-${item.id}`}
              >
                <div className="overflow-hidden aspect-[4/3]">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={bilingual(item, "name")}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Star className="h-8 w-8 text-primary/20" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3
                    className="font-serif text-lg font-semibold gold-text mb-2"
                    style={{ textTransform: "none" }}
                    data-testid={`text-featured-name-${item.id}`}
                  >
                    {bilingual(item, "name")}
                  </h3>
                  <p
                    className="text-sm text-foreground/50 mb-5 line-clamp-2 italic"
                    style={{ textTransform: "none", letterSpacing: "normal" }}
                    data-testid={`text-featured-desc-${item.id}`}
                  >
                    {bilingual(item, "description")}
                  </p>
                  <div className="flex items-center justify-between">
                    <p
                      className="font-display text-2xl gold-text tracking-wider"
                      data-testid={`text-featured-price-${item.id}`}
                    >
                      ${formatPrice(item.price)}
                    </p>
                    <Star className="h-4 w-4 text-primary/40 fill-primary/20" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : null}

        <div className="text-center mt-14">
          <Link href="/menu">
            <Button variant="outline" className="font-display text-base tracking-wider px-10 py-5 border-primary/30 hover:border-primary/70" data-testid="button-featured-viewmenu">
              {t("hero.cta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function StorySection() {
  const { t } = useLanguage();
  return (
    <section className="py-20 md:py-28 px-4 relative overflow-hidden" data-testid="section-story">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/20 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-[4/3] rounded-md overflow-hidden">
              <img
                src={foodHeroImage}
                alt="Phillyzon food"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-28 h-28 border-2 border-primary/20 rounded-md pointer-events-none" />
            <div className="absolute -top-4 -left-4 w-16 h-16 border border-primary/10 rounded-md pointer-events-none" />
          </div>

          <div>
            <h2
              className="section-title text-3xl md:text-4xl mb-6"
              data-testid="text-story-title"
            >
              {t("home.story.title")}
            </h2>
            <div className="star-divider mb-8">
              <Star className="h-3 w-3 fill-current" />
            </div>
            <p
              className="text-foreground/65 leading-relaxed text-base md:text-lg font-light font-serif"
              style={{ textTransform: "none", letterSpacing: "normal" }}
              data-testid="text-story-body"
            >
              {t("home.story.text")}
            </p>
            <div className="mt-10">
              <Link href="/visit">
                <Button variant="ghost" className="font-display tracking-wider text-primary/70 hover:text-primary px-0">
                  {t("nav.visit")} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PromotionsPreview() {
  const { t, bilingual, lang } = useLanguage();
  const { data: promos } = useQuery<Promotion[]>({
    queryKey: ["/api/promotions/active"],
  });

  if (!promos || promos.length === 0) return null;

  const displayPromos = promos.slice(0, 3);

  return (
    <section className="py-20 md:py-28 px-4 relative" data-testid="section-home-promos">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={heroImage2}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className="section-title text-3xl md:text-4xl marquee-glow"
            data-testid="text-home-promos-title"
          >
            {t("promo.title")}
          </h2>
          <div className="star-divider mt-5">
            <Star className="h-3 w-3 fill-current" />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {displayPromos.map((promo) => {
            const urgency = getUrgencyLabel(promo, lang);
            return (
              <Card
                key={promo.id}
                className="w-full md:w-80 p-0 overflow-hidden hover-elevate group border-primary/10"
                data-testid={`card-home-promo-${promo.id}`}
              >
                {promo.imageUrl && (
                  <div className="overflow-hidden aspect-[16/9]">
                    <img
                      src={promo.imageUrl}
                      alt={bilingual(promo, "title")}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-serif text-base font-semibold gold-text mb-2" style={{ textTransform: "none" }}>
                    {bilingual(promo, "title")}
                  </h3>
                  {urgency && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <Badge variant="default" className="text-xs font-display tracking-wider">
                        {urgency}
                      </Badge>
                    </div>
                  )}
                  <p
                    className="text-sm text-foreground/50 line-clamp-2"
                    style={{ textTransform: "none", letterSpacing: "normal" }}
                  >
                    {bilingual(promo, "description")}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link href="/promotions">
            <Button variant="outline" className="font-display text-base tracking-wider px-10 py-5 border-primary/30 hover:border-primary/70" data-testid="button-home-viewpromos">
              {t("promo.viewAll")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <PublicLayout>
      <HeroSection />
      <FeaturedSection />
      <StorySection />
      <PromotionsPreview />
    </PublicLayout>
  );
}
