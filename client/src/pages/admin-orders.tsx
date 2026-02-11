import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { bilingual, formatPrice } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Loader2 } from "lucide-react";
import type { Order, OrderItem } from "@shared/schema";
import logoImage from "@assets/AISelect_20260209_183938_Instagram_1770702468454.jpg";

type OrderWithItems = Order & { items: OrderItem[] };

function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const config: Record<string, { label: string; classes: string }> = {
    pending: {
      label: t("admin.orders.status.pending"),
      classes: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
    preparing: {
      label: t("admin.orders.status.preparing"),
      classes: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    completed: {
      label: t("admin.orders.status.completed"),
      classes: "bg-green-500/15 text-green-400/70 border-green-500/20",
    },
  };

  const { label, classes } = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-sm font-semibold tracking-wider uppercase border rounded-md ${classes}`}
      data-testid={`badge-status-${status}`}
    >
      {label}
    </span>
  );
}

function OrderCard({
  order,
  lang,
  t,
}: {
  order: OrderWithItems;
  lang: "en" | "es";
  t: (key: string) => string;
}) {
  const { toast } = useToast();

  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      await apiRequest("PATCH", `/api/admin/orders/${order.id}/status`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
    },
    onError: () => {
      toast({ title: t("error"), variant: "destructive" });
    },
  });

  const isCompleted = order.status === "completed";
  const timeStr = new Date(order.createdAt).toLocaleTimeString(lang === "es" ? "es-CO" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = new Date(order.createdAt).toLocaleDateString(lang === "es" ? "es-CO" : "en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Card
      className={`p-5 transition-opacity ${isCompleted ? "opacity-60" : ""}`}
      data-testid={`card-order-${order.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div className="flex flex-col gap-1">
          <span className="font-display text-3xl gold-text tracking-wide" data-testid={`text-order-number-${order.id}`}>
            #{order.orderNumber}
          </span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span data-testid={`text-order-time-${order.id}`}>{dateStr} {timeStr}</span>
          </div>
          <span className="text-xs text-muted-foreground" data-testid={`text-order-device-${order.id}`}>
            {t("admin.orders.device")}: {order.deviceId}
          </span>
        </div>
        <StatusBadge status={order.status} t={t} />
      </div>

      <div className="border-t border-border pt-3 mb-4">
        <ul className="space-y-1.5" data-testid={`list-order-items-${order.id}`}>
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-foreground">
                <span className="font-semibold text-foreground/90">{item.quantity}x</span>{" "}
                {bilingual(item, "name", lang)}
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
          <span className="text-sm text-muted-foreground uppercase tracking-wider">{t("admin.orders.total")}</span>
          <span className="font-display text-2xl gold-text tabular-nums" data-testid={`text-order-total-${order.id}`}>
            ${formatPrice(order.total)}
          </span>
        </div>

        {order.status === "pending" && (
          <Button
            onClick={() => statusMutation.mutate("preparing")}
            disabled={statusMutation.isPending}
            className="bg-blue-600 border-blue-600 text-white"
            data-testid={`button-mark-preparing-${order.id}`}
          >
            {statusMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t("admin.orders.markPreparing")}
          </Button>
        )}

        {order.status === "preparing" && (
          <Button
            onClick={() => statusMutation.mutate("completed")}
            disabled={statusMutation.isPending}
            className="bg-green-600 border-green-600 text-white"
            data-testid={`button-mark-completed-${order.id}`}
          >
            {statusMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t("admin.orders.markCompleted")}
          </Button>
        )}
      </div>
    </Card>
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
    if (!sessionLoading && !session) {
      setLocation("/admin/login");
    }
  }, [sessionLoading, session, setLocation]);

  const { data: orders = [], isLoading: ordersLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/admin/orders"],
    refetchInterval: 5000,
    enabled: !!session,
  });

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  if (!session) return null;

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const completedOrders = orders.filter((o) => o.status === "completed");
  const sortedOrders = [...pendingOrders, ...preparingOrders, ...completedOrders];

  return (
    <div className="min-h-screen bg-background" data-testid="page-admin-orders">
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Phillyzon" className="h-8 w-8 rounded-md object-cover" />
            <span className="font-serif text-lg font-bold gold-text">PHILLYZON</span>
            <span className="text-xs text-muted-foreground border border-border rounded-md px-2 py-0.5">
              {t("admin.orders")}
            </span>
          </div>
          <Link href="/admin/dashboard" data-testid="link-back-dashboard">
            <Button variant="ghost" size="sm">
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

        {ordersLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg" data-testid="text-orders-empty">
              {t("admin.orders.empty")}
            </p>
          </div>
        ) : (
          <div className="grid gap-4" data-testid="grid-orders">
            {sortedOrders.map((order) => (
              <OrderCard key={order.id} order={order} lang={lang} t={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
