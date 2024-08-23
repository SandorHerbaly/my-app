"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface CardStatsProps {
  title: string;
  amount: string;
  description: string;
  value: number;
}

export function P1S2CardStats({ title, amount, description, value }: CardStatsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-4xl">{amount}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">
          {description}
        </div>
      </CardContent>
      <CardFooter>
        <Progress value={value} aria-label={`${value}% increase`} />
      </CardFooter>
    </Card>
  )
}