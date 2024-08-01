"use client"

import { useState, useEffect } from 'react';
import { Sidebar } from "@/components/A02-Sidebar";
import { Header } from "@/components/A01-Header";

export default function DashboardLayout({ children }) {
  const [viewportSize, setViewportSize] = useState('desktop');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setViewportSize('mobile');
      } else if (window.innerWidth < 1024) {
        setViewportSize('tablet');
      } else {
        setViewportSize('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const childrenWithProps = Array.isArray(children)
    ? children.map(child =>
        typeof child === 'object' && child !== null && 'props' in child
          ? { ...child, props: { ...child.props, viewportSize } }
          : child
      )
    : typeof children === 'object' && children !== null && 'props' in children
    ? { ...children, props: { ...children.props, viewportSize } }
    : children;

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-1 flex-col ml-0 sm:ml-14">
        <Header setViewportSize={setViewportSize} />
        <main className="p-4 sm:px-6 lg:px-8">
          {childrenWithProps}
        </main>
      </div>
    </div>
  );
}