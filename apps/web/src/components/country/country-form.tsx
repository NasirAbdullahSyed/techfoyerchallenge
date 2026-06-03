"use client";

import { type Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { createCountrySchema, type Country, type CreateCountryInput } from "@repo/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface CountryFormProps {
  /** Pre-populate when editing an existing country */
  initialData?: Country;
  onSubmit: (data: CreateCountryInput) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function CountryForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: CountryFormProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateCountryInput>({
    resolver: zodResolver(createCountrySchema) as Resolver<CreateCountryInput>,
    defaultValues: {
      code: initialData?.code ?? "",
      name: initialData?.name ?? "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const isActive = watch("isActive");

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Code */}
      <div className="space-y-1.5">
        <Label htmlFor="code">
          Country Code <span className="text-destructive">*</span>
        </Label>
        <Input
          id="code"
          placeholder="e.g. US, GB, PK"
          autoComplete="off"
          className={cn(
            errors.code &&
              "border-destructive focus-visible:ring-destructive/30"
          )}
          {...register("code")}
        />
        {errors.code ? (
          <p className="text-xs text-destructive">{errors.code.message}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            2–10 characters. Uppercased automatically.
          </p>
        )}
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">
          Country Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g. United States"
          autoComplete="off"
          className={cn(
            errors.name &&
              "border-destructive focus-visible:ring-destructive/30"
          )}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <Separator />

      {/* Active toggle */}
      <div
        className={cn(
          "flex items-start gap-3 rounded-lg border p-4 transition-colors",
          isActive ? "border-border bg-muted/30" : "border-border"
        )}
      >
        <Checkbox
          id="isActive"
          checked={isActive}
          onCheckedChange={(checked) =>
            setValue("isActive", checked === true, { shouldValidate: true })
          }
          className="mt-0.5"
        />
        <div className="space-y-0.5 leading-none">
          <Label htmlFor="isActive" className="cursor-pointer font-medium">
            Active
          </Label>
          <p className="text-xs text-muted-foreground">
            Inactive countries are hidden from state dropdowns.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-32">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditing ? "Save Changes" : "Create Country"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
