import { useLanguage } from "@/lib/language-context";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import type { Promotion } from "@shared/schema";

export default function PromotionsPage() {
  const { t, bilingual } = useLanguage();

  const { data: promos, isLoading } = useQuery<Promotion[]>({
    queryKey: ["/api/promotions/active"],
  });

  return (
    <PublicLayout>
      <div className="py-12 md:py-16 px-4" data-testid="page-promotions">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-3xl md:text-4xl font-bold gold-text mb-3" data-testid="text-promo-title">
              {t("promo.title")}
            </h1>
            <div className="h-px w-16 bg-primary mx-auto" />
          </div>

          {isLoading ? (
            <div className="space-y-5">
              {[1, 2].map((i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-64 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </Card>
              ))}
            </div>
          ) : promos && promos.length > 0 ? (
            <div className="space-y-5">
              {promos.map((promo) => (
                <Card key={promo.id} className="p-6 hover-elevate" data-testid={`card-promo-${promo.id}`}>
                  <div className="flex flex-col md:flex-row gap-5">
                    {promo.imageUrl && (
                      <img
                        src={promo.imageUrl}
                        alt={bilingual(promo, "title")}
                        className="w-full md:w-48 h-32 rounded-md object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                        <h2 className="font-serif text-xl font-bold gold-text" data-testid={`text-promo-title-${promo.id}`}>
                          {bilingual(promo, "title")}
                        </h2>
                        <Badge variant="default" className="text-xs">
                          {t("admin.active")}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3" data-testid={`text-promo-desc-${promo.id}`}>
                        {bilingual(promo, "description")}
                      </p>
                      {(promo.startDate || promo.endDate) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground" data-testid="text-promo-empty">
              {t("promo.empty")}
            </p>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
