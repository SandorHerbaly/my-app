"use client";

import React from 'react';
import { Sidebar } from "@/components/A02-Sidebar";
import { Header } from "@/components/A01-Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FBFD' }}>
      {/* Main content */}
      <div className="pt-2">
        <div className="flex">
          <Sidebar />
          <div className="flex flex-1 flex-col md:pl-14 sm:pl-[56px]"> {/* Add padding for tablet view */}
            <Header />
            <main className="flex-1 space-y-4 p-4 md:p-8 mt-3 sm:mt-0" style={{ paddingTop: '5px' }}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
