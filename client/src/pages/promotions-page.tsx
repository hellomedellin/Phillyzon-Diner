import { useLanguage } from "@/lib/language-context";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Star, Clock } from "lucide-react";
import type { Promotion } from "@shared/schema";

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

export default function PromotionsPage() {
  const { t, bilingual, lang } = useLanguage();

  const { data: promos, isLoading } = useQuery<Promotion[]>({
    queryKey: ["/api/promotions/active"],
  });

  return (
    <PublicLayout>
      <div className="py-16 md:py-24 px-4 film-grain" data-testid="page-promotions">
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1
              className="marquee-header text-3xl md:text-4xl marquee-glow"
              data-testid="text-promo-title"
            >
              {t("promo.title")}
            </h1>
          </div>

          {isLoading ? (
            <div className="space-y-8">
              {[1, 2].map((i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-64 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </Card>
              ))}
            </div>
          ) : promos && promos.length > 0 ? (
            <div className="space-y-8">
              {promos.map((promo) => {
                const urgency = getUrgencyLabel(promo, lang);
                return (
                  <Card key={promo.id} className="p-0 overflow-visible hover-elevate" data-testid={`card-promo-${promo.id}`}>
                    <div className="flex flex-col md:flex-row">
                      {promo.imageUrl && (
                        <div className="md:w-56 flex-shrink-0 overflow-hidden rounded-t-md md:rounded-t-none md:rounded-l-md">
                          <img
                            src={promo.imageUrl}
                            alt={bilingual(promo, "title")}
                            className="w-full h-48 md:h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                          <h2 className="font-serif text-xl font-bold gold-text" style={{ textTransform: "none" }} data-testid={`text-promo-title-${promo.id}`}>
                            {bilingual(promo, "title")}
                          </h2>
                          <div className="flex items-center gap-2">
                            {urgency && (
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-primary" />
                                <Badge variant="default" className="text-xs font-display tracking-wider">
                                  {urgency}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-foreground/50 mb-4" style={{ textTransform: "none", letterSpacing: "normal" }} data-testid={`text-promo-desc-${promo.id}`}>
                          {bilingual(promo, "description")}
                        </p>
                        {(promo.startDate || promo.endDate) && (
                          <div className="flex items-center gap-2 text-sm text-foreground/40">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            {promo.startDate && (
                              <span>{t("promo.from")} {promo.startDate}</span>
                            )}
                            {promo.startDate && promo.endDate && <span>-</span>}
                            {promo.endDate && (
                              <span>{t("promo.until")} {promo.endDate}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="star-divider mb-8">
                <Star className="h-3 w-3 fill-current" />
              </div>
              <p className="text-foreground/40 italic font-serif text-lg" style={{ textTransform: "none" }} data-testid="text-promo-empty">
                {t("promo.empty")}
              </p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
