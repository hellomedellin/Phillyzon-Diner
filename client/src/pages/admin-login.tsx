import { useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";
import logoImage from "@assets/AISelect_20260209_183938_Instagram_1770702468454.jpg";

export default function AdminLogin() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest("POST", "/api/admin/login", { email, password });
      setLocation("/admin/dashboard");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4" data-testid="page-admin-login">
      <Card className="w-full max-w-sm p-6">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img src={logoImage} alt="Phillyzon" className="w-16 h-16 rounded-md object-cover" />
          </div>
          <h1 className="font-serif text-xl font-bold gold-text mb-1" data-testid="text-admin-login-title">
            {t("admin.login")}
          </h1>
          <div className="h-px w-10 bg-primary mx-auto" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">{t("admin.email")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
              data-testid="input-email"
            />
          </div>
          <div>
            <Label htmlFor="password">{t("admin.password")}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
              data-testid="input-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading} data-testid="button-login">
            <Lock className="h-4 w-4 mr-2" />
            {loading ? t("loading") : t("admin.signin")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
