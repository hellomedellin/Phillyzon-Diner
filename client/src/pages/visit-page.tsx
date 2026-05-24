import { useLanguage } from "@/lib/language-context";
import { PublicLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, MessageCircle, Star } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

export default function VisitPage() {
  const { t } = useLanguage();

  return (
    <PublicLayout>
      <div className="py-12 md:py-16 px-4 film-grain" data-testid="page-visit">
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1
              className="marquee-header text-3xl md:text-4xl marquee-glow"
              data-testid="text-visit-title"
            >
              {t("visit.title")}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6" data-testid="card-address">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg gold-text tracking-wider mb-2" data-testid="text-address-label">
                    {t("visit.address.label")}
                  </h3>
                  <p className="text-foreground/50 text-sm" data-testid="text-address">
                    {t("visit.address")}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6" data-testid="card-hours">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg gold-text tracking-wider mb-2" data-testid="text-hours-label">
                    {t("visit.hours.label")}
                  </h3>
                  <div className="space-y-1 text-sm text-foreground/50">
                    <p data-testid="text-hours-weekday">{t("visit.hours.weekday")}</p>
                    <p data-testid="text-hours-weekend">{t("visit.hours.weekend")}</p>
                    <p data-testid="text-hours-sunday">{t("visit.hours.sunday")}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6 mb-8" data-testid="card-whatsapp">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <SiWhatsapp className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-display text-lg gold-text tracking-wider mb-1">
                  {t("visit.whatsapp")}
                </h3>
                <p className="text-sm text-foreground/50 italic">
                  {t("visit.whatsapp.text")}
                </p>
              </div>
              <a
                href="https://wa.me/573016926846"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="font-display tracking-wider" data-testid="button-whatsapp">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </a>
            </div>
          </Card>

          <div className="star-divider mb-8">
            <Star className="h-3 w-3 fill-current" />
          </div>

          <div className="rounded-md overflow-visible border border-primary/10" data-testid="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.1234567890123!2d-75.56!3d6.21!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTInMzYuMCJOIDc1wrAzMyczNi4wIlc!5e0!3m2!1sen!2sco!4v1700000000000!5m2!1sen!2sco"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Phillyzon Location"
              className="rounded-md"
            />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
