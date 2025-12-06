export const dynamic = 'force-dynamic';

import { CreateLoanForm } from "./CreateLoanForm";
import { ta } from "@/lib/constants/ta";

export default function CreateLoanPage() {
  return (
    <div className="max-w-4xl mx-auto">
        <h1 className="font-headline text-3xl font-bold tracking-tight mb-8">{ta.createLoan.title}</h1>
        <CreateLoanForm />
    </div>
  )
}
