export type Language = "en" | "es";

const LANG_KEY = "phillyzon_lang";

export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "es";
  const stored = localStorage.getItem(LANG_KEY);
  if (stored === "en" || stored === "es") return stored;
  return "es";
}

export function setStoredLanguage(lang: Language): void {
  localStorage.setItem(LANG_KEY, lang);
}

type TranslationMap = Record<string, { en: string; es: string }>;

const translations: TranslationMap = {
  "nav.home": { en: "Home", es: "Inicio" },
  "nav.menu": { en: "Menu", es: "Carta" },
  "nav.promotions": { en: "Promotions", es: "Promociones" },
  "nav.visit": { en: "Visit Us", es: "Visitanos" },
  "hero.tagline": { en: "Born in the USA, Grilled in Medellin", es: "Nacido en EE. UU., Parrillado en Medellin" },
  "hero.subtitle": { en: "Authentic Philly Cheesesteaks & Classic American Burgers", es: "Autenticos Philly Cheesesteaks y Hamburguesas Clasicas Americanas" },
  "hero.cta": { en: "View Our Menu", es: "Ver Nuestra Carta" },
  "home.story.title": { en: "Our Story", es: "Nuestra Historia" },
  "home.story.text": { en: "From the streets of Philadelphia to the heart of Medellin, Phillyzon brings you the bold, authentic flavors of classic American street food. Every cheesesteak is crafted with premium cuts, melted to perfection, and served with the passion of two cultures united by great food.", es: "De las calles de Philadelphia al corazon de Medellin, Phillyzon te trae los sabores audaces y autenticos de la comida callejera clasica americana. Cada cheesesteak esta elaborado con cortes premium, derretido a la perfeccion, y servido con la pasion de dos culturas unidas por la buena comida." },
  "home.featured": { en: "Featured Items", es: "Destacados" },
  "menu.title": { en: "Our Menu", es: "Nuestra Carta" },
  "menu.empty": { en: "Menu coming soon.", es: "Carta disponible pronto." },
  "promo.title": { en: "Promotions & Events", es: "Promociones y Eventos" },
  "promo.empty": { en: "No active promotions at this time.", es: "No hay promociones activas en este momento." },
  "promo.until": { en: "Until", es: "Hasta" },
  "promo.from": { en: "From", es: "Desde" },
  "promo.viewAll": { en: "All Promotions", es: "Todas las Promociones" },
  "visit.title": { en: "Visit Us", es: "Visitanos" },
  "visit.address.label": { en: "Address", es: "Direccion" },
  "visit.address": { en: "Calle 10 #43A-30, El Poblado, Medellin, Colombia", es: "Calle 10 #43A-30, El Poblado, Medellin, Colombia" },
  "visit.hours.label": { en: "Hours", es: "Horarios" },
  "visit.hours.weekday": { en: "Monday - Thursday: 11:00 AM - 10:00 PM", es: "Lunes - Jueves: 11:00 AM - 10:00 PM" },
  "visit.hours.weekend": { en: "Friday - Saturday: 11:00 AM - 11:00 PM", es: "Viernes - Sabado: 11:00 AM - 11:00 PM" },
  "visit.hours.sunday": { en: "Sunday: 12:00 PM - 9:00 PM", es: "Domingo: 12:00 PM - 9:00 PM" },
  "visit.whatsapp": { en: "Order via WhatsApp", es: "Pedir por WhatsApp" },
  "visit.whatsapp.text": { en: "Quick orders and reservations", es: "Pedidos rapidos y reservas" },
  "footer.rights": { en: "All rights reserved.", es: "Todos los derechos reservados." },
  "price.currency": { en: "$", es: "$" },
  "admin.login": { en: "Admin Login", es: "Acceso Admin" },
  "admin.email": { en: "Email", es: "Correo" },
  "admin.password": { en: "Password", es: "Contrasena" },
  "admin.signin": { en: "Sign In", es: "Iniciar Sesion" },
  "admin.dashboard": { en: "Dashboard", es: "Panel de Control" },
  "admin.categories": { en: "Categories", es: "Categorias" },
  "admin.items": { en: "Menu Items", es: "Elementos del Menu" },
  "admin.promotions": { en: "Promotions", es: "Promociones" },
  "admin.logout": { en: "Logout", es: "Cerrar Sesion" },
  "admin.viewSite": { en: "View Site", es: "Ver Sitio" },
  "admin.add": { en: "Add New", es: "Agregar" },
  "admin.edit": { en: "Edit", es: "Editar" },
  "admin.delete": { en: "Delete", es: "Eliminar" },
  "admin.save": { en: "Save", es: "Guardar" },
  "admin.cancel": { en: "Cancel", es: "Cancelar" },
  "admin.english": { en: "English", es: "English" },
  "admin.english.flag": { en: "English (US)", es: "English (US)" },
  "admin.spanish": { en: "Spanish", es: "Espanol" },
  "admin.spanish.flag": { en: "Espanol (CO)", es: "Espanol (CO)" },
  "admin.name": { en: "Name", es: "Nombre" },
  "admin.description": { en: "Description", es: "Descripcion" },
  "admin.price": { en: "Price", es: "Precio" },
  "admin.featured": { en: "Featured", es: "Destacado" },
  "admin.visible": { en: "Visible", es: "Visible" },
  "admin.active": { en: "Active", es: "Activo" },
  "admin.category": { en: "Category", es: "Categoria" },
  "admin.title": { en: "Title", es: "Titulo" },
  "admin.startDate": { en: "Start Date", es: "Fecha Inicio" },
  "admin.endDate": { en: "End Date", es: "Fecha Fin" },
  "admin.sortOrder": { en: "Sort Order", es: "Orden" },
  "admin.imageUrl": { en: "Image URL", es: "URL de Imagen" },
  "admin.uploadImage": { en: "Upload Image", es: "Subir Imagen" },
  "admin.removeImage": { en: "Remove", es: "Eliminar" },
  "admin.uploading": { en: "Uploading...", es: "Subiendo..." },
  "admin.changeImage": { en: "Change", es: "Cambiar" },
  "admin.confirm.delete": { en: "Are you sure you want to delete this item?", es: "Esta seguro de eliminar este elemento?" },
  "loading": { en: "Loading...", es: "Cargando..." },
  "error": { en: "Something went wrong.", es: "Algo salio mal." },
  "error.notfound": { en: "Page not found", es: "Pagina no encontrada" },
  "admin.badge": { en: "ADMIN", es: "ADMIN" },
  "admin.saved": { en: "Saved", es: "Guardado" },
  "admin.updated": { en: "Updated", es: "Actualizado" },
  "admin.deleted": { en: "Deleted", es: "Eliminado" },
  "admin.error.credentials": { en: "Invalid credentials", es: "Credenciales invalidas" },
  "admin.hidden": { en: "Hidden", es: "Oculto" },
  "admin.inactive": { en: "Inactive", es: "Inactivo" },
};

export function t(key: string, lang: Language): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang];
}

export function bilingual<T extends Record<string, any>>(item: T, field: string, lang: Language): string {
  const enKey = `${field}En` as keyof T;
  const esKey = `${field}Es` as keyof T;
  return lang === "en" ? (item[enKey] as string) : (item[esKey] as string);
}

export function formatPrice(price: string): string {
  const num = parseInt(price, 10);
  if (isNaN(num)) return price;
  return num.toLocaleString("es-CO");
}
