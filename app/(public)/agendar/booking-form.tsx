"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle, Plus, Trash2, AlertCircle, Camera, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMXN, pluralizeItems } from "@/lib/format";
import type { PriceTier } from "@/lib/queries/pricing";
import { createClient } from "@/lib/supabase/client";
import {
  checkCoverageAction,
  submitBookingAction,
  type BookingItemInput,
} from "./actions";
import { BookingConfirmation } from "@/components/booking/booking-confirmation";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const PHOTO_BUCKET = "pickup-photos";

const CATEGORY_OPTIONS: { value: BookingItemInput["category"]; label: string }[] = [
  { value: "tenis", label: "Tenis / sneakers" },
  { value: "botas", label: "Botas" },
  { value: "gorras", label: "Gorras" },
  { value: "bolsas", label: "Bolsas" },
];

type CoverageStatus = "idle" | "checking" | "covered" | "not_covered";

function defaultItemForCategory(
  category: BookingItemInput["category"],
  priceTiers: PriceTier[],
): BookingItemInput {
  const tiersForCategory = priceTiers.filter((t) => t.category === category);
  const firstTier = tiersForCategory[0];
  return firstTier
    ? { category, quantity: firstTier.quantity, description: "", priceCents: firstTier.price_cents }
    : { category, quantity: 1, description: "", priceCents: null };
}

export function BookingForm({ priceTiers }: { priceTiers: PriceTier[] }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [colonia, setColonia] = useState("");
  const [cp, setCp] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [items, setItems] = useState<BookingItemInput[]>([defaultItemForCategory("tenis", priceTiers)]);
  const [photoPreviews, setPhotoPreviews] = useState<(string | null)[]>([null]);
  const [photoUploading, setPhotoUploading] = useState<boolean[]>([false]);
  const [photoErrors, setPhotoErrors] = useState<(string | null)[]>([null]);

  const [coverage, setCoverage] = useState<CoverageStatus>("idle");
  const [coveragePending, startCoverageCheck] = useTransition();
  const [submitPending, startSubmit] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ pickupId: string; scheduledDate: string; totalCents: number } | null>(
    null,
  );

  const total = items.reduce((sum, item) => sum + (item.priceCents ?? 0), 0);
  const hasUnpriced = items.some((item) => item.priceCents == null);

  function handleCheckCoverage() {
    if (!colonia && !cp) return;
    setError(null);
    startCoverageCheck(async () => {
      const result = await checkCoverageAction(colonia, cp);
      if (!result.ok) {
        setCoverage("idle");
        setError(result.error);
        return;
      }
      setCoverage(result.covered ? "covered" : "not_covered");
    });
  }

  function updateItem(index: number, patch: Partial<BookingItemInput>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function handleCategoryChange(index: number, category: BookingItemInput["category"]) {
    setItems((prev) => prev.map((item, i) => (i === index ? defaultItemForCategory(category, priceTiers) : item)));
    clearPhoto(index);
  }

  async function handlePhotoChange(index: number, file: File | null) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoErrors((prev) => prev.map((e, i) => (i === index ? "Selecciona una imagen." : e)));
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoErrors((prev) => prev.map((e, i) => (i === index ? "La foto pesa más de 8MB." : e)));
      return;
    }

    setPhotoErrors((prev) => prev.map((e, i) => (i === index ? null : e)));

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreviews((prev) => prev.map((p, i) => (i === index ? previewUrl : p)));
    setPhotoUploading((prev) => prev.map((u, i) => (i === index ? true : u)));

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `booking/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
      updateItem(index, { photoUrl: data.publicUrl });
    } catch {
      setPhotoErrors((prev) => prev.map((e, i) => (i === index ? "No pudimos subir la foto. Intenta de nuevo." : e)));
      setPhotoPreviews((prev) => prev.map((p, i) => (i === index ? null : p)));
      updateItem(index, { photoUrl: null });
    } finally {
      setPhotoUploading((prev) => prev.map((u, i) => (i === index ? false : u)));
    }
  }

  function clearPhoto(index: number) {
    setPhotoPreviews((prev) => prev.map((p, i) => (i === index ? null : p)));
    setPhotoErrors((prev) => prev.map((e, i) => (i === index ? null : e)));
    updateItem(index, { photoUrl: null });
  }

  function handleTierChange(index: number, quantity: number) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const tier = priceTiers.find((t) => t.category === item.category && t.quantity === quantity);
        return { ...item, quantity, priceCents: tier?.price_cents ?? null };
      }),
    );
  }

  function addItem() {
    setItems((prev) => [...prev, defaultItemForCategory("tenis", priceTiers)]);
    setPhotoPreviews((prev) => [...prev, null]);
    setPhotoUploading((prev) => [...prev, false]);
    setPhotoErrors((prev) => [...prev, null]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    setPhotoUploading((prev) => prev.filter((_, i) => i !== index));
    setPhotoErrors((prev) => prev.filter((_, i) => i !== index));
  }

  const anyPhotoUploading = photoUploading.some(Boolean);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (coverage !== "covered") return;
    setError(null);
    startSubmit(async () => {
      const result = await submitBookingAction({
        fullName,
        phone,
        address,
        colonia,
        cp,
        scheduledDate,
        items,
      });
      if (result.ok) {
        setSuccess({ pickupId: result.pickupId, scheduledDate, totalCents: total });
      } else {
        setError(result.error);
      }
    });
  }

  if (success) {
    return (
      <BookingConfirmation
        scheduledDate={success.scheduledDate}
        totalCents={success.totalCents}
        hasUnpriced={hasUnpriced}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Cobertura primero — el resto del form solo se habilita si está cubierta */}
      <div className="card rounded-2xl p-6 space-y-4">
        <p className="eyebrow">Paso 1 · ¿Llegamos a tu zona?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Colonia">
            <input
              value={colonia}
              onChange={(e) => {
                setColonia(e.target.value);
                setCoverage("idle");
              }}
              placeholder="Roma Norte"
              className={inputClass}
            />
          </Field>
          <Field label="Código postal (opcional)">
            <input
              value={cp}
              onChange={(e) => {
                setCp(e.target.value);
                setCoverage("idle");
              }}
              placeholder="06700"
              className={inputClass}
            />
          </Field>
        </div>
        <button
          type="button"
          onClick={handleCheckCoverage}
          disabled={coveragePending || (!colonia && !cp)}
          className="btn-outline px-5 py-2.5 text-xs disabled:opacity-50"
        >
          {coveragePending ? "Verificando…" : "Verificar cobertura"}
        </button>

        {coverage === "covered" && (
          <p className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="w-4 h-4" /> Cubrimos tu zona.
          </p>
        )}
        {coverage === "not_covered" && (
          <p className="flex items-center gap-2 text-sm text-danger">
            <XCircle className="w-4 h-4" /> Todavía no llegamos a tu colonia. Escríbenos por WhatsApp para avisarte cuando ampliemos cobertura.
          </p>
        )}
        {coverage !== "covered" && error && (
          <p className="flex items-start gap-2 text-sm text-danger">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
          </p>
        )}
      </div>

      {/* Resto del formulario — deshabilitado hasta confirmar cobertura */}
      <fieldset disabled={coverage !== "covered"} className="space-y-6 disabled:opacity-40">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre completo">
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Teléfono / WhatsApp">
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="55 1234 5678"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Dirección">
          <input
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Calle, número, referencias"
            className={inputClass}
          />
        </Field>

        <Field label="Fecha preferida de recolecta">
          <input
            required
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className={inputClass}
          />
        </Field>

        <div className="space-y-3">
          <p className="eyebrow">Piezas a limpiar</p>
          {items.map((item, index) => {
            const tiersForCategory = priceTiers.filter((t) => t.category === item.category);
            const hasTiers = tiersForCategory.length > 0;

            return (
              <div key={index} className="space-y-2 pb-3 border-b border-bone-border/10 last:border-0">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <select
                    value={item.category}
                    onChange={(e) => handleCategoryChange(index, e.target.value as BookingItemInput["category"])}
                    className={cn(inputClass, "sm:w-48")}
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {hasTiers ? (
                    <select
                      value={item.quantity}
                      onChange={(e) => handleTierChange(index, Number(e.target.value))}
                      className={cn(inputClass, "sm:w-56")}
                    >
                      {tiersForCategory.map((tier) => (
                        <option key={tier.id} value={tier.quantity}>
                          {pluralizeItems(tier.quantity, tier.category)} — {formatMXN(tier.price_cents)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                      className={cn(inputClass, "sm:w-24")}
                    />
                  )}

                  <input
                    value={item.description ?? ""}
                    onChange={(e) => updateItem(index, { description: e.target.value })}
                    placeholder="Descripción (opcional) — ej. Jordan 1 Chicago"
                    className={cn(inputClass, "flex-1")}
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-bone-mute hover:text-danger p-2"
                      aria-label="Quitar pieza"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {photoPreviews[index] ? (
                    <div className="relative shrink-0">
                      <img
                        src={photoPreviews[index]!}
                        alt="Foto de la pieza"
                        className="w-14 h-14 rounded-lg object-cover border border-bone-border/40"
                      />
                      {photoUploading[index] ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-ink/60 rounded-lg">
                          <Loader2 className="w-4 h-4 text-bone animate-spin" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => clearPhoto(index)}
                          className="absolute -top-1.5 -right-1.5 bg-ink border border-bone-border/40 rounded-full p-0.5 text-bone-mute hover:text-danger"
                          aria-label="Quitar foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <label className="inline-flex items-center gap-1.5 text-xs text-bone-mute hover:text-bone cursor-pointer">
                      <Camera className="w-4 h-4" />
                      Agregar foto (opcional)
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoChange(index, e.target.files?.[0] ?? null)}
                      />
                    </label>
                  )}
                  {photoErrors[index] && (
                    <span className="text-xs text-danger">{photoErrors[index]}</span>
                  )}
                </div>
              </div>
            );
          })}
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 text-sm text-bone-mute hover:text-bone"
          >
            <Plus className="w-4 h-4" /> Agregar otra pieza
          </button>
        </div>

        <div className="card rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="eyebrow">Total estimado</p>
            {hasUnpriced && (
              <p className="text-xs text-bone-mute mt-1">
                Algunas piezas no tienen paquete definido — se cotizan directo.
              </p>
            )}
          </div>
          <p className="font-display font-bold text-3xl text-accent">{formatMXN(total)}</p>
        </div>

        {error && (
          <p className="flex items-start gap-2 text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitPending || anyPhotoUploading}
          className="btn-primary w-full sm:w-auto px-8 py-3.5 text-sm disabled:opacity-50"
        >
          {anyPhotoUploading ? "Subiendo foto…" : submitPending ? "Agendando…" : "Confirmar recolecta"}
        </button>
      </fieldset>
    </form>
  );
}

const inputClass =
  "w-full bg-ink-surface border border-bone-border/40 rounded-lg px-4 py-3 text-sm text-bone placeholder:text-bone-mute/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] uppercase tracking-widest text-bone-mute mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}
