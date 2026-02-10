"use client";

import { useState } from "react";
import {
  Users,
  Plus,
  Trash2,
  User,
  Loader2,
  Edit,
  Eye,
  Heart,
  Droplets,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { DateOfBirthInput } from "@/components/ui/date-of-birth-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  usePatientFamily,
  useAddFamilyMember,
  useUpdateFamilyMember,
  useDeleteFamilyMember,
} from "../hooks/use-patient";
import { useToast } from "@/hooks/use-toast";
import { Gender, RelationshipType } from "@/types/enums";
import { FamilyMember } from "@/types";
import { getInitials } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

const getRelationshipLabels = (
  t: (key: string) => string,
): Record<RelationshipType, string> => ({
  [RelationshipType.SELF]: t("family.self"),
  [RelationshipType.SPOUSE]: t("family.spouse"),
  [RelationshipType.CHILD]: t("family.child"),
  [RelationshipType.PARENT]: t("family.parent"),
  [RelationshipType.SIBLING]: t("family.sibling"),
  [RelationshipType.OTHER]: t("family.other"),
});

const getGenderLabels = (
  t: (key: string) => string,
): Record<Gender, string> => ({
  [Gender.MALE]: t("family.male"),
  [Gender.FEMALE]: t("family.female"),
});

// Helper to get relationship from member (API may return relationship or relationshipToHead)
const getMemberRelationship = (member: FamilyMember): RelationshipType => {
  return (
    member.relationship || member.relationshipToHead || RelationshipType.OTHER
  );
};

// Schema matching backend AddFamilyMemberDto / UpdateFamilyMemberDto
const getFamilyMemberSchema = (t: (key: string) => string) =>
  z.object({
    fullName: z.string().min(2, t("validation.fullNameMinLength")).max(100),
    dateOfBirth: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          const date = new Date(val);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date < today;
        },
        { message: t("validation.dateOfBirthFuture") },
      ),
    gender: z.nativeEnum(Gender).optional(),
    relationship: z.nativeEnum(RelationshipType),
    bloodType: z.string().optional(),
  });

type FamilyMemberFormData = z.infer<ReturnType<typeof getFamilyMemberSchema>>;

type DialogMode = "add" | "view" | "edit";

export function FamilyList() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const relationshipLabels = getRelationshipLabels(t);
  const genderLabels = getGenderLabels(t);
  const familyMemberSchema = getFamilyMemberSchema(t);

  const { data: family, isLoading } = usePatientFamily();
  const addMutation = useAddFamilyMember();
  const updateMutation = useUpdateFamilyMember();
  const deleteMutation = useDeleteFamilyMember();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FamilyMemberFormData>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: {
      fullName: "",
      gender: Gender.MALE,
      relationship: RelationshipType.CHILD,
    },
  });

  const openAddDialog = () => {
    setSelectedMember(null);
    reset({
      fullName: "",
      dateOfBirth: "",
      gender: Gender.MALE,
      relationship: RelationshipType.CHILD,
      bloodType: "",
    });
    setDialogMode("add");
  };

  const openViewDialog = (member: FamilyMember) => {
    setSelectedMember(member);
    setDialogMode("view");
  };

  const openEditDialog = (member: FamilyMember) => {
    setSelectedMember(member);
    reset({
      fullName: member.user?.fullName || member.fullName,
      dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split("T")[0] : "",
      gender: member.gender || Gender.MALE,
      relationship: getMemberRelationship(member),
      bloodType: member.bloodType || "",
    });
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedMember(null);
    reset();
  };

  const onSubmit = async (data: FamilyMemberFormData) => {
    try {
      const payload = {
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth || undefined,
        gender: data.gender,
        relationship: data.relationship,
        bloodType: data.bloodType || undefined,
      };

      if (dialogMode === "add") {
        await addMutation.mutateAsync(payload);
        toast({
          title: t("toast.added"),
          description: t("family.addedSuccess"),
          variant: "success",
        });
      } else if (dialogMode === "edit" && selectedMember) {
        await updateMutation.mutateAsync({
          memberId: selectedMember.id,
          data: payload,
        });
        toast({
          title: t("toast.updated"),
          description: t("family.updatedSuccess"),
          variant: "success",
        });
      }
      closeDialog();
    } catch (error) {
      toast({
        title:
          dialogMode === "add"
            ? t("family.addFailed")
            : t("family.updateFailed"),
        description: t("family.errorOccurred"),
        variant: "error",
      });
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: t("toast.deleted"),
        description: t("family.deletedSuccess"),
        variant: "success",
      });
    } catch (error) {
      toast({
        title: t("family.deleteFailed"),
        description: t("family.deleteError"),
        variant: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-muted rounded-lg"
            >
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t("family.title")}
          </CardTitle>
          <Button className="text-xs" onClick={openAddDialog}>
            <Plus className="h-4 w-4 ms-2" />
            {t("family.addMember")}
          </Button>
        </CardHeader>
        <CardContent>
          {family && family.length > 0 ? (
            <div className="space-y-3">
              {family.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                  onClick={() => openViewDialog(member)}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {getInitials(member.user?.fullName || member.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {member.user?.fullName || member.fullName}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {relationshipLabels[getMemberRelationship(member)]}
                      </Badge>
                      {member.gender && (
                        <span className="text-sm text-muted-foreground">
                          {genderLabels[member.gender]}
                        </span>
                      )}
                      {member.age && (
                        <span className="text-sm text-muted-foreground">
                          {member.age} {t("family.yearsOld")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(member);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-error-600 hover:text-error-700 hover:bg-error-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(member.id);
                      }}
                      disabled={deletingId === member.id}
                    >
                      {deletingId === member.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">{t("family.noMembers")}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("family.addForBooking")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Member Dialog */}
      <Dialog
        open={dialogMode === "view"}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("family.memberDetails")}</DialogTitle>
          </DialogHeader>

          {selectedMember && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {getInitials(
                      selectedMember.user?.fullName || selectedMember.fullName,
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedMember.user?.fullName || selectedMember.fullName}
                  </h3>
                  <Badge variant="secondary">
                    {relationshipLabels[getMemberRelationship(selectedMember)]}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">
                    {t("family.gender")}
                  </Label>
                  <p className="font-medium">
                    {selectedMember.gender
                      ? genderLabels[selectedMember.gender]
                      : t("family.notSpecified")}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    {t("family.age")}
                  </Label>
                  <p className="font-medium">
                    {selectedMember.age
                      ? `${selectedMember.age} ${t("family.yearsOld")}`
                      : t("family.notSpecified")}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    {t("family.dateOfBirth")}
                  </Label>
                  <p className="font-medium">
                    {selectedMember.dateOfBirth
                      ? new Date(selectedMember.dateOfBirth).toLocaleDateString(
                          "ar-EG",
                        )
                      : t("family.notSpecified")}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    {t("family.bloodType")}
                  </Label>
                  <p className="font-medium">
                    {selectedMember.bloodType || t("family.notSpecified")}
                  </p>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={closeDialog}>
                  {t("common.close")}
                </Button>
                <Button onClick={() => openEditDialog(selectedMember)}>
                  <Edit className="h-4 w-4 ms-2" />
                  {t("common.edit")}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Family Member Dialog */}
      <Dialog
        open={dialogMode === "add" || dialogMode === "edit"}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add"
                ? t("family.addMemberTitle")
                : t("family.editMemberTitle")}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="member-name" required>
                {t("family.name")}
              </Label>
              <Input
                id="member-name"
                {...register("fullName")}
                icon={<User className="h-5 w-5" />}
                iconPosition="start"
                error={!!errors.fullName}
              />
              {errors.fullName && (
                <p className="text-sm text-error-600">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Relationship */}
            <div className="space-y-2">
              <Label required>{t("family.relationship")}</Label>
              <SearchableSelect
                options={Object.entries(relationshipLabels)
                  .filter(([key]) => key !== RelationshipType.SELF)
                  .map(([value, label]) => ({
                    value,
                    label,
                    icon: <Heart className="h-4 w-4" />,
                  }))}
                value={watch("relationship")}
                onValueChange={(value) =>
                  setValue("relationship", value as RelationshipType, {
                    shouldDirty: true,
                  })
                }
                placeholder={t("family.selectRelationship")}
                showSearch={false}
                clearable={false}
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label>{t("family.gender")}</Label>
              <SearchableSelect
                options={[
                  {
                    value: Gender.MALE,
                    label: t("family.male"),
                    icon: <User className="h-4 w-4" />,
                  },
                  {
                    value: Gender.FEMALE,
                    label: t("family.female"),
                    icon: <User className="h-4 w-4" />,
                  },
                ]}
                value={watch("gender") || ""}
                onValueChange={(value) =>
                  setValue("gender", value as Gender, { shouldDirty: true })
                }
                placeholder={t("family.selectGender")}
                showSearch={false}
                clearable={false}
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label>{t("family.dateOfBirth")}</Label>
              <DateOfBirthInput
                value={watch("dateOfBirth") || ""}
                onChange={(val) =>
                  setValue("dateOfBirth", val, { shouldDirty: true })
                }
              />
              {errors.dateOfBirth?.message && (
                <p className="text-sm text-error-600">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            {/* Blood Type */}
            <div className="space-y-2">
              <Label>{t("family.bloodType")}</Label>
              <SearchableSelect
                options={[
                  {
                    value: "A+",
                    label: "A+",
                    icon: <Droplets className="h-4 w-4 text-error-500" />,
                  },
                  {
                    value: "A-",
                    label: "A-",
                    icon: <Droplets className="h-4 w-4 text-error-500" />,
                  },
                  {
                    value: "B+",
                    label: "B+",
                    icon: <Droplets className="h-4 w-4 text-error-500" />,
                  },
                  {
                    value: "B-",
                    label: "B-",
                    icon: <Droplets className="h-4 w-4 text-error-500" />,
                  },
                  {
                    value: "AB+",
                    label: "AB+",
                    icon: <Droplets className="h-4 w-4 text-error-500" />,
                  },
                  {
                    value: "AB-",
                    label: "AB-",
                    icon: <Droplets className="h-4 w-4 text-error-500" />,
                  },
                  {
                    value: "O+",
                    label: "O+",
                    icon: <Droplets className="h-4 w-4 text-error-500" />,
                  },
                  {
                    value: "O-",
                    label: "O-",
                    icon: <Droplets className="h-4 w-4 text-error-500" />,
                  },
                ]}
                value={watch("bloodType") || ""}
                onValueChange={(value) =>
                  setValue("bloodType", value, { shouldDirty: true })
                }
                placeholder={t("family.selectBloodType")}
                showSearch={false}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={closeDialog}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ms-2" />
                    {dialogMode === "add"
                      ? t("family.adding")
                      : t("family.saving")}
                  </>
                ) : dialogMode === "add" ? (
                  t("common.add")
                ) : (
                  t("common.saveChanges")
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
