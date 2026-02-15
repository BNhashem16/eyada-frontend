"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Frown, Loader2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdminContactLinks,
  useCreateContactLink,
  useUpdateContactLink,
  useDeleteContactLink,
} from "../hooks";
import { ContactLink, ContactLinkPlatform, Multilingual } from "@/types";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTranslation } from "@/lib/i18n";

const PLATFORMS = Object.values(ContactLinkPlatform);

interface ContactLinkFormData {
  platform: ContactLinkPlatform;
  labelAr: string;
  labelEn: string;
  value: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

const initialFormData: ContactLinkFormData = {
  platform: ContactLinkPlatform.PHONE,
  labelAr: "",
  labelEn: "",
  value: "",
  icon: "",
  sortOrder: 0,
  isActive: true,
};

export function ContactLinksManagement() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState<string | undefined>();
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>();
  const [platformFilter, setPlatformFilter] = useState<
    ContactLinkPlatform | undefined
  >();

  const {
    data: linksResponse,
    isLoading,
    isError,
  } = useAdminContactLinks({
    page,
    limit,
    search,
    isActive: isActiveFilter,
    platform: platformFilter,
  });
  const links = linksResponse?.data || [];
  const meta = linksResponse?.meta;

  const createLink = useCreateContactLink();
  const updateLink = useUpdateContactLink();
  const deleteLink = useDeleteContactLink();

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ContactLink | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] =
    useState<ContactLinkFormData>(initialFormData);

  const handleSearch = () => {
    setSearch(searchInput || undefined);
    setPage(1);
  };

  const handleOpenCreate = () => {
    setEditingLink(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (link: ContactLink) => {
    setEditingLink(link);
    setFormData({
      platform: link.platform,
      labelAr: link.label.ar,
      labelEn: link.label.en,
      value: link.value,
      icon: link.icon || "",
      sortOrder: link.sortOrder,
      isActive: link.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const label: Multilingual = { ar: formData.labelAr, en: formData.labelEn };

    if (editingLink) {
      updateLink.mutate(
        {
          id: editingLink.id,
          platform: formData.platform,
          label,
          value: formData.value,
          icon: formData.icon || undefined,
          sortOrder: formData.sortOrder,
          isActive: formData.isActive,
        },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setEditingLink(null);
            setFormData(initialFormData);
          },
        },
      );
    } else {
      createLink.mutate(
        {
          platform: formData.platform,
          label,
          value: formData.value,
          icon: formData.icon || undefined,
          sortOrder: formData.sortOrder,
          isActive: formData.isActive,
        },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setFormData(initialFormData);
          },
        },
      );
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteLink.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  };

  const handleToggleActive = (link: ContactLink) => {
    setTogglingId(link.id);
    updateLink.mutate(
      { id: link.id, isActive: !link.isActive },
      { onSettled: () => setTogglingId(null) },
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20">
        <CardContent className="py-10 text-center">
          <p className="text-error-600 dark:text-error-400">
            {t("errors.loadError")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {t("admin.contactLinksPage.title")} ({meta?.total || 0})
            </h3>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 me-2" />
              {t("admin.contactLinks.addNew")}
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder={t("common.search")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select
              value={platformFilter || "all"}
              onValueChange={(value) => {
                setPlatformFilter(
                  value === "all" ? undefined : (value as ContactLinkPlatform),
                );
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder={t("admin.contactLinks.platform")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {t(`admin.contactLinks.platforms.${p}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={
                isActiveFilter === undefined ? "all" : isActiveFilter.toString()
              }
              onValueChange={(value) => {
                setIsActiveFilter(
                  value === "all" ? undefined : value === "true",
                );
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t("table.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="true">{t("common.active")}</SelectItem>
                <SelectItem value="false">{t("common.inactive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {links.length === 0 ? (
            <div className="text-center py-10">
              <Frown className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                {t("admin.contactLinks.noLinks")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.contactLinks.platform")}</TableHead>
                  <TableHead>{t("admin.contactLinks.labelAr")}</TableHead>
                  <TableHead>{t("admin.contactLinks.labelEn")}</TableHead>
                  <TableHead>{t("admin.contactLinks.value")}</TableHead>
                  <TableHead>{t("admin.contactLinks.sortOrder")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead>{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => (
                  <TableRow
                    key={link.id}
                    className={!link.isActive ? "opacity-60 bg-muted/30" : ""}
                  >
                    <TableCell>
                      <Badge variant="outline">
                        {t(`admin.contactLinks.platforms.${link.platform}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {link.label.ar}
                    </TableCell>
                    <TableCell>{link.label.en}</TableCell>
                    <TableCell className="max-w-[200px] truncate" dir="ltr">
                      {link.value}
                    </TableCell>
                    <TableCell>{link.sortOrder}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {togglingId === link.id && updateLink.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                          <Switch
                            checked={link.isActive}
                            onCheckedChange={() => handleToggleActive(link)}
                            disabled={updateLink.isPending}
                          />
                        )}
                        <Badge
                          variant={link.isActive ? "success" : "secondary"}
                          className="text-xs"
                        >
                          {link.isActive
                            ? t("common.active")
                            : t("common.inactive")}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(link)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-error-600"
                          onClick={() => setDeleteId(link.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}

          <PaginationControls
            meta={meta}
            page={page}
            onPageChange={setPage}
            limit={limit}
            onLimitChange={(v) => {
              setLimit(v);
              setPage(1);
            }}
          />
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLink
                ? t("admin.contactLinks.editLink")
                : t("admin.contactLinks.addNew")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.contactLinksPage.subtitle")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Platform */}
            <div>
              <Label>{t("admin.contactLinks.platform")} *</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) =>
                  setFormData((f) => ({
                    ...f,
                    platform: value as ContactLinkPlatform,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {t(`admin.contactLinks.platforms.${p}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Labels */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="labelAr">
                  {t("admin.contactLinks.labelAr")} *
                </Label>
                <Input
                  id="labelAr"
                  value={formData.labelAr}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, labelAr: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="labelEn">
                  {t("admin.contactLinks.labelEn")} *
                </Label>
                <Input
                  id="labelEn"
                  value={formData.labelEn}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, labelEn: e.target.value }))
                  }
                  dir="ltr"
                />
              </div>
            </div>

            {/* Value */}
            <div>
              <Label htmlFor="value">{t("admin.contactLinks.value")} *</Label>
              <Input
                id="value"
                value={formData.value}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, value: e.target.value }))
                }
                dir="ltr"
              />
            </div>

            {/* Icon & Sort Order */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="icon">{t("admin.contactLinks.icon")}</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, icon: e.target.value }))
                  }
                  dir="ltr"
                />
              </div>
              <div>
                <Label htmlFor="sortOrder">
                  {t("admin.contactLinks.sortOrder")}
                </Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      sortOrder: parseInt(e.target.value) || 0,
                    }))
                  }
                  dir="ltr"
                />
              </div>
            </div>

            {/* Active */}
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((f) => ({ ...f, isActive: checked }))
                }
              />
              <Label>{t("admin.contactLinks.isActive")}</Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.labelAr ||
                !formData.labelEn ||
                !formData.value ||
                createLink.isPending ||
                updateLink.isPending
              }
            >
              {(createLink.isPending || updateLink.isPending) && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {editingLink ? t("common.update") : t("common.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.contactLinks.deleteLink")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.contactLinks.deleteConfirmation")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-error-600 hover:bg-error-700"
              disabled={deleteLink.isPending}
            >
              {deleteLink.isPending && (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              )}
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
