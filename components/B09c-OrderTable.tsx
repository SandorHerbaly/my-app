"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const orders = [
  { customer: "Liam Johnson", email: "liam@example.com", type: "Sale", status: "Fulfilled", date: "2023-06-23", amount: "$250.00" },
  { customer: "Olivia Smith", email: "olivia@example.com", type: "Refund", status: "Declined", date: "2023-06-24", amount: "$150.00" },
  { customer: "Noah Williams", email: "noah@example.com", type: "Subscription", status: "Fulfilled", date: "2023-06-25", amount: "$350.00" },
  { customer: "Emma Brown", email: "emma@example.com", type: "Sale", status: "Fulfilled", date: "2023-06-26", amount: "$450.00" },
  { customer: "Liam Johnson", email: "liam@example.com", type: "Sale", status: "Fulfilled", date: "2023-06-23", amount: "$250.00" },
  { customer: "Olivia Smith", email: "olivia@example.com", type: "Refund", status: "Declined", date: "2023-06-24", amount: "$150.00" },
  { customer: "Emma Brown", email: "emma@example.com", type: "Sale", status: "Fulfilled", date: "2023-06-26", amount: "$450.00" },
];

export function B09cOrderTable() {
  return (
    <Card>
      <CardHeader className="px-7">
        <CardTitle>Orders</CardTitle>
        <CardDescription>Recent orders from your store.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, index) => (
              <TableRow key={index} className={index === 0 ? "bg-accent" : ""}>
                <TableCell>
                  <div className="font-medium">{order.customer}</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    {order.email}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{order.type}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant={order.status === "Fulfilled" ? "secondary" : "outline"}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{order.date}</TableCell>
                <TableCell className="text-right">{order.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}