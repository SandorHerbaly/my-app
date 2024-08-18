"use client";

import { B17cProductTable } from "@/components/B17c-ProductTable";

export default function ProductsPage({ viewportSize = 'desktop' }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-3">
        <B17cProductTable />
      </div>
    </div>
  );
}
