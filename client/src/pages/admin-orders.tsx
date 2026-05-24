import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { bilingual, formatPrice } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Loader2, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import type { Order, OrderItem } from "@shared/schema";
import logoImage from "@assets/AISelect_20260209_183938_Instagram_1770702468454.jpg";

type OrderWithItems = Order & { items: OrderItem[] };

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function formatDateLabel(dateStr: string): string {
  const today = todayStr();
  const yesterday = yesterdayStr();
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const config: Record<string, { label: string; classes: string }> = {
    pending: { label: t("admin.orders.status.pending"), classes: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    preparing: { label: t("admin.orders.status.preparing"), classes: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    completed: { label: t("admin.orders.status.completed"), classes: "bg-green-500/15 text-green-400/70 border-green-500/20" },
  };
  const { label, classes } = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold tracking-wider uppercase border rounded-md ${classes}`}>
      {label}
    </span>
  );
}

function OrderCard({ order, lang, t, showActions }: {
  order: OrderWithItems;
  lang: "en" | "es";
  t: (key: string) => string;
  showActions: boolean;
}) {
  const { toast } = useToast();

  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      await apiRequest("PATCH", `/api/admin/orders/${order.id}/status`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders/current"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  const timeStr = new Date(order.createdAt).toLocaleTimeString(lang === "es" ? "es-CO" : "en-US", {
    hour: "2-digit", minute: "2-digit",
  });
  const dateStr = new Date(order.createdAt).toLocaleDateString(lang === "es" ? "es-CO" : "en-US", {
    month: "short", day: "numeric",
  });

  return (
    <Card className="p-5" data-testid={`card-order-${order.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <span className="font-display text-3xl gold-text tracking-wide" data-testid={`text-order-number-${order.id}`}>
            #{order.orderNumber}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{dateStr} · {timeStr}</span>
          </div>
          <span className="text-xs text-muted-foreground/60">
            {t("admin.orders.device")}: {order.deviceId}
          </span>
        </div>
        <StatusBadge status={order.status} t={t} />
      </div>

      <div className="border-t border-border pt-3 mb-4">
        <ul className="space-y-1">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 text-sm">
              <span>
                <span className="font-semibold text-foreground/90">{item.quantity}×</span>{" "}
                <span className="text-foreground/80">{bilingual(item, "name", lang)}</span>
              </span>
              <span className="font-display text-sm text-muted-foreground tabular-nums">
                ${formatPrice(item.price)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{t("admin.orders.total")}</span>
          <span className="font-display text-2xl gold-text tabular-nums" data-testid={`text-order-total-${order.id}`}>
            ${formatPrice(order.total)}
          </span>
        </div>

        {showActions && order.status === "pending" && (
          <Button
            size="sm"
            onClick={() => statusMutation.mutate("preparing")}
            disabled={statusMutation.isPending}
            className="bg-blue-600 border-blue-600 text-white"
            data-testid={`button-mark-preparing-${order.id}`}
          >
            {statusMutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            {t("admin.orders.markPreparing")}
          </Button>
        )}
        {showActions && order.status === "preparing" && (
          <Button
            size="sm"
            onClick={() => statusMutation.mutate("completed")}
            disabled={statusMutation.isPending}
            className="bg-green-600 border-green-600 text-white"
            data-testid={`button-mark-completed-${order.id}`}
          >
            {statusMutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            {t("admin.orders.markCompleted")}
          </Button>
        )}
      </div>
    </Card>
  );
}

function CurrentOrdersTab({ session, lang, t }: { session: { email: string }; lang: "en" | "es"; t: (k: string) => string }) {
  const { data: orders = [], isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/admin/orders/current"],
    refetchInterval: 5000,
    enabled: !!session,
  });

  const pending = orders.filter((o) => o.status === "pending");
  const preparing = orders.filter((o) => o.status === "preparing");
  const sorted = [...pending, ...preparing];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <CheckCircle className="h-10 w-10 text-muted-foreground/20" />
        <p className="text-muted-foreground">{t("admin.orders.empty")}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {sorted.map((order) => (
        <OrderCard key={order.id} order={order} lang={lang} t={t} showActions />
      ))}
    </div>
  );
}

function CompletedOrdersTab({ session, lang, t }: { session: { email: string }; lang: "en" | "es"; t: (k: string) => string }) {
  const [date, setDate] = useState(todayStr());

  const { data: orders = [], isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/admin/orders/completed", date],
    queryFn: async () => {
      const res = await fetch(`/api/admin/orders/completed?date=${date}`, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!session,
  });

  const dayTotal = orders.reduce((sum, o) => sum + parseFloat(o.total), 0);

  return (
    <div>
      {/* Date navigator */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDate(todayStr())}
          className={`font-display tracking-wider text-xs ${date === todayStr() ? "border-primary text-primary" : "border-border/50 text-muted-foreground"}`}
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDate(yesterdayStr())}
          className={`font-display tracking-wider text-xs ${date === yesterdayStr() ? "border-primary text-primary" : "border-border/50 text-muted-foreground"}`}
        >
          Yesterday
        </Button>

        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => setDate(shiftDate(date, -1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <input
            type="date"
            value={date}
            max={todayStr()}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="h-8 rounded-md border border-border/50 bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => setDate(shiftDate(date, 1))}
            disabled={date >= todayStr()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day summary */}
      {orders.length > 0 && (
        <div className="flex items-center justify-between mb-5 px-1">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{orders.length}</span> order{orders.length !== 1 ? "s" : ""} on{" "}
            <span className="text-primary">{formatDateLabel(date)}</span>
          </p>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Revenue</p>
            <p className="font-display text-2xl gold-text tracking-wider">${formatPrice(dayTotal.toFixed(0))}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <CheckCircle className="h-10 w-10 text-muted-foreground/20" />
          <p className="text-muted-foreground">No completed orders for {formatDateLabel(date)}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} lang={lang} t={t} showActions={false} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminOrders() {
  const { t, lang } = useLanguage();
  const [, setLocation] = useLocation();

  const { data: session, isLoading: sessionLoading } = useQuery<{ email: string } | null>({
    queryKey: ["/api/admin/session"],
    retry: false,
  });

  useEffect(() => {
    if (!sessionLoading && !session) setLocation("/admin/login");
  }, [sessionLoading, session, setLocation]);

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background" data-testid="page-admin-orders">
      <header className="border-b border-border bg-card px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Phillyzon" className="h-8 w-8 rounded-md object-cover" />
            <span className="font-display text-lg gold-text tracking-widest">PHILLYZON</span>
            <span className="text-xs text-muted-foreground border border-border rounded-md px-2 py-0.5 font-display tracking-wider">
              {t("admin.orders")}
            </span>
          </div>
          <Link href="/admin/dashboard" data-testid="link-back-dashboard">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("admin.orders.backToDashboard")}
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold gold-text mb-1" data-testid="text-orders-title">
            {t("admin.orders.title")}
          </h1>
          <div className="h-px w-12 bg-primary" />
        </div>

        <Tabs defaultValue="current">
          <TabsList className="grid grid-cols-2 max-w-xs mb-6">
            <TabsTrigger value="current" className="gap-2 font-display tracking-wider text-xs">
              <span className="relative">
                {t("admin.orders.status.pending").split("").length > 0 ? "Current" : "Current"}
              </span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2 font-display tracking-wider text-xs">
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            <CurrentOrdersTab session={session} lang={lang} t={t} />
          </TabsContent>
          <TabsContent value="completed">
            <CompletedOrdersTab session={session} lang={lang} t={t} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
