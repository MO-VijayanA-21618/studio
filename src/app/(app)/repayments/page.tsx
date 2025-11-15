import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ta } from "@/lib/constants/ta";

export default function RepaymentsPage() {
  return (
    <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight mb-8">{ta.sidebar.repayments}</h1>
        <Card>
            <CardHeader>
                <CardTitle>Repayment Entry</CardTitle>
            </CardHeader>
            <CardContent>
                <p>A form to enter loan repayments will be available here.</p>
            </CardContent>
        </Card>
    </div>
  );
}
