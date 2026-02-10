import { PublicLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Home } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <PublicLayout>
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center" data-testid="page-not-found">
        <h1 className="font-serif text-6xl font-bold gold-text mb-4">404</h1>
        <p className="text-muted-foreground mb-6">{t("error.notfound")}</p>
        <Link href="/">
          <Button data-testid="button-go-home">
            <Home className="h-4 w-4 mr-2" />
            {t("nav.home")}
          </Button>
        </Link>
      </div>
    </PublicLayout>
  );
}
