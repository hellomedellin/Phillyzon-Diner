import { useLanguage } from "@/lib/language-context";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { PublicLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Star } from "lucide-react";
import { formatPrice } from "@/lib/i18n";
import type { MenuItem } from "@shared/schema";
import logoImage from "@assets/AISelect_20260209_183938_Instagram_1770702468454.jpg";

function HeroSection() {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-visible" data-testid="section-hero">
      <div className="relative bg-card min-h-[60vh] md:min-h-[70vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/80 to-background" />
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <img src={logoImage} alt="" className="w-80 h-80 object-contain" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto py-16">
          <div className="mb-6 flex justify-center">
            <img src={logoImage} alt="Phillyzon" className="w-32 h-32 md:w-40 md:h-40 rounded-md object-cover" data-testid="img-hero-logo" />
          </div>
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold gold-text mb-4 leading-tight" data-testid="text-hero-tagline">
            {t("hero.tagline")}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl mx-auto" data-testid="text-hero-subtitle">
            {t("hero.subtitle")}
          </p>
          <Link href="/menu">
            <Button size="lg" className="font-serif text-base" data-testid="button-hero-cta">
              {t("hero.cta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </section>
  );
}

function StorySection() {
  const { t } = useLanguage();
  return (
    <section className="py-16 md:py-20 px-4" data-testid="section-story">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-serif text-2xl md:text-3xl font-bold gold-text mb-6" data-testid="text-story-title">
          {t("home.story.title")}
        </h2>
        <div className="h-px w-16 bg-primary mx-auto mb-6" />
        <p className="text-muted-foreground leading-relaxed text-base md:text-lg" data-testid="text-story-body">
          {t("home.story.text")}
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
    <section className="py-16 md:py-20 px-4 bg-card" data-testid="section-featured">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold gold-text mb-2" data-testid="text-featured-title">
            {t("home.featured")}
          </h2>
          <div className="h-px w-16 bg-primary mx-auto" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-40 w-full mb-4 rounded-md" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ))}
          </div>
        ) : items && items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="p-5 hover-elevate" data-testid={`card-featured-${item.id}`}>
                {item.imageUrl && (
                  <div className="mb-4 rounded-md overflow-visible">
                    <img src={item.imageUrl} alt={bilingual(item, "name")} className="w-full h-40 object-cover rounded-md" />
                  </div>
                )}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-serif text-lg font-semibold gold-text" data-testid={`text-featured-name-${item.id}`}>
                    {bilingual(item, "name")}
                  </h3>
                  <Star className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2" data-testid={`text-featured-desc-${item.id}`}>
                  {bilingual(item, "description")}
                </p>
                <p className="font-serif text-lg font-bold gold-text" data-testid={`text-featured-price-${item.id}`}>
                  ${formatPrice(item.price)}
                </p>
              </Card>
            ))}
          </div>
        ) : null}

        <div className="text-center mt-10">
          <Link href="/menu">
            <Button variant="outline" className="font-serif" data-testid="button-featured-viewmenu">
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
      <FeaturedSection />
    </PublicLayout>
  );
}
