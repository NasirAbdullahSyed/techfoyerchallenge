"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import type { Country, CreateCountryInput } from "@repo/shared";
import { CountryService } from "@/services/country.service";
import { CountryForm } from "@/components/country/country-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface EditCountryPageProps {
  params: Promise<{ id: string }>;
}

export default function EditCountryPage({ params }: EditCountryPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [country, setCountry] = useState<Country | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    CountryService.getById(Number(id))
      .then((res) => {
        if (res.success && res.data) {
          setCountry(res.data);
        } else {
          toast.error("Country not found.");
          router.replace("/countries");
        }
      })
      .catch(() => {
        toast.error("Failed to load country.");
        router.replace("/countries");
      })
      .finally(() => setIsLoading(false));
  }, [id, router]);

  const handleSubmit = async (data: CreateCountryInput) => {
    setIsSubmitting(true);
    try {
      await CountryService.update(Number(id), data);
      toast.success(`"${data.name}" updated successfully.`);
      router.push("/countries");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update country.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 gap-1.5 text-muted-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Header */}
      <div>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-48 rounded-md" />
            <Skeleton className="h-4 w-64 rounded-md mt-2" />
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight">
              Edit {country?.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Update details for this country.
            </p>
          </>
        )}
      </div>

      <Separator />

      {/* Form */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      ) : (
        <CountryForm
          initialData={country ?? undefined}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => router.push("/countries")}
        />
      )}
    </div>
  );
}
