"use client"

import { B11aCardOrder } from "@/components/B11a-CardOrder";
import { B11bCardStats } from "@/components/B11b-CardStats";
import { B11cOrderTable } from "@/components/B11c-OrderTable";
import { B11dOrderDetails } from "@/components/B11d-OrderDetails";

export default function ProductsPage({ viewportSize = 'desktop' }) {
  const containerClass = {
    desktop: "grid gap-6",
    tablet: "flex flex-col gap-6",
    mobile: "flex flex-col gap-6"
  }[viewportSize];

  return (
    <div className={containerClass}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <B11aCardOrder />
          <div className="grid gap-4 sm:grid-cols-2 mt-6">
            <B11bCardStats 
              title="This Week" 
              amount="$1,329" 
              description="+25% from last week" 
              value={25} 
            />
            <B11bCardStats 
              title="This Month" 
              amount="$5,329" 
              description="+10% from last month" 
              value={10} 
            />
          </div>
          <div className="mt-6">
            <B11cOrderTable />
          </div>
        </div>
        {viewportSize === 'desktop' && (
          <div className="lg:col-span-1">
            <B11dOrderDetails />
          </div>
        )}
      </div>
    </div>
  );
}