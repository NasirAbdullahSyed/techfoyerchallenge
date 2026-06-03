"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import type { CreateStateInput } from "@repo/shared";
import { StateService } from "@/services/state.service";
import { StateForm } from "@/components/state/state-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function NewStatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateStateInput) => {
    setIsSubmitting(true);
    try {
      await StateService.create(data);
      toast.success(`State "${data.name}" created successfully.`);
      router.push("/states");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create state.";
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
        <h1 className="text-2xl font-bold tracking-tight">New State</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add a new state or province to the system.
        </p>
      </div>

      <Separator />

      {/* Form */}
      <StateForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onCancel={() => router.push("/states")}
      />
    </div>
  );
}
