"use client"

import { B09aCardOrder } from "@/components/B09a-CardOrder";
import { B09bCardStats } from "@/components/B09b-CardStats";
import { B09cOrderTable } from "@/components/B09c-OrderTable";
import { B09dOrderDetails } from "@/components/B09d-OrderDetails";

export default function OrdersPage({ viewportSize = 'desktop' }) {
  const containerClass = {
    desktop: "grid gap-6",
    tablet: "flex flex-col gap-6",
    mobile: "flex flex-col gap-6"
  }[viewportSize];

  return (
    <div className={containerClass}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <B09aCardOrder />
          <div className="grid gap-4 sm:grid-cols-2 mt-6">
            <B09bCardStats 
              title="This Week" 
              amount="$1,329" 
              description="+25% from last week" 
              value={25} 
            />
            <B09bCardStats 
              title="This Month" 
              amount="$5,329" 
              description="+10% from last month" 
              value={10} 
            />
          </div>
          <div className="mt-6">
            <B09cOrderTable />
          </div>
        </div>
        {viewportSize === 'desktop' && (
          <div className="lg:col-span-1">
            <B09dOrderDetails />
          </div>
        )}
      </div>
    </div>
  );
}