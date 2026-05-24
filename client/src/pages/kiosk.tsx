import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/lib/language-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, Minus, Trash2, ShoppingCart, CheckCircle, X } from "lucide-react";
import { formatPrice } from "@/lib/i18n";
import type { MenuItem, MenuCategory } from "@shared/schema";
import logoImage from "@assets/AISelect_20260209_183938_Instagram_1770702468454.jpg";

const DEVICE_ID_KEY = "phillyzon_kiosk_device";
const AUTO_RESET_SECONDS = 25;

function getDeviceId(): string {
  if (typeof window === "undefined") return "DEVICE-unknown";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    id = `DEVICE-${random}`;
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

interface CartContentProps {
  cart: CartItem[];
  lang: "en" | "es";
  t: (key: string) => string;
  cartTotal: number;
  cartCount: number;
  onUpdateQuantity: (id: number, delta: number) => void;
  onClear: () => void;
  onSubmit: () => void;
  isPending: boolean;
}

function CartContent({ cart, lang, t, cartTotal, onUpdateQuantity, onSubmit, isPending }: CartContentProps) {
  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-3">
            <ShoppingCart className="h-8 w-8 text-foreground/15" />
            <p className="text-sm text-foreground/30" data-testid="text-kiosk-cart-empty">
              {t("kiosk.cartEmpty")}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {cart.map((c) => {
              const name = lang === "en" ? c.nameEn : c.nameEs;
              const lineTotal = parseInt(c.price, 10) * c.quantity;
              return (
                <div
                  key={c.menuItemId}
                  className="flex items-center gap-3 py-3 border-b border-border/10 last:border-0"
                  data-testid={`cart-item-${c.menuItemId}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground leading-snug truncate">{name}</p>
                    <p className="text-xs text-foreground/40 mt-0.5">
                      ${formatPrice(c.price)} × {c.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 border-border/40"
                      onClick={() => onUpdateQuantity(c.menuItemId, -1)}
                      data-testid={`button-kiosk-minus-${c.menuItemId}`}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center font-display text-base" data-testid={`text-kiosk-qty-${c.menuItemId}`}>
                      {c.quantity}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 border-border/40"
                      onClick={() => onUpdateQuantity(c.menuItemId, 1)}
                      data-testid={`button-kiosk-plus-${c.menuItemId}`}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="font-display text-sm gold-text w-16 text-right tracking-wider flex-shrink-0">
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
          <span className="text-sm text-foreground/50 uppercase tracking-widest font-display">
            {t("kiosk.total")}
          </span>
          <span className="font-display text-3xl gold-text tracking-widest" data-testid="text-kiosk-total">
            ${formatPrice(String(cartTotal))}
          </span>
        </div>
        <Button
          size="lg"
          className="w-full font-display tracking-wider text-base"
          disabled={cart.length === 0 || isPending}
          onClick={onSubmit}
          data-testid="button-kiosk-submit"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <ShoppingCart className="h-5 w-5 mr-2" />
          )}
          {t("kiosk.submitOrder")}
        </Button>
      </div>
    </>
  );
}

export default function Kiosk() {
  const { lang, setLang, t, bilingual } = useLanguage();
  const [phase, setPhase] = useState<KioskPhase>("welcome");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(AUTO_RESET_SECONDS);
  const [cartOpen, setCartOpen] = useState(false);

  const { data: categories } = useQuery<MenuCategory[]>({ queryKey: ["/api/categories"] });
  const { data: items } = useQuery<MenuItem[]>({ queryKey: ["/api/menu-items"] });

  const visibleItems = items?.filter((i) => i.visible) || [];

  const resetKiosk = useCallback(() => {
    setPhase("welcome");
    setSelectedCategory(null);
    setCart([]);
    setConfirmedOrderNumber(null);
    setCountdown(AUTO_RESET_SECONDS);
    setCartOpen(false);
  }, []);

  useEffect(() => {
    if (phase !== "confirmed") return;
    setCountdown(AUTO_RESET_SECONDS);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); resetKiosk(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, resetKiosk]);

  const orderMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/orders", {
        deviceId: getDeviceId(),
        items: cart.map((c) => ({ menuItemId: c.menuItemId, quantity: c.quantity })),
      });
      return res.json();
    },
    onSuccess: (data: { orderNumber: number }) => {
      setConfirmedOrderNumber(data.orderNumber);
      setPhase("confirmed");
      setCartOpen(false);
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
      return [...prev, { menuItemId: item.id, nameEn: item.nameEn, nameEs: item.nameEs, price: item.price, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((menuItemId: number, delta: number) => {
    setCart((prev) =>
      prev.map((c) => c.menuItemId === menuItemId ? { ...c, quantity: c.quantity + delta } : c)
          .filter((c) => c.quantity > 0)
    );
  }, []);

  const cartTotal = cart.reduce((sum, c) => sum + parseInt(c.price, 10) * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const cartProps: CartContentProps = {
    cart, lang, t, cartTotal, cartCount,
    onUpdateQuantity: updateQuantity,
    onClear: () => setCart([]),
    onSubmit: () => orderMutation.mutate(),
    isPending: orderMutation.isPending,
  };

  // ── Welcome ──────────────────────────────────────────────────────────────
  if (phase === "welcome") {
    return (
      <div
        className="fixed inset-0 bg-background flex flex-col items-center justify-center select-none cursor-pointer"
        onClick={() => setPhase("ordering")}
        data-testid="kiosk-welcome"
      >
        <div className="flex flex-col items-center gap-6 px-8 text-center">
          <img
            src={logoImage}
            alt="Phillyzon"
            className="w-28 h-28 md:w-36 md:h-36 rounded-xl object-cover border-2 border-primary/30 shadow-2xl"
            data-testid="img-kiosk-logo"
          />
          <h1 className="font-display text-5xl md:text-6xl gold-text tracking-widest" data-testid="text-kiosk-brand">
            PHILLYZON
          </h1>
          <p className="text-lg md:text-xl text-foreground/50 animate-pulse font-light" data-testid="text-kiosk-tap">
            {t("kiosk.tapToStart")}
          </p>
        </div>
        <div className="absolute bottom-8 flex gap-3">
          <Button
            variant="ghost"
            size="lg"
            onClick={(e) => { e.stopPropagation(); setLang("es"); }}
            className={`text-base px-6 ${lang === "es" ? "border border-primary gold-text" : "text-foreground/35"}`}
            data-testid="button-kiosk-lang-es"
          >
            Español
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={(e) => { e.stopPropagation(); setLang("en"); }}
            className={`text-base px-6 ${lang === "en" ? "border border-primary gold-text" : "text-foreground/35"}`}
            data-testid="button-kiosk-lang-en"
          >
            English
          </Button>
        </div>
      </div>
    );
  }

  // ── Confirmed ─────────────────────────────────────────────────────────────
  if (phase === "confirmed") {
    return (
      <div
        className="fixed inset-0 bg-background flex flex-col items-center justify-center select-none px-6"
        data-testid="kiosk-confirmed"
      >
        <div className="flex flex-col items-center gap-6 text-center max-w-sm w-full">
          <CheckCircle className="w-20 h-20 text-green-500" />
          <h1 className="font-display text-3xl md:text-4xl gold-text tracking-wider" data-testid="text-kiosk-confirmed-title">
            {t("kiosk.orderConfirmed")}
          </h1>
          <div className="bg-muted rounded-2xl w-full px-6 py-8" data-testid="text-kiosk-order-number">
            <p className="text-xs text-foreground/40 uppercase tracking-widest font-display mb-2">
              {t("kiosk.orderNumber")}
            </p>
            <span className="font-display text-8xl gold-text tracking-widest">
              #{confirmedOrderNumber}
            </span>
          </div>
          <p className="text-lg text-foreground/60 font-light" data-testid="text-kiosk-pay-counter">
            {t("kiosk.payAtCounter")}
          </p>
          <p className="text-sm text-foreground/25">{countdown}s</p>
          <Button
            variant="outline"
            size="lg"
            className="w-full font-display tracking-wider border-primary/30"
            onClick={resetKiosk}
            data-testid="button-kiosk-new-order"
          >
            {t("kiosk.newOrder")}
          </Button>
        </div>
      </div>
    );
  }

  // ── Ordering ──────────────────────────────────────────────────────────────
  const sortedCategories = categories
    ? [...categories].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];
  const filteredItems = selectedCategory
    ? visibleItems.filter((i) => i.categoryId === selectedCategory)
    : [];

  return (
    <div className="fixed inset-0 bg-background flex flex-col select-none" data-testid="kiosk-ordering">

      {/* Header */}
      <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border/30 flex-shrink-0 bg-card/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="Phillyzon" className="h-9 w-9 rounded-md object-cover border border-primary/20" />
          <span className="font-display text-xl gold-text tracking-widest">PHILLYZON</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLang(lang === "en" ? "es" : "en")}
          className="font-display tracking-wider text-foreground/50 hover:text-foreground/80"
          data-testid="button-kiosk-toggle-lang"
        >
          {lang === "en" ? "ES" : "EN"}
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Menu panel ───────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Category tabs */}
          <div className="px-3 py-3 border-b border-border/20 flex-shrink-0">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {sortedCategories.map((cat) => {
                const count = visibleItems.filter((i) => i.categoryId === cat.id).length;
                if (count === 0) return null;
                const active = selectedCategory === cat.id;
                return (
                  <Button
                    key={cat.id}
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`whitespace-nowrap flex-shrink-0 font-display tracking-wider text-sm ${!active ? "border-border/40 text-foreground/55" : ""}`}
                    data-testid={`button-kiosk-category-${cat.id}`}
                  >
                    {bilingual(cat, "name")}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-3 pb-28 md:pb-4">
            {!selectedCategory ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center opacity-40">
                <ShoppingCart className="h-10 w-10" />
                <p className="text-sm font-light" data-testid="text-kiosk-pick-category">
                  {t("kiosk.selectCategory")}
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex items-center justify-center h-full opacity-40">
                <p className="text-sm">{t("menu.empty")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredItems.map((item) => {
                  const inCart = cart.find((c) => c.menuItemId === item.id);
                  return (
                    <Card
                      key={item.id}
                      className={`p-0 overflow-hidden flex flex-col border-primary/10 transition-all duration-150 ${inCart ? "ring-1 ring-primary/50 border-primary/30" : ""}`}
                      data-testid={`card-kiosk-item-${item.id}`}
                    >
                      {/* Image */}
                      <div className="aspect-[4/3] overflow-hidden bg-muted flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={bilingual(item, "name")}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5 text-foreground/15" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3 flex flex-col flex-1 gap-2">
                        <div className="flex-1">
                          <h3
                            className="font-semibold text-sm text-foreground leading-snug"
                            data-testid={`text-kiosk-item-name-${item.id}`}
                          >
                            {bilingual(item, "name")}
                          </h3>
                          <p
                            className="text-xs text-foreground/35 mt-0.5 line-clamp-2 italic leading-relaxed"
                            style={{ textTransform: "none" }}
                          >
                            {bilingual(item, "description")}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-1">
                          <span
                            className="font-display text-lg gold-text tracking-wider"
                            data-testid={`text-kiosk-item-price-${item.id}`}
                          >
                            ${formatPrice(item.price)}
                          </span>

                          {inCart ? (
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7 border-border/40"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-5 text-center font-display text-sm gold-text">
                                {inCart.quantity}
                              </span>
                              <Button
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              className="h-8 font-display tracking-wider text-xs px-3"
                              onClick={() => addToCart(item)}
                              data-testid={`button-kiosk-add-${item.id}`}
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              {t("kiosk.add")}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Desktop cart aside ───────────────────────────────────────── */}
        <aside className="hidden md:flex w-80 lg:w-96 border-l border-border/30 flex-col flex-shrink-0 bg-muted/20">
          <div className="px-4 py-3 border-b border-border/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm tracking-widest gold-text">{t("kiosk.cart")}</h2>
              {cartCount > 0 && (
                <span className="text-xs text-foreground/35">({cartCount} {t("kiosk.items")})</span>
              )}
            </div>
            {cart.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCart([])}
                className="text-foreground/35 hover:text-foreground/60 text-xs"
                data-testid="button-kiosk-clear-cart"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                {t("kiosk.clearCart")}
              </Button>
            )}
          </div>
          <CartContent {...cartProps} />
        </aside>
      </div>

      {/* ── Mobile: floating cart button ─────────────────────────────────── */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-2 transition-all duration-300 ${
          cartCount > 0 ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <Button
          size="lg"
          className="w-full shadow-2xl font-display tracking-wider flex items-center"
          onClick={() => setCartOpen(true)}
          data-testid="button-kiosk-open-cart"
        >
          <ShoppingCart className="h-5 w-5 mr-2 flex-shrink-0" />
          <span className="flex-1 text-left text-sm">
            {cartCount} {t("kiosk.items")}
          </span>
          <span className="text-base tracking-widest">
            ${formatPrice(String(cartTotal))}
          </span>
        </Button>
      </div>

      {/* ── Mobile: cart bottom sheet ────────────────────────────────────── */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          cartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-background/75 backdrop-blur-sm"
          onClick={() => setCartOpen(false)}
        />

        {/* Sheet */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl max-h-[88vh] flex flex-col shadow-2xl transition-transform duration-300 ${
            cartOpen ? "translate-y-0" : "translate-y-full"
          }`}
          data-testid="kiosk-cart-sheet"
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          {/* Sheet header */}
          <div className="px-4 py-3 border-b border-border/20 flex items-center justify-between gap-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm tracking-widest gold-text">{t("kiosk.cart")}</h2>
              {cartCount > 0 && (
                <span className="text-xs text-foreground/35">({cartCount} {t("kiosk.items")})</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCart([])}
                  className="text-foreground/35 text-xs"
                  data-testid="button-kiosk-clear-cart-sheet"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  {t("kiosk.clearCart")}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-foreground/40"
                onClick={() => setCartOpen(false)}
                data-testid="button-kiosk-close-sheet"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <CartContent {...cartProps} />
        </div>
      </div>
    </div>
  );
}
