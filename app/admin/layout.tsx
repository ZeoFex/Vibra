import { AdminProvider } from "@/lib/contexts/admin-context";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <div className="min-h-screen bg-[#100818] text-white">{children}</div>
    </AdminProvider>
  );
}
