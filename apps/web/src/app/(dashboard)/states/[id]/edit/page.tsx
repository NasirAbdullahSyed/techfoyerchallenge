"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import type { State, CreateStateInput } from "@repo/shared";
import { StateService } from "@/services/state.service";
import { StateForm } from "@/components/state/state-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface EditStatePageProps {
  params: Promise<{ id: string }>;
}

export default function EditStatePage({ params }: EditStatePageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [state, setState] = useState<State | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    StateService.getById(Number(id))
      .then((res) => {
        if (res.success && res.data) {
          setState(res.data);
        } else {
          toast.error("State not found.");
          router.replace("/states");
        }
      })
      .catch(() => {
        toast.error("Failed to load state.");
        router.replace("/states");
      })
      .finally(() => setIsLoading(false));
  }, [id, router]);

  const handleSubmit = async (data: CreateStateInput) => {
    setIsSubmitting(true);
    try {
      await StateService.update(Number(id), data);
      toast.success(`"${data.name}" updated successfully.`);
      router.push("/states");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update state.";
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
              Edit {state?.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Update details for this state.
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
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      ) : (
        <StateForm
          initialData={state ?? undefined}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => router.push("/states")}
        />
      )}
    </div>
  );
}
