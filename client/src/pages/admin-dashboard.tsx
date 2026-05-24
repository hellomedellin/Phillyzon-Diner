import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Plus, Pencil, Trash2, UtensilsCrossed, Tag, Megaphone, X, ImageIcon, Loader2, ExternalLink, ClipboardList, Users, Settings } from "lucide-react";
import type { MenuCategory, MenuItem, Promotion } from "@shared/schema";
import logoImage from "@assets/AISelect_20260209_183938_Instagram_1770702468454.jpg";

function AdminHeader() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/admin/logout");
      setLocation("/admin/login");
    } catch {
      toast({ title: t("error"), variant: "destructive" });
    }
  };

  return (
    <header className="border-b border-border bg-card px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="Phillyzon" className="h-8 w-8 rounded-md object-cover" />
          <span className="font-serif text-lg font-bold gold-text">PHILLYZON</span>
          <span className="text-xs text-muted-foreground border border-border rounded-md px-2 py-0.5">
            {t("admin.badge")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/orders" data-testid="link-admin-orders">
            <Button variant="ghost" size="sm">
              <ClipboardList className="h-4 w-4 mr-2" />
              {t("admin.orders")}
            </Button>
          </Link>
          <Link href="/" data-testid="link-admin-home">
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              {t("admin.viewSite")}
            </Button>
          </Link>
          <Button variant="ghost" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="h-4 w-4 mr-2" />
            {t("admin.logout")}
          </Button>
        </div>
      </div>
    </header>
  );
}

function CategoryForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: MenuCategory;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const [nameEn, setNameEn] = useState(initial?.nameEn || "");
  const [nameEs, setNameEs] = useState(initial?.nameEs || "");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder?.toString() || "0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !nameEs.trim()) return;
    onSave({ nameEn: nameEn.trim(), nameEs: nameEs.trim(), sortOrder: parseInt(sortOrder) || 0 });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-border rounded-md bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>{t("admin.name")} — {t("admin.english.flag")}</Label>
          <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} required className="mt-1" data-testid="input-cat-name-en" />
        </div>
        <div>
          <Label>{t("admin.name")} — {t("admin.spanish.flag")}</Label>
          <Input value={nameEs} onChange={(e) => setNameEs(e.target.value)} required className="mt-1" data-testid="input-cat-name-es" />
        </div>
      </div>
      <div className="max-w-xs">
        <Label>{t("admin.sortOrder")}</Label>
        <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="mt-1" data-testid="input-cat-sort" />
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button type="submit" data-testid="button-save-cat">{t("admin.save")}</Button>
        <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-cat">{t("admin.cancel")}</Button>
      </div>
    </form>
  );
}

function CategoriesTab() {
  const { t, bilingual } = useLanguage();
  const { toast } = useToast();
  const [editing, setEditing] = useState<MenuCategory | null>(null);
  const [adding, setAdding] = useState(false);

  const { data: categories, isLoading } = useQuery<MenuCategory[]>({ queryKey: ["/api/categories"] });

  const createMut = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setAdding(false);
      toast({ title: t("admin.saved") });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/admin/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setEditing(null);
      toast({ title: t("admin.updated") });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      toast({ title: t("admin.deleted") });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="font-serif text-xl font-semibold gold-text">{t("admin.categories")}</h2>
        {!adding && (
          <Button onClick={() => setAdding(true)} data-testid="button-add-category">
            <Plus className="h-4 w-4 mr-2" />
            {t("admin.add")}
          </Button>
        )}
      </div>

      {adding && (
        <CategoryForm
          onSave={(data) => createMut.mutate(data)}
          onCancel={() => setAdding(false)}
        />
      )}

      {isLoading ? (
        <p className="text-muted-foreground">{t("loading")}</p>
      ) : (
        <div className="space-y-2">
          {categories?.sort((a, b) => a.sortOrder - b.sortOrder).map((cat) => (
            <div key={cat.id}>
              {editing?.id === cat.id ? (
                <CategoryForm
                  initial={cat}
                  onSave={(data) => updateMut.mutate({ id: cat.id, data })}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <Card className="p-4" data-testid={`card-admin-cat-${cat.id}`}>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-medium text-foreground">{cat.nameEn} / {cat.nameEs}</p>
                      <p className="text-xs text-muted-foreground">{t("admin.sortOrder")}: {cat.sortOrder}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditing(cat)} data-testid={`button-edit-cat-${cat.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(t("admin.confirm.delete"))) deleteMut.mutate(cat.id);
                        }}
                        data-testid={`button-delete-cat-${cat.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ImageUploader({
  imageUrl,
  onImageChange,
  testIdPrefix,
}: {
  imageUrl: string;
  onImageChange: (url: string) => void;
  testIdPrefix: string;
}) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      onImageChange(data.imageUrl);
    } catch (err: any) {
      toast({ title: err?.message || t("error"), variant: "destructive" });
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleRemove = async () => {
    if (imageUrl) {
      try {
        await apiRequest("DELETE", "/api/admin/upload", { imageUrl });
      } catch {}
    }
    onImageChange("");
  };

  return (
    <div>
      <Label>{t("admin.uploadImage")}</Label>
      <div className="mt-1">
        {imageUrl ? (
          <div className="relative inline-block">
            <img
              src={imageUrl}
              alt=""
              className="w-24 h-24 rounded-md object-cover border border-border"
              data-testid={`${testIdPrefix}-preview`}
            />
            <div className="absolute -top-3 -right-3">
              <Button
                type="button"
                size="icon"
                variant="destructive"
                onClick={handleRemove}
                data-testid={`${testIdPrefix}-remove`}
              >
                <X />
              </Button>
            </div>
            <label className="mt-2 block">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleUpload}
                className="hidden"
                data-testid={`${testIdPrefix}-change`}
              />
              <Button type="button" size="sm" variant="outline" className="w-full mt-1" onClick={(e) => {
                const input = (e.currentTarget.parentElement as HTMLLabelElement).querySelector("input");
                input?.click();
              }}>
                {t("admin.changeImage")}
              </Button>
            </label>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-border rounded-md cursor-pointer hover-elevate">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleUpload}
              className="hidden"
              data-testid={`${testIdPrefix}-input`}
            />
            {uploading ? (
              <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
            ) : (
              <>
                <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">{t("admin.uploadImage")}</span>
              </>
            )}
          </label>
        )}
      </div>
    </div>
  );
}

function MenuItemForm({
  initial,
  categories,
  onSave,
  onCancel,
}: {
  initial?: MenuItem;
  categories: MenuCategory[];
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const [nameEn, setNameEn] = useState(initial?.nameEn || "");
  const [nameEs, setNameEs] = useState(initial?.nameEs || "");
  const [descEn, setDescEn] = useState(initial?.descriptionEn || "");
  const [descEs, setDescEs] = useState(initial?.descriptionEs || "");
  const [price, setPrice] = useState(initial?.price || "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId?.toString() || (categories[0]?.id?.toString() || ""));
  const [featured, setFeatured] = useState(initial?.featured || false);
  const [visible, setVisible] = useState(initial?.visible ?? true);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !nameEs.trim() || !descEn.trim() || !descEs.trim() || !price.trim()) return;
    onSave({
      nameEn: nameEn.trim(),
      nameEs: nameEs.trim(),
      descriptionEn: descEn.trim(),
      descriptionEs: descEs.trim(),
      price: price.trim(),
      categoryId: parseInt(categoryId),
      featured,
      visible,
      imageUrl: imageUrl || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-border rounded-md bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>{t("admin.name")} — {t("admin.english.flag")}</Label>
          <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} required className="mt-1" data-testid="input-item-name-en" />
        </div>
        <div>
          <Label>{t("admin.name")} — {t("admin.spanish.flag")}</Label>
          <Input value={nameEs} onChange={(e) => setNameEs(e.target.value)} required className="mt-1" data-testid="input-item-name-es" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>{t("admin.description")} — {t("admin.english.flag")}</Label>
          <Textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} required className="mt-1" data-testid="input-item-desc-en" />
        </div>
        <div>
          <Label>{t("admin.description")} — {t("admin.spanish.flag")}</Label>
          <Textarea value={descEs} onChange={(e) => setDescEs(e.target.value)} required className="mt-1" data-testid="input-item-desc-es" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div>
          <Label>{t("admin.price")}</Label>
          <Input value={price} onChange={(e) => setPrice(e.target.value)} required className="mt-1" data-testid="input-item-price" />
        </div>
        <div>
          <Label>{t("admin.category")}</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="mt-1" data-testid="select-item-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>{c.nameEn} / {c.nameEs}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ImageUploader imageUrl={imageUrl} onImageChange={setImageUrl} testIdPrefix="item-image" />
      </div>
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Switch checked={featured} onCheckedChange={setFeatured} data-testid="switch-item-featured" />
          <Label>{t("admin.featured")}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={visible} onCheckedChange={setVisible} data-testid="switch-item-visible" />
          <Label>{t("admin.visible")}</Label>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button type="submit" data-testid="button-save-item">{t("admin.save")}</Button>
        <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-item">{t("admin.cancel")}</Button>
      </div>
    </form>
  );
}

function MenuItemsTab() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [adding, setAdding] = useState(false);

  const { data: categories } = useQuery<MenuCategory[]>({ queryKey: ["/api/categories"] });
  const { data: items, isLoading } = useQuery<MenuItem[]>({ queryKey: ["/api/menu-items"] });

  const createMut = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/menu-items", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items/featured"] });
      setAdding(false);
      toast({ title: t("admin.saved") });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/admin/menu-items/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items/featured"] });
      setEditing(null);
      toast({ title: t("admin.updated") });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/menu-items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items/featured"] });
      toast({ title: t("admin.deleted") });
    },
  });

  const cats = categories || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="font-serif text-xl font-semibold gold-text">{t("admin.items")}</h2>
        {!adding && cats.length > 0 && (
          <Button onClick={() => setAdding(true)} data-testid="button-add-item">
            <Plus className="h-4 w-4 mr-2" />
            {t("admin.add")}
          </Button>
        )}
      </div>

      {adding && cats.length > 0 && (
        <MenuItemForm
          categories={cats}
          onSave={(data) => createMut.mutate(data)}
          onCancel={() => setAdding(false)}
        />
      )}

      {isLoading ? (
        <p className="text-muted-foreground">{t("loading")}</p>
      ) : (
        <div className="space-y-2">
          {items?.map((item) => (
            <div key={item.id}>
              {editing?.id === item.id ? (
                <MenuItemForm
                  initial={item}
                  categories={cats}
                  onSave={(data) => updateMut.mutate({ id: item.id, data })}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <Card className="p-4" data-testid={`card-admin-item-${item.id}`}>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.nameEn} className="w-12 h-12 rounded-md object-cover border border-border flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground">{item.nameEn} / {item.nameEs}</p>
                        <span className="text-sm gold-text font-serif">${item.price}</span>
                        {item.featured && <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-md">{t("admin.featured")}</span>}
                        {!item.visible && <span className="text-xs bg-destructive/20 text-destructive px-1.5 py-0.5 rounded-md">{t("admin.hidden")}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{item.descriptionEn}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditing(item)} data-testid={`button-edit-item-${item.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(t("admin.confirm.delete"))) deleteMut.mutate(item.id);
                        }}
                        data-testid={`button-delete-item-${item.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PromotionForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Promotion;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const [titleEn, setTitleEn] = useState(initial?.titleEn || "");
  const [titleEs, setTitleEs] = useState(initial?.titleEs || "");
  const [descEn, setDescEn] = useState(initial?.descriptionEn || "");
  const [descEs, setDescEs] = useState(initial?.descriptionEs || "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [startDate, setStartDate] = useState(initial?.startDate || "");
  const [endDate, setEndDate] = useState(initial?.endDate || "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim() || !titleEs.trim() || !descEn.trim() || !descEs.trim()) return;
    onSave({
      titleEn: titleEn.trim(),
      titleEs: titleEs.trim(),
      descriptionEn: descEn.trim(),
      descriptionEs: descEs.trim(),
      active,
      startDate: startDate || null,
      endDate: endDate || null,
      imageUrl: imageUrl.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-border rounded-md bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>{t("admin.title")} — {t("admin.english.flag")}</Label>
          <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} required className="mt-1" data-testid="input-promo-title-en" />
        </div>
        <div>
          <Label>{t("admin.title")} — {t("admin.spanish.flag")}</Label>
          <Input value={titleEs} onChange={(e) => setTitleEs(e.target.value)} required className="mt-1" data-testid="input-promo-title-es" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>{t("admin.description")} — {t("admin.english.flag")}</Label>
          <Textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} required className="mt-1" data-testid="input-promo-desc-en" />
        </div>
        <div>
          <Label>{t("admin.description")} — {t("admin.spanish.flag")}</Label>
          <Textarea value={descEs} onChange={(e) => setDescEs(e.target.value)} required className="mt-1" data-testid="input-promo-desc-es" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div>
          <Label>{t("admin.startDate")}</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1" data-testid="input-promo-start" />
        </div>
        <div>
          <Label>{t("admin.endDate")}</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1" data-testid="input-promo-end" />
        </div>
        <ImageUploader imageUrl={imageUrl} onImageChange={setImageUrl} testIdPrefix="promo-image" />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={active} onCheckedChange={setActive} data-testid="switch-promo-active" />
        <Label>{t("admin.active")}</Label>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button type="submit" data-testid="button-save-promo">{t("admin.save")}</Button>
        <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-promo">{t("admin.cancel")}</Button>
      </div>
    </form>
  );
}

function PromotionsTab() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [adding, setAdding] = useState(false);

  const { data: promos, isLoading } = useQuery<Promotion[]>({ queryKey: ["/api/promotions"] });

  const createMut = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/promotions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promotions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/promotions/active"] });
      setAdding(false);
      toast({ title: t("admin.saved") });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/admin/promotions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promotions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/promotions/active"] });
      setEditing(null);
      toast({ title: t("admin.updated") });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/promotions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promotions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/promotions/active"] });
      toast({ title: t("admin.deleted") });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="font-serif text-xl font-semibold gold-text">{t("admin.promotions")}</h2>
        {!adding && (
          <Button onClick={() => setAdding(true)} data-testid="button-add-promo">
            <Plus className="h-4 w-4 mr-2" />
            {t("admin.add")}
          </Button>
        )}
      </div>

      {adding && (
        <PromotionForm
          onSave={(data) => createMut.mutate(data)}
          onCancel={() => setAdding(false)}
        />
      )}

      {isLoading ? (
        <p className="text-muted-foreground">{t("loading")}</p>
      ) : (
        <div className="space-y-2">
          {promos?.map((promo) => (
            <div key={promo.id}>
              {editing?.id === promo.id ? (
                <PromotionForm
                  initial={promo}
                  onSave={(data) => updateMut.mutate({ id: promo.id, data })}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <Card className="p-4" data-testid={`card-admin-promo-${promo.id}`}>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground">{promo.titleEn} / {promo.titleEs}</p>
                        {promo.active ? (
                          <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-md">{t("admin.active")}</span>
                        ) : (
                          <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">{t("admin.inactive")}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{promo.descriptionEn}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditing(promo)} data-testid={`button-edit-promo-${promo.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(t("admin.confirm.delete"))) deleteMut.mutate(promo.id);
                        }}
                        data-testid={`button-delete-promo-${promo.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UserEditForm({ user, onDone }: { user: { id: number; email: string; role: string }; onDone: () => void }) {
  const { toast } = useToast();
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, string> = {};
      if (email !== user.email) payload.email = email;
      if (password) payload.password = password;
      await apiRequest("PATCH", `/api/admin/users/${user.id}`, payload);
    },
    onSuccess: () => {
      toast({ title: "User updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      onDone();
    },
    onError: (err: any) => toast({ title: err.message || "Error", variant: "destructive" }),
  });

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
      className="mt-3 pt-3 border-t border-border/30 space-y-3"
    >
      <div>
        <Label className="text-xs text-muted-foreground">Email</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 h-8 text-sm"
        />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">New Password <span className="text-muted-foreground/50">(leave blank to keep current)</span></Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="mt-1 h-8 text-sm"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" disabled={mutation.isPending} className="flex-1">
          {mutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
          Save
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}

function UsersTab({ currentId }: { currentId?: number }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"kitchen" | "admin">("kitchen");

  const { data: users = [], isLoading } = useQuery<{ id: number; email: string; role: string }[]>({
    queryKey: ["/api/admin/users"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/users", { email: newEmail, password: newPassword, role: newRole });
    },
    onSuccess: () => {
      toast({ title: "User created" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setNewEmail("");
      setNewPassword("");
      setNewRole("kitchen");
    },
    onError: (err: any) => toast({ title: err.message || t("error"), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      toast({ title: t("admin.deleted") });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (err: any) => toast({ title: err.message || t("error"), variant: "destructive" }),
  });

  const roleLabel = (r: string) => r === "admin" ? "Admin" : "Kitchen";
  const roleBadgeClass = (r: string) =>
    r === "admin"
      ? "bg-primary/15 text-primary border-primary/30"
      : "bg-blue-500/15 text-blue-400 border-blue-500/30";

  return (
    <div className="space-y-8 max-w-xl">
      {/* Existing users */}
      <div>
        <h3 className="font-serif text-base font-semibold text-foreground/80 mb-3">Team Members</h3>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="p-3 rounded-md border border-border/40 bg-card">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border flex-shrink-0 ${roleBadgeClass(user.role)}`}>
                      {roleLabel(user.role)}
                    </span>
                    <span className="text-sm text-foreground truncate">{user.email}</span>
                    {user.id === currentId && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">(you)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground/50 hover:text-foreground"
                      onClick={() => setEditingId(editingId === user.id ? null : user.id)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {user.id !== currentId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground/50 hover:text-destructive"
                        onClick={() => deleteMutation.mutate(user.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {editingId === user.id && (
                  <UserEditForm user={user} onDone={() => setEditingId(null)} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add new user */}
      <Card className="p-5">
        <h3 className="font-serif text-base font-semibold gold-text mb-1">Add New User</h3>
        <div className="h-px w-8 bg-primary mb-5" />
        <form
          onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="new-user-email">Email</Label>
            <Input
              id="new-user-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              className="mt-1"
              placeholder="cook@phillyzon.com"
            />
          </div>
          <div>
            <Label htmlFor="new-user-password">Password</Label>
            <Input
              id="new-user-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="mt-1"
              placeholder="••••••••"
            />
          </div>
          <div>
            <Label htmlFor="new-user-role">Role</Label>
            <Select value={newRole} onValueChange={(v) => setNewRole(v as "kitchen" | "admin")}>
              <SelectTrigger id="new-user-role" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kitchen">Kitchen — orders only</SelectItem>
                <SelectItem value="admin">Admin — full access</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Plus className="h-4 w-4 mr-2" />
            Create User
          </Button>
        </form>
      </Card>
    </div>
  );
}

const CONTACT_DEFAULTS = {
  address: "Calle 10 #43A-30, El Poblado, Medellin, Colombia",
  phone: "573016926846",
  hoursWeekdayEn: "Monday - Thursday: 11:00 AM - 10:00 PM",
  hoursWeekdayEs: "Lunes - Jueves: 11:00 AM - 10:00 PM",
  hoursWeekendEn: "Friday - Saturday: 11:00 AM - 11:00 PM",
  hoursWeekendEs: "Viernes - Sabado: 11:00 AM - 11:00 PM",
  hoursSundayEn: "Sunday: 12:00 PM - 9:00 PM",
  hoursSundayEs: "Domingo: 12:00 PM - 9:00 PM",
};

function ContactSettingsTab() {
  const { toast } = useToast();

  const { data: siteItems = [], isSuccess } = useQuery<{ key: string; valueEn: string; valueEs: string }[]>({
    queryKey: ["/api/site-content"],
  });

  const [address, setAddress] = useState(CONTACT_DEFAULTS.address);
  const [phone, setPhone] = useState(CONTACT_DEFAULTS.phone);
  const [hoursWeekdayEn, setHoursWeekdayEn] = useState(CONTACT_DEFAULTS.hoursWeekdayEn);
  const [hoursWeekdayEs, setHoursWeekdayEs] = useState(CONTACT_DEFAULTS.hoursWeekdayEs);
  const [hoursWeekendEn, setHoursWeekendEn] = useState(CONTACT_DEFAULTS.hoursWeekendEn);
  const [hoursWeekendEs, setHoursWeekendEs] = useState(CONTACT_DEFAULTS.hoursWeekendEs);
  const [hoursSundayEn, setHoursSundayEn] = useState(CONTACT_DEFAULTS.hoursSundayEn);
  const [hoursSundayEs, setHoursSundayEs] = useState(CONTACT_DEFAULTS.hoursSundayEs);

  const initialized = useRef(false);

  useEffect(() => {
    if (!isSuccess || initialized.current) return;
    initialized.current = true;
    const get = (key: string, lang: "en" | "es") => {
      const item = siteItems.find((i) => i.key === key);
      return item ? (lang === "en" ? item.valueEn : item.valueEs) : undefined;
    };
    setAddress(get("contact.address", "en") ?? CONTACT_DEFAULTS.address);
    setPhone(get("contact.phone", "en") ?? CONTACT_DEFAULTS.phone);
    setHoursWeekdayEn(get("contact.hours.weekday", "en") ?? CONTACT_DEFAULTS.hoursWeekdayEn);
    setHoursWeekdayEs(get("contact.hours.weekday", "es") ?? CONTACT_DEFAULTS.hoursWeekdayEs);
    setHoursWeekendEn(get("contact.hours.weekend", "en") ?? CONTACT_DEFAULTS.hoursWeekendEn);
    setHoursWeekendEs(get("contact.hours.weekend", "es") ?? CONTACT_DEFAULTS.hoursWeekendEs);
    setHoursSundayEn(get("contact.hours.sunday", "en") ?? CONTACT_DEFAULTS.hoursSundayEn);
    setHoursSundayEs(get("contact.hours.sunday", "es") ?? CONTACT_DEFAULTS.hoursSundayEs);
  }, [isSuccess, siteItems]);

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest("PUT", "/api/admin/site-content", [
        { key: "contact.address", valueEn: address, valueEs: address },
        { key: "contact.phone", valueEn: phone, valueEs: phone },
        { key: "contact.hours.weekday", valueEn: hoursWeekdayEn, valueEs: hoursWeekdayEs },
        { key: "contact.hours.weekend", valueEn: hoursWeekendEn, valueEs: hoursWeekendEs },
        { key: "contact.hours.sunday", valueEn: hoursSundayEn, valueEs: hoursSundayEs },
      ]),
    onSuccess: () => {
      toast({ title: "Contact info saved" });
      queryClient.invalidateQueries({ queryKey: ["/api/site-content"] });
    },
    onError: (err: any) => toast({ title: err.message || "Error", variant: "destructive" }),
  });

  return (
    <div className="max-w-xl">
      <Card className="p-6">
        <h2 className="font-serif text-lg font-semibold gold-text mb-1">Contact & Hours</h2>
        <div className="h-px w-8 bg-primary mb-6" />

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-5">
          <div>
            <Label>Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1" />
          </div>

          <div>
            <Label>WhatsApp Number</Label>
            <p className="text-xs text-muted-foreground mt-0.5 mb-1">Digits only, include country code (e.g. 573016926846)</p>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" placeholder="573016926846" />
          </div>

          <div className="border-t border-border/30 pt-5 space-y-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Hours</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Weekday — EN</Label>
                <Input value={hoursWeekdayEn} onChange={(e) => setHoursWeekdayEn(e.target.value)} className="mt-1 h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Weekday — ES</Label>
                <Input value={hoursWeekdayEs} onChange={(e) => setHoursWeekdayEs(e.target.value)} className="mt-1 h-8 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Weekend — EN</Label>
                <Input value={hoursWeekendEn} onChange={(e) => setHoursWeekendEn(e.target.value)} className="mt-1 h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Weekend — ES</Label>
                <Input value={hoursWeekendEs} onChange={(e) => setHoursWeekendEs(e.target.value)} className="mt-1 h-8 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Sunday — EN</Label>
                <Input value={hoursSundayEn} onChange={(e) => setHoursSundayEn(e.target.value)} className="mt-1 h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Sunday — ES</Label>
                <Input value={hoursSundayEs} onChange={(e) => setHoursSundayEs(e.target.value)} className="mt-1 h-8 text-sm" />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Contact Info
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const { data: session, isLoading } = useQuery<{ id: number; email: string; role: string } | null>({
    queryKey: ["/api/admin/session"],
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && !session) setLocation("/admin/login");
    if (!isLoading && session && session.role === "kitchen") setLocation("/admin/orders");
  }, [isLoading, session, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background" data-testid="page-admin-dashboard">
      <AdminHeader />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold gold-text mb-1" data-testid="text-admin-dashboard-title">
            {t("admin.dashboard")}
          </h1>
          <div className="h-px w-12 bg-primary" />
        </div>

        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-xl" data-testid="tabs-admin">
            <TabsTrigger value="categories" className="gap-2" data-testid="tab-categories">
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">{t("admin.categories")}</span>
            </TabsTrigger>
            <TabsTrigger value="items" className="gap-2" data-testid="tab-items">
              <UtensilsCrossed className="h-4 w-4" />
              <span className="hidden sm:inline">{t("admin.items")}</span>
            </TabsTrigger>
            <TabsTrigger value="promotions" className="gap-2" data-testid="tab-promotions">
              <Megaphone className="h-4 w-4" />
              <span className="hidden sm:inline">{t("admin.promotions")}</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2" data-testid="tab-users">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2" data-testid="tab-settings">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>
          <TabsContent value="items">
            <MenuItemsTab />
          </TabsContent>
          <TabsContent value="promotions">
            <PromotionsTab />
          </TabsContent>
          <TabsContent value="users">
            <UsersTab currentId={session.id} />
          </TabsContent>
          <TabsContent value="settings">
            <ContactSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
