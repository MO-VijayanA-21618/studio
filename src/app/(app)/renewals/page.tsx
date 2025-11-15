import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ta } from "@/lib/constants/ta";

export default function RenewalsPage() {
  return (
    <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight mb-8">{ta.sidebar.renewals}</h1>
        <Card>
            <CardHeader>
                <CardTitle>Loan Renewals</CardTitle>
            </CardHeader>
            <CardContent>
                <p>A list of loans due for renewal will be displayed here.</p>
            </CardContent>
        </Card>
    </div>
  );
}
