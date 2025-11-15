import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ta } from "@/lib/constants/ta";

export default function AllLoansPage() {
  return (
    <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight mb-8">{ta.sidebar.allLoans}</h1>
        <Card>
            <CardHeader>
                <CardTitle>All Loans</CardTitle>
            </CardHeader>
            <CardContent>
                <p>A table of all loans will be displayed here.</p>
            </CardContent>
        </Card>
    </div>
  );
}
