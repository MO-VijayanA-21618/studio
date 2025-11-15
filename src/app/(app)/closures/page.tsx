import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ta } from "@/lib/constants/ta";

export default function ClosuresPage() {
  return (
    <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight mb-8">{ta.sidebar.closures}</h1>
        <Card>
            <CardHeader>
                <CardTitle>Loan Closures</CardTitle>
            </CardHeader>
            <CardContent>
                <p>A form to process loan closures will be available here.</p>
            </CardContent>
        </Card>
    </div>
  );
}
