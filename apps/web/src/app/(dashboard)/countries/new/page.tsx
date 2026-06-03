"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import type { CreateCountryInput } from "@repo/shared";
import { CountryService } from "@/services/country.service";
import { CountryForm } from "@/components/country/country-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function NewCountryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateCountryInput) => {
    setIsSubmitting(true);
    try {
      await CountryService.create(data);
      toast.success(`Country "${data.name}" created successfully.`);
      router.push("/countries");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create country.";
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
        <h1 className="text-2xl font-bold tracking-tight">New Country</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add a new country to the system.
        </p>
      </div>

      <Separator />

      {/* Form */}
      <CountryForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={() => router.push("/countries")}
      />
    </div>
  );
}
