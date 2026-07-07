"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle, Plus, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  checkCoverageAction,
  submitBookingAction,
  type BookingItemInput,
} from "./actions";
import { BookingConfirmation } from "@/components/booking/booking-confirmation";

const CATEGORY_OPTIONS: { value: BookingItemInput["category"]; label: string }[] = [
  { value: "tenis", label: "Tenis / sneakers" },
  { value: "botas", label: "Botas" },
  { value: "gorras", label: "Gorras" },
  { value: "bolsas", label: "Bolsas" },
];

type CoverageStatus = "idle" | "checking" | "covered" | "not_covered";

export function BookingForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [colonia, setColonia] = useState("");
  const [cp, setCp] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [items, setItems] = useState<BookingItemInput[]>([
    { category: "tenis", quantity: 1, description: "" },
  ]);

  const [coverage, setCoverage] = useState<CoverageStatus>("idle");
  const [coveragePending, startCoverageCheck] = useTransition();
  const [submitPending, startSubmit] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ pickupId: string; scheduledDate: string } | null>(null);

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

  function addItem() {
    setItems((prev) => [...prev, { category: "tenis", quantity: 1, description: "" }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

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
        setSuccess({ pickupId: result.pickupId, scheduledDate });
      } else {
        setError(result.error);
      }
    });
  }

  if (success) {
    return <BookingConfirmation scheduledDate={success.scheduledDate} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Cobertura primero — el resto del form solo se habilita si está cubierta */}
      <div className="glass rounded-2xl p-6 space-y-4">
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
          className="inline-flex items-center gap-2 bg-bone text-ink rounded-full px-5 py-2.5 text-sm font-medium hover:bg-accent hover:text-bone transition-colors disabled:opacity-50"
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
          {items.map((item, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <select
                value={item.category}
                onChange={(e) => updateItem(index, { category: e.target.value as BookingItemInput["category"] })}
                className={cn(inputClass, "sm:w-48")}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                className={cn(inputClass, "sm:w-24")}
              />
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
          ))}
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 text-sm text-bone-mute hover:text-bone"
          >
            <Plus className="w-4 h-4" /> Agregar otra pieza
          </button>
        </div>

        {error && (
          <p className="flex items-start gap-2 text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitPending}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent text-bone rounded-full px-6 py-3.5 font-medium hover:bg-accent-deep transition-colors disabled:opacity-50"
        >
          {submitPending ? "Agendando…" : "Confirmar recolecta"}
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
