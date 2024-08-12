"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Truck, Copy, CreditCard } from "lucide-react";

export function B09dOrderDetails() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Order Oe31b70H</CardTitle>
          <CardDescription>Date: November 23, 2023</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon">
            <Truck className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Order Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Glimmer Lamps x 2</span>
                <span>$250.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aqua Filters x 1</span>
                <span>$49.00</span>
              </div>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>$299.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>$5.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>$25.00</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>$329.00</span>
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">Shipping Information</h3>
            <p className="text-sm text-muted-foreground">
              Liam Johnson<br />
              1234 Main St.<br />
              Anytown, CA 12345
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Customer Information</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span>liam@acme.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span>+1 234 567 890</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Payment Information</h3>
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              <span>Visa **** **** **** 4532</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <CardDescription>Updated November 23, 2023</CardDescription>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </CardFooter>
    </Card>
  );
}