"use client"

import { CardOrder } from "@/components/CardOrder";
import { CardStats } from "@/components/CardStats";
import { OrderTable } from "@/components/OrderTable";
import { OrderDetails } from "@/components/OrderDetails";

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
          <CardOrder />
          <div className="grid gap-4 sm:grid-cols-2 mt-6">
            <CardStats 
              title="This Week" 
              amount="$1,329" 
              description="+25% from last week" 
              value={25} 
            />
            <CardStats 
              title="This Month" 
              amount="$5,329" 
              description="+10% from last month" 
              value={10} 
            />
          </div>
          <div className="mt-6">
            <OrderTable />
          </div>
        </div>
        {viewportSize === 'desktop' && (
          <div className="lg:col-span-1">
            <OrderDetails />
          </div>
        )}
      </div>
    </div>
  );
}