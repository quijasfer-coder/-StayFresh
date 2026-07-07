import { PageBackground } from "@/components/ui/page-background";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <PageBackground />
      <div className="card w-full max-w-sm rounded-3xl p-8 sm:p-10">{children}</div>
    </div>
  );
}
