"use client";

import { P4COMP1ProductTable } from "@/components/P4COMP1ProductTable";

export default function P4Products({ viewportSize = 'desktop' }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-3">
        <P4COMP1ProductTable />
      </div>
    </div>
  );
}
