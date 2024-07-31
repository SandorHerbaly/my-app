import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function CardStats({ title, amount, percentage, description }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{description}</CardDescription>
        <CardTitle className="text-4xl">{amount}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">{percentage}%</div>
      </CardContent>
      <CardFooter>
        <Progress value={percentage} aria-label={`${percentage}% increase`} />
      </CardFooter>
    </Card>
  );
}
