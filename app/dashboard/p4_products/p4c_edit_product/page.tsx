import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, PlusCircle, Upload } from "lucide-react";

export default function P4cEditProduct() {
  return (
    <div className="grid gap-4 lg:grid-cols-3 mt-5">
      <div className="lg:col-span-2 grid gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold">Pro Controller</h1>
            <Badge variant="outline">In stock</Badge>
          </div>
          <div className="space-x-2 hidden md:block">
            <Button variant="outline">Discard</Button>
            <Button>Save Product</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Lipsum dolor sit amet, consectetur adipiscing elit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Enter product name" defaultValue="Gamer Gear Pro Controller" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter product description"
                className="min-h-[100px]"
                defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl nec ultricies ultricies, nunc nisl ultricies nunc, nec ultricies nunc nisl nec nunc."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock</CardTitle>
            <CardDescription>Lipsum dolor sit amet, consectetur adipiscing elit</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { sku: 'GGPC-001', stock: 100, price: 99.99, size: ['S', 'M', 'L'] },
                  { sku: 'GGPC-002', stock: 143, price: 99.99, size: ['S', 'M', 'L'] },
                  { sku: 'GGPC-003', stock: 32, price: 99.99, size: ['S', 'M', 'L'] },
                ].map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>
                      <Input type="number" defaultValue={item.stock} className="w-20" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" defaultValue={item.price} className="w-24" />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {item.size.map((size, idx) => (
                          <Button key={idx} variant={idx === 1 ? "secondary" : "outline"} size="sm">{size}</Button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Variant
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Category</CardTitle>
          </CardHeader>
          <CardContent className="flex space-x-4">
            <div className="w-full">
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full">
              <Label htmlFor="subcategory">Subcategory (optional)</Label>
              <Select>
                <SelectTrigger id="subcategory">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Product Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>Lipsum dolor sit amet, consectetur adipiscing elit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <Upload className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2].map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded-lg" />
              ))}
              <div className="aspect-square border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Archive Product</CardTitle>
            <CardDescription>Lipsum dolor sit amet, consectetur adipiscing elit.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Archive Product</Button>
          </CardContent>
        </Card>
      </div>

      {/* Mobile-only footer buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t md:hidden">
        <div className="flex justify-center space-x-2">
          <Button variant="outline" className="flex-1">Discard</Button>
          <Button className="flex-1">Save Product</Button>
        </div>
      </div>
    </div>
  );
}