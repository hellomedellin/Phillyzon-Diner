import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/lib/language-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, Minus, Trash2, ShoppingCart, CheckCircle } from "lucide-react";
import { formatPrice } from "@/lib/i18n";
import type { MenuItem, MenuCategory } from "@shared/schema";
import logoImage from "@assets/AISelect_20260209_183938_Instagram_1770702468454.jpg";

const DEVICE_ID_KEY = "phillyzon_kiosk_device";
const AUTO_RESET_SECONDS = 25;

function getDeviceId(): string {
  if (typeof window === "undefined") return "KIOSK-1";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = "KIOSK-1";
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

interface CartItem {
  menuItemId: number;
  nameEn: string;
  nameEs: string;
  price: string;
  quantity: number;
}

type KioskPhase = "welcome" | "ordering" | "confirmed";

export default function Kiosk() {
  const { lang, setLang, t, bilingual } = useLanguage();
  const [phase, setPhase] = useState<KioskPhase>("welcome");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(AUTO_RESET_SECONDS);

  const { data: categories } = useQuery<MenuCategory[]>({
    queryKey: ["/api/categories"],
  });

  const { data: items } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });

  const visibleItems = items?.filter((i) => i.visible) || [];

  const resetKiosk = useCallback(() => {
    setPhase("welcome");
    setSelectedCategory(null);
    setCart([]);
    setConfirmedOrderNumber(null);
    setCountdown(AUTO_RESET_SECONDS);
  }, []);

  useEffect(() => {
    if (phase !== "confirmed") return;
    setCountdown(AUTO_RESET_SECONDS);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          resetKiosk();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, resetKiosk]);

  const orderMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/orders", {
        deviceId: getDeviceId(),
        items: cart.map((c) => ({
          menuItemId: c.menuItemId,
          quantity: c.quantity,
        })),
      });
      return res.json();
    },
    onSuccess: (data: { orderNumber: number }) => {
      setConfirmedOrderNumber(data.orderNumber);
      setPhase("confirmed");
    },
  });

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item.id ? { ...c, quantity: Math.min(c.quantity + 1, 99) } : c
        );
      }
      return [...prev, {
        menuItemId: item.id,
        nameEn: item.nameEn,
        nameEs: item.nameEs,
        price: item.price,
        quantity: 1,
      }];
    });
  }, []);

  const updateQuantity = useCallback((menuItemId: number, delta: number) => {
    setCart((prev) => {
      return prev
        .map((c) =>
          c.menuItemId === menuItemId ? { ...c, quantity: c.quantity + delta } : c
        )
        .filter((c) => c.quantity > 0);
    });
  }, []);

  const cartTotal = cart.reduce((sum, c) => sum + parseInt(c.price, 10) * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  if (phase === "welcome") {
    return (
      <div
        className="fixed inset-0 bg-background flex flex-col items-center justify-center select-none cursor-pointer"
        onClick={() => setPhase("ordering")}
        data-testid="kiosk-welcome"
      >
        <div className="flex flex-col items-center gap-8">
          <img
            src={logoImage}
            alt="Phillyzon"
            className="w-32 h-32 rounded-lg object-cover border-2 border-primary/30"
            data-testid="img-kiosk-logo"
          />
          <h1
            className="font-serif text-4xl md:text-5xl gold-text text-center tracking-wider"
            data-testid="text-kiosk-brand"
          >
            PHILLYZON
          </h1>
          <p
            className="text-xl md:text-2xl text-foreground/70 animate-pulse"
            data-testid="text-kiosk-tap"
          >
            {t("kiosk.tapToStart")}
          </p>
        </div>
        <div className="absolute bottom-8 flex gap-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={(e) => { e.stopPropagation(); setLang("es"); }}
            className={`text-lg ${lang === "es" ? "border border-primary gold-text" : "text-foreground/50"}`}
            data-testid="button-kiosk-lang-es"
          >
            Espanol
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={(e) => { e.stopPropagation(); setLang("en"); }}
            className={`text-lg ${lang === "en" ? "border border-primary gold-text" : "text-foreground/50"}`}
            data-testid="button-kiosk-lang-en"
          >
            English
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "confirmed") {
    return (
      <div
        className="fixed inset-0 bg-background flex flex-col items-center justify-center select-none"
        data-testid="kiosk-confirmed"
      >
        <div className="flex flex-col items-center gap-8 text-center px-8">
          <CheckCircle className="w-24 h-24 text-green-500" />
          <h1
            className="font-serif text-3xl md:text-4xl gold-text tracking-wider"
            data-testid="text-kiosk-confirmed-title"
          >
            {t("kiosk.orderConfirmed")}
          </h1>
          <div className="bg-muted rounded-md px-12 py-8" data-testid="text-kiosk-order-number">
            <span className="font-display text-6xl md:text-8xl gold-text tracking-widest">
              {t("kiosk.orderNumber")} #{confirmedOrderNumber}
            </span>
          </div>
          <p
            className="text-xl md:text-2xl text-foreground/70"
            data-testid="text-kiosk-pay-counter"
          >
            {t("kiosk.payAtCounter")}
          </p>
          <p className="text-base text-foreground/40">
            {countdown}s
          </p>
          <Button
            variant="outline"
            size="lg"
            onClick={resetKiosk}
            data-testid="button-kiosk-new-order"
          >
            {t("kiosk.newOrder")}
          </Button>
        </div>
      </div>
    );
  }

  const sortedCategories = categories
    ? [...categories].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  const filteredItems = selectedCategory
    ? visibleItems.filter((i) => i.categoryId === selectedCategory)
    : [];

  return (
    <div className="fixed inset-0 bg-background flex flex-col select-none" data-testid="kiosk-ordering">
      <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border/30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="Phillyzon" className="h-10 w-10 rounded-md object-cover" />
          <span className="font-serif text-xl gold-text tracking-wider">PHILLYZON</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            className="text-foreground/60"
            data-testid="button-kiosk-toggle-lang"
          >
            {lang === "en" ? "ES" : "EN"}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border/20 flex-shrink-0">
            <h2
              className="font-serif text-lg gold-text tracking-wider mb-3"
              data-testid="text-kiosk-select-category"
            >
              {t("kiosk.selectCategory")}
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {sortedCategories.map((cat) => {
                const catItemCount = visibleItems.filter((i) => i.categoryId === cat.id).length;
                if (catItemCount === 0) return null;
                const isSelected = selectedCategory === cat.id;
                return (
                  <Button
                    key={cat.id}
                    variant={isSelected ? "default" : "outline"}
                    size="lg"
                    onClick={() => setSelectedCategory(cat.id)}
                    className="text-base whitespace-nowrap flex-shrink-0"
                    data-testid={`button-kiosk-category-${cat.id}`}
                  >
                    {bilingual(cat, "name")}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {!selectedCategory ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-lg text-foreground/40" data-testid="text-kiosk-pick-category">
                  {t("kiosk.selectCategory")}
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-lg text-foreground/40">{t("menu.empty")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => {
                  const inCart = cart.find((c) => c.menuItemId === item.id);
                  return (
                    <Card
                      key={item.id}
                      className="p-4 flex flex-col gap-3"
                      data-testid={`card-kiosk-item-${item.id}`}
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={bilingual(item, "name")}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      )}
                      <div className="flex-1">
                        <h3
                          className="font-serif text-base font-semibold text-foreground tracking-wide"
                          data-testid={`text-kiosk-item-name-${item.id}`}
                        >
                          {bilingual(item, "name")}
                        </h3>
                        <p className="text-sm text-foreground/40 mt-1 italic line-clamp-2" style={{ textTransform: "none" }}>
                          {bilingual(item, "description")}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span
                          className="font-display text-2xl gold-text tracking-wider"
                          data-testid={`text-kiosk-item-price-${item.id}`}
                        >
                          ${formatPrice(item.price)}
                        </span>
                        <Button
                          size="lg"
                          onClick={() => addToCart(item)}
                          data-testid={`button-kiosk-add-${item.id}`}
                        >
                          <Plus className="h-5 w-5 mr-1" />
                          {t("kiosk.add")}
                          {inCart ? ` (${inCart.quantity})` : ""}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <aside className="w-80 lg:w-96 border-l border-border/30 flex flex-col flex-shrink-0 bg-muted/30">
          <div className="px-4 py-3 border-b border-border/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <h2 className="font-serif text-lg gold-text tracking-wider">{t("kiosk.cart")}</h2>
              {cartCount > 0 && (
                <span className="text-sm text-foreground/50">
                  ({cartCount} {t("kiosk.items")})
                </span>
              )}
            </div>
            {cart.length > 0 && (
              <Button
                variant="ghost"
                onClick={() => setCart([])}
                className="text-foreground/50"
                data-testid="button-kiosk-clear-cart"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t("kiosk.clearCart")}
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {cart.length === 0 ? (
              <p className="text-center text-foreground/30 mt-8" data-testid="text-kiosk-cart-empty">
                {t("kiosk.cartEmpty")}
              </p>
            ) : (
              <div className="space-y-3">
                {cart.map((c) => {
                  const name = lang === "en" ? c.nameEn : c.nameEs;
                  const lineTotal = parseInt(c.price, 10) * c.quantity;
                  return (
                    <div
                      key={c.menuItemId}
                      className="flex items-center gap-3 py-2 border-b border-border/10"
                      data-testid={`cart-item-${c.menuItemId}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-sm font-semibold text-foreground truncate tracking-wide">
                          {name}
                        </p>
                        <p className="text-xs text-foreground/40">
                          ${formatPrice(c.price)} x {c.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateQuantity(c.menuItemId, -1)}
                          data-testid={`button-kiosk-minus-${c.menuItemId}`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-display text-lg" data-testid={`text-kiosk-qty-${c.menuItemId}`}>
                          {c.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateQuantity(c.menuItemId, 1)}
                          data-testid={`button-kiosk-plus-${c.menuItemId}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <span className="font-display text-lg gold-text w-20 text-right tracking-wider">
                        ${formatPrice(String(lineTotal))}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-border/30 px-4 py-4 flex-shrink-0">
            <div className="flex items-center justify-between gap-4 mb-4">
              <span className="font-serif text-lg text-foreground tracking-wider">{t("kiosk.total")}</span>
              <span className="font-display text-3xl gold-text tracking-widest" data-testid="text-kiosk-total">
                ${formatPrice(String(cartTotal))}
              </span>
            </div>
            <Button
              size="lg"
              className="w-full text-lg"
              disabled={cart.length === 0 || orderMutation.isPending}
              onClick={() => orderMutation.mutate()}
              data-testid="button-kiosk-submit"
            >
              {orderMutation.isPending ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="h-5 w-5 mr-2" />
              )}
              {t("kiosk.submitOrder")}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
