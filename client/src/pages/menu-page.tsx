import { useLanguage } from "@/lib/language-context";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { formatPrice } from "@/lib/i18n";
import type { MenuItem, MenuCategory } from "@shared/schema";

export default function MenuPage() {
  const { t, bilingual } = useLanguage();

  const { data: categories, isLoading: loadingCats } = useQuery<MenuCategory[]>({
    queryKey: ["/api/categories"],
  });

  const { data: items, isLoading: loadingItems } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });

  const isLoading = loadingCats || loadingItems;

  const visibleItems = items?.filter((i) => i.visible) || [];

  return (
    <PublicLayout>
      <div className="py-12 md:py-16 px-4" data-testid="page-menu">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-3xl md:text-4xl font-bold gold-text mb-3" data-testid="text-menu-title">
              {t("menu.title")}
            </h1>
            <div className="h-px w-16 bg-primary mx-auto" />
          </div>

          {isLoading ? (
            <div className="space-y-10">
              {[1, 2].map((i) => (
                <div key={i}>
                  <Skeleton className="h-7 w-40 mb-4" />
                  <div className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <Card key={j} className="p-4">
                        <div className="flex justify-between gap-4">
                          <div className="flex-1">
                            <Skeleton className="h-5 w-48 mb-2" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="space-y-12">
              {categories
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((cat) => {
                  const catItems = visibleItems.filter((i) => i.categoryId === cat.id);
                  if (catItems.length === 0) return null;
                  return (
                    <div key={cat.id} data-testid={`section-category-${cat.id}`}>
                      <h2 className="font-serif text-xl md:text-2xl font-bold gold-text mb-1" data-testid={`text-category-name-${cat.id}`}>
                        {bilingual(cat, "name")}
                      </h2>
                      <div className="h-px w-12 bg-primary/50 mb-5" />
                      <div className="space-y-3">
                        {catItems.map((item) => (
                          <Card key={item.id} className="p-4 hover-elevate" data-testid={`card-menuitem-${item.id}`}>
                            <div className="flex items-start gap-4">
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={bilingual(item, "name")}
                                  className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-serif text-base font-semibold text-foreground" data-testid={`text-menuitem-name-${item.id}`}>
                                      {bilingual(item, "name")}
                                    </h3>
                                    {item.featured && (
                                      <Badge variant="default" className="text-xs">
                                        <Star className="h-3 w-3 mr-1" />
                                        {t("admin.featured")}
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="font-serif text-base font-bold gold-text whitespace-nowrap" data-testid={`text-menuitem-price-${item.id}`}>
                                    ${formatPrice(item.price)}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1" data-testid={`text-menuitem-desc-${item.id}`}>
                                  {bilingual(item, "description")}
                                </p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground" data-testid="text-menu-empty">
              {t("menu.empty")}
            </p>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
