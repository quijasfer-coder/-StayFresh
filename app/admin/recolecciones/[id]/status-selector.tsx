"use client";

import { useState, useTransition } from "react";
import { AlertCircle } from "lucide-react";
import { updatePickupStatusAction } from "../actions";
import { STATUS_LABELS, STATUS_ORDER } from "@/components/admin/status-badge";
import type { PickupStatus } from "@/lib/queries/pickups";
import { cn } from "@/lib/utils";

export function StatusSelector({
  pickupId,
  currentStatus,
}: {
  pickupId: string;
  currentStatus: PickupStatus;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(next: PickupStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updatePickupStatusAction(pickupId, next);
      if (result.ok) {
        setStatus(next);
      } else {
        setError(result.error);
      }
    });
  }

  const options: PickupStatus[] = [...STATUS_ORDER, "cancelada"];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={pending}
            onClick={() => handleChange(opt)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-50",
              opt === status
                ? opt === "cancelada"
                  ? "bg-danger text-bone"
                  : "bg-bone text-ink"
                : "bg-ink-surface text-bone-mute hover:text-bone",
            )}
          >
            {STATUS_LABELS[opt]}
          </button>
        ))}
      </div>
      {error && (
        <p className="flex items-start gap-1.5 text-xs text-danger">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          {error}
        </p>
      )}
    </div>
  );
}
