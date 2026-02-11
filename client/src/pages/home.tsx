import { useLanguage } from "@/lib/language-context";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { PublicLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, Clock } from "lucide-react";
import { formatPrice } from "@/lib/i18n";
import type { MenuItem, Promotion } from "@shared/schema";
import logoImage from "@assets/AISelect_20260209_183938_Instagram_1770702468454.jpg";
import heroImage1 from "@assets/Screenshot_2026-02-10_112633_1770751825144.png";
import heroImage2 from "@assets/Screenshot_2026-02-10_112516_1770751825145.png";
import foodImage from "@assets/Screenshot_2026-02-10_112713_1770751825144.png";

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
    <section className="relative overflow-visible" data-testid="section-hero">
      <div className="relative min-h-[75vh] md:min-h-[85vh] flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={heroImage1}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto py-16">
          <div className="mb-8 flex justify-center">
            <img
              src={logoImage}
              alt="Phillyzon"
              className="w-28 h-28 md:w-36 md:h-36 rounded-md object-cover border-2 border-primary/30"
              data-testid="img-hero-logo"
            />
          </div>

          <h1
            className="font-display text-5xl md:text-7xl lg:text-8xl gold-text mb-4 tracking-wider"
            data-testid="text-hero-tagline"
          >
            {t("hero.tagline")}
          </h1>

          <div className="star-divider my-8">
            <Star className="h-3 w-3 fill-current" />
          </div>

          <p
            className="text-base md:text-lg text-foreground/70 mb-12 max-w-xl mx-auto font-light italic font-serif lowercase"
            style={{ textTransform: "none" }}
            data-testid="text-hero-subtitle"
          >
            {t("hero.subtitle")}
          </p>

          <Link href="/menu">
            <Button size="lg" className="font-display text-lg tracking-wider px-10 py-6" data-testid="button-hero-cta">
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
    <section className="py-24 md:py-32 px-4 film-grain" data-testid="section-story">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="rounded-md overflow-hidden">
              <img
                src={foodImage}
                alt="El arte de la comida"
                className="w-full h-72 md:h-96 object-cover"
              />
            </div>
            <div className="absolute -bottom-3 -right-3 w-24 h-24 border-2 border-primary/20 rounded-md" />
          </div>

          <div>
            <h2
              className="marquee-header text-2xl md:text-3xl mb-10"
              data-testid="text-story-title"
            >
              {t("home.story.title")}
            </h2>
            <p
              className="text-foreground/60 leading-relaxed text-base md:text-lg font-light"
              style={{ textTransform: "none", letterSpacing: "normal" }}
              data-testid="text-story-body"
            >
              {t("home.story.text")}
            </p>

            <div className="star-divider mt-10">
              <Star className="h-3 w-3 fill-current" />
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
    <section className="py-24 md:py-32 px-4 relative" data-testid="section-home-promos">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={heroImage2}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className="marquee-header text-2xl md:text-3xl marquee-glow"
            data-testid="text-home-promos-title"
          >
            {t("promo.title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayPromos.map((promo) => {
            const urgency = getUrgencyLabel(promo, lang);
            return (
              <Card
                key={promo.id}
                className="p-0 overflow-visible hover-elevate group"
                data-testid={`card-home-promo-${promo.id}`}
              >
                {promo.imageUrl && (
                  <div className="overflow-hidden rounded-t-md">
                    <img
                      src={promo.imageUrl}
                      alt={bilingual(promo, "title")}
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-serif text-base font-semibold gold-text" style={{ textTransform: "none" }}>
                      {bilingual(promo, "title")}
                    </h3>
                  </div>
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
            <Button variant="outline" className="font-display text-base tracking-wider px-8" data-testid="button-home-viewpromos">
              {t("promo.viewAll")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function CinemaShowcase() {
  const { t } = useLanguage();
  return (
    <section className="py-20 md:py-28 relative" data-testid="section-cinema">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={heroImage2}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <h2 className="font-display text-3xl md:text-5xl gold-text tracking-wider mb-4">
          PHILLYZON
        </h2>
        <p className="font-display text-xl md:text-2xl text-foreground/50 tracking-widest mb-2">
          MEDELLIN, COLOMBIA
        </p>
        <div className="star-divider my-8">
          <Star className="h-3 w-3 fill-current" />
        </div>
        <p
          className="font-serif italic text-foreground/50 text-lg max-w-lg mx-auto"
          style={{ textTransform: "none", letterSpacing: "normal" }}
        >
          {t("home.story.text").split(".")[0]}.
        </p>
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
    <section className="py-24 md:py-32 px-4 relative film-grain" data-testid="section-featured">
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className="marquee-header text-2xl md:text-3xl marquee-glow"
            data-testid="text-featured-title"
          >
            {t("home.featured")}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-48 w-full mb-4 rounded-md" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ))}
          </div>
        ) : items && items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.map((item) => (
              <Card
                key={item.id}
                className="p-0 overflow-visible hover-elevate group"
                data-testid={`card-featured-${item.id}`}
              >
                {item.imageUrl && (
                  <div className="overflow-hidden rounded-t-md">
                    <img
                      src={item.imageUrl}
                      alt={bilingual(item, "name")}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3
                      className="font-serif text-lg font-semibold gold-text"
                      style={{ textTransform: "none" }}
                      data-testid={`text-featured-name-${item.id}`}
                    >
                      {bilingual(item, "name")}
                    </h3>
                    <Star className="h-4 w-4 text-primary flex-shrink-0 mt-1 fill-primary/30" />
                  </div>
                  <p
                    className="text-sm text-foreground/50 mb-4 line-clamp-2 italic"
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
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : null}

        <div className="text-center mt-14">
          <Link href="/menu">
            <Button variant="outline" className="font-display text-base tracking-wider px-8" data-testid="button-featured-viewmenu">
              {t("hero.cta")}
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
      <StorySection />
      <PromotionsPreview />
      <CinemaShowcase />
      <FeaturedSection />
    </PublicLayout>
  );
}
