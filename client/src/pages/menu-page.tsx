import { useLanguage } from "@/lib/language-context";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { formatPrice } from "@/lib/i18n";
import type { MenuItem, MenuCategory } from "@shared/schema";
import heroImage2 from "@assets/Screenshot_2026-02-10_112516_1770751825145.png";

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
      <div className="relative" data-testid="page-menu">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={heroImage2}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-5"
          />
          <div className="absolute inset-0 bg-background/95" />
        </div>

        <div className="relative z-10 py-16 md:py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h1
                className="marquee-header text-3xl md:text-4xl marquee-glow"
                data-testid="text-menu-title"
              >
                {t("menu.title")}
              </h1>
            </div>

            {isLoading ? (
              <div className="space-y-14">
                {[1, 2].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-8 w-48 mb-6" />
                    <div className="space-y-4">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="border-b border-border/30 pb-4">
                          <div className="flex justify-between gap-4">
                            <div className="flex-1">
                              <Skeleton className="h-5 w-48 mb-2" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                            <Skeleton className="h-6 w-20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : categories && categories.length > 0 ? (
              <div className="space-y-20">
                {categories
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((cat) => {
                    const catItems = visibleItems.filter((i) => i.categoryId === cat.id);
                    if (catItems.length === 0) return null;
                    return (
                      <div key={cat.id} data-testid={`section-category-${cat.id}`}>
                        <div className="mb-10">
                          <h2
                            className="marquee-header text-xl md:text-2xl"
                            data-testid={`text-category-name-${cat.id}`}
                          >
                            {bilingual(cat, "name")}
                          </h2>
                        </div>

                        <div className="space-y-1">
                          {catItems.map((item, idx) => (
                            <div
                              key={item.id}
                              className={`group py-6 ${idx < catItems.length - 1 ? "border-b border-border/20" : ""}`}
                              data-testid={`card-menuitem-${item.id}`}
                            >
                              <div className="flex items-start gap-4">
                                {item.imageUrl && (
                                  <img
                                    src={item.imageUrl}
                                    alt={bilingual(item, "name")}
                                    className="w-16 h-16 rounded-md object-cover flex-shrink-0 border border-border/20"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h3
                                        className="font-serif text-base md:text-lg font-semibold text-foreground tracking-wide"
                                        data-testid={`text-menuitem-name-${item.id}`}
                                      >
                                        {bilingual(item, "name")}
                                      </h3>
                                      {item.featured && (
                                        <Badge variant="default" className="text-xs">
                                          <Star className="h-3 w-3 mr-1 fill-current" />
                                          {t("admin.featured")}
                                        </Badge>
                                      )}
                                    </div>
                                    <span
                                      className="font-display text-xl md:text-2xl gold-text whitespace-nowrap tracking-wider"
                                      data-testid={`text-menuitem-price-${item.id}`}
                                    >
                                      ${formatPrice(item.price)}
                                    </span>
                                  </div>
                                  <p
                                    className="text-sm text-foreground/40 mt-2 italic tracking-wider"
                                    style={{ textTransform: "none" }}
                                    data-testid={`text-menuitem-desc-${item.id}`}
                                  >
                                    {bilingual(item, "description")}
                                  </p>
                                </div>
                              </div>
                            </div>
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
      </div>
    </PublicLayout>
  );
}
