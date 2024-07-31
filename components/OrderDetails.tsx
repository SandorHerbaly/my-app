import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function OrderDetails() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">Order Oe31b70H</CardTitle>
          <CardDescription>Date: November 23, 2023</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6 text-sm">
        <div className="grid gap-3">
          <div className="font-semibold">Order Details</div>
          <ul className="grid gap-3">
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Glimmer Lamps x <span>2</span></span>
              <span>$250.00</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Aqua Filters x <span>1</span></span>
              <span>$49.00</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
