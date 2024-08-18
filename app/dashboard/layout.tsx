"use client"

import React from 'react';
import { Sidebar } from "@/components/A02-Sidebar";
import { Header } from "@/components/A01-Header";
import { useViewport } from "@/app/contexts/ViewportContext";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Tablet } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { viewportSize, setViewportSize } = useViewport();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FBFD' }}>
      {/* Viewport switcher layer */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-2 flex justify-end">
          <div className="flex items-center gap-1">
            <Button
              variant={viewportSize === "desktop" ? "default" : "outline"}
              size="icon"
              className={`rounded-md ${viewportSize === "desktop" ? "bg-gray-300 text-black" : ""} hover:bg-accent focus:bg-accent`}
              onClick={() => setViewportSize("desktop")}
            >
              <Monitor className="h-5 w-5" />
            </Button>
            <Button
              variant={viewportSize === "tablet" ? "default" : "outline"}
              size="icon"
              className={`rounded-md ${viewportSize === "tablet" ? "bg-gray-300 text-black" : ""} hover:bg-accent focus:bg-accent`}
              onClick={() => setViewportSize("tablet")}
            >
              <Tablet className="h-5 w-5" />
            </Button>
            <Button
              variant={viewportSize === "mobile" ? "default" : "outline"}
              size="icon"
              className={`rounded-md ${viewportSize === "mobile" ? "bg-gray-300 text-black" : ""} hover:bg-accent focus:bg-accent`}
              onClick={() => setViewportSize("mobile")}
            >
              <Smartphone className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pt-14"> {/* Add padding top to push content down */}
        <div className={`flex ${viewportSize !== 'desktop' ? 'flex-col' : ''}`}>
          <Sidebar />
          <div className={`flex flex-1 flex-col ${viewportSize === 'desktop' ? 'pl-14' : 'pl-14 sm:pl-14'}`}>
            <Header />
            <main className="flex-1 space-y-4 p-4 md:p-8" style={{ paddingTop: '5px' }}> {/* Set padding top to 5px */}
              {React.Children.map(children, child =>
                React.isValidElement(child)
                  ? React.cloneElement(child, { viewportSize })
                  : child
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
