import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="p-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
