"use client";

import { useEffect, useState } from "react";
import { type Resolver, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { createStateSchema, type Country, type State, type CreateStateInput } from "@repo/shared";
import { CountryService } from "@/services/country.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface StateFormProps {
  /** Pre-populate when editing an existing state */
  initialData?: State;
  onSubmit: (data: CreateStateInput) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function StateForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: StateFormProps) {
  const isEditing = !!initialData;

  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [comboOpen, setComboOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateStateInput>({
    resolver: zodResolver(createStateSchema) as Resolver<CreateStateInput>,
    defaultValues: {
      code: initialData?.code ?? "",
      name: initialData?.name ?? "",
      isActive: initialData?.isActive ?? true,
      countryId: initialData?.countryId ?? (0 as unknown as number),
    },
  });

  const isActive = watch("isActive");
  const selectedCountryId = watch("countryId");

  // Load active countries for combobox
  useEffect(() => {
    CountryService.list()
      .then((res) => {
        if (res.success && res.data) setCountries(res.data);
      })
      .finally(() => setCountriesLoading(false));
  }, []);

  const selectedCountry = countries.find((c) => c.id === selectedCountryId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Code */}
      <div className="space-y-1.5">
        <Label htmlFor="code">
          State Code <span className="text-destructive">*</span>
        </Label>
        <Input
          id="code"
          placeholder="e.g. CA, TX, NSW"
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
          State / Province Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g. California"
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

      {/* Country combobox */}
      <div className="space-y-1.5">
        <Label>
          Country <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="countryId"
          control={control}
          render={({ field }) => (
            <Popover open={comboOpen} onOpenChange={setComboOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboOpen}
                    disabled={countriesLoading}
                    className={cn(
                      "w-full justify-between font-normal",
                      !selectedCountry && "text-muted-foreground",
                      errors.countryId &&
                        "border-destructive focus-visible:ring-destructive/30"
                    )}
                  />
                }
              >
                {countriesLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading countries…
                  </>
                ) : selectedCountry ? (
                  <>
                    <span className="font-mono text-xs font-semibold mr-2 text-muted-foreground">
                      {selectedCountry.code}
                    </span>
                    {selectedCountry.name}
                  </>
                ) : (
                  "Select a country…"
                )}
                <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-(--anchor-width) p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search countries…" />
                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {countries.map((country) => (
                        <CommandItem
                          key={country.id}
                          value={country.name}
                          data-checked={
                            field.value === country.id ? "true" : "false"
                          }
                          onSelect={() => {
                            field.onChange(country.id);
                            setComboOpen(false);
                          }}
                        >
                          <span className="font-mono text-xs font-semibold mr-2 text-muted-foreground w-8 shrink-0">
                            {country.code}
                          </span>
                          {country.name}
                          {field.value === country.id && (
                            <Check className="ml-auto h-4 w-4" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        />
        {errors.countryId && (
          <p className="text-xs text-destructive">
            {errors.countryId.message}
          </p>
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
            Inactive states are hidden from public lists.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-32">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditing ? "Save Changes" : "Create State"}
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
