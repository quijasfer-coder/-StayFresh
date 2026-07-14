import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { SectionTitle } from "@/components/ui/section-title";
import {
  CATEGORY_LABEL,
  CATEGORY_IMAGE,
  CATEGORY_TAGLINE,
  CATEGORY_INCLUDES,
  CATEGORY_ORDER,
} from "@/lib/categories";
import type { Database } from "@/lib/database.types";

type ItemCategory = Database["public"]["Enums"]["item_category"];

export function generateStaticParams() {
  return CATEGORY_ORDER.map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category: categoryParam } = await params;
  const category = categoryParam as ItemCategory;
  const label = CATEGORY_LABEL[category];
  return { title: label ? `${label} · Servicios` : "Servicios" };
}

export default async function ServiceCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categoryParam } = await params;
  const category = categoryParam as ItemCategory;
  const label = CATEGORY_LABEL[category];

  if (!label) notFound();

  const includes = CATEGORY_INCLUDES[category];

  return (
    <section className="container py-20">
      <Link
        href="/servicios"
        className="inline-flex items-center gap-1.5 text-sm text-bone-mute hover:text-bone mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Servicios
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div className="relative overflow-hidden rounded-2xl aspect-[4/5]">
          <Image
            src={CATEGORY_IMAGE[category]}
            alt={label}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

        <div>
          <SectionTitle eyebrow="Qué incluye" title={label} className="mb-4" />
          <p className="text-bone-mute text-lg mb-8">{CATEGORY_TAGLINE[category]}</p>

          <ul className="space-y-3 mb-10">
            {includes.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base">{item}</span>
              </li>
            ))}
          </ul>

          <Link href="/agendar" className="btn-primary w-fit px-8 py-4 text-sm">
            Agendar mi recolecta
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
