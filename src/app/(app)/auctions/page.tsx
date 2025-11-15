import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ta } from "@/lib/constants/ta";

export default function AuctionsPage() {
  return (
    <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight mb-8">{ta.sidebar.auctions}</h1>
        <Card>
            <CardHeader>
                <CardTitle>Auction Management</CardTitle>
            </CardHeader>
            <CardContent>
                <p>A list of loans marked for auction will be displayed here.</p>
            </CardContent>
        </Card>
    </div>
  );
}
