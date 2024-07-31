import { CardOrder } from "@/components/CardOrder";
import { CardStats } from "@/components/CardStats";
import { OrderTable } from "@/components/OrderTable";
import { OrderDetails } from "@/components/OrderDetails";

export default function OrdersPage() {
  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <CardOrder />
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4   ">
        <CardStats title="This Week" amount="$1,329" percentage={25} description="+25% from last week" />
        <CardStats title="This Month" amount="$5,329" percentage={10} description="+10% from last month" />
      </div>
      <OrderTable />
      <OrderDetails />
    </div>
  );
}
