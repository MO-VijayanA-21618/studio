'use client';
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomerDetailsStep } from './_components/CustomerDetailsStep';
import { GoldItemsStep } from './_components/GoldItemsStep';
import { CalculationStep } from './_components/CalculationStep';
import { LoanItemSchema, CustomerSchema } from '@/lib/types';
import { ta } from '@/lib/constants/ta';
import { useToast } from '@/hooks/use-toast';
import { LoanPreviewModal } from './_components/LoanPreviewModal';

const CreateLoanFormSchema = z.object({
  customer: CustomerSchema,
  loanItems: z.array(LoanItemSchema).min(1, "Please add at least one gold item."),
  goldRate: z.number({ required_error: "Gold rate is required"}).positive("Gold rate must be positive."),
  loanAmount: z.number().positive(),
});

type CreateLoanFormData = z.infer<typeof CreateLoanFormSchema>;

const steps = [
  { id: 'customer', title: ta.createLoan.customerDetails },
  { id: 'items', title: ta.createLoan.goldItems },
  { id: 'calculate', title: ta.createLoan.calculation },
];

export function CreateLoanForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const methods = useForm<CreateLoanFormData>({
    resolver: zodResolver(CreateLoanFormSchema),
    mode: 'onChange',
    defaultValues: {
      customer: { name: '', phone: '', address: '' },
      loanItems: [{ name: '', weight: 0, purity: '22' }],
      goldRate: 0,
      loanAmount: 0,
    },
  });

  const { trigger, handleSubmit, watch } = methods;

  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 0) isValid = await trigger('customer');
    if (currentStep === 1) isValid = await trigger('loanItems');
    if (currentStep === 2) isValid = await trigger(['goldRate', 'loanAmount']);

    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (data: CreateLoanFormData) => {
    setIsSubmitting(true);
    // Simulate API call to save to Firestore
    console.log("Form Data Submitted:", data);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);

    toast({
        title: "கடன் வெற்றிகரமாக உருவாக்கப்பட்டது",
        description: `${data.customer.name} அவர்களின் கடன் பதியப்பட்டது.`
    });

    router.push('/dashboard');
  };

  const watchedData = watch();

  return (
    <FormProvider {...methods}>
      <div className="space-y-8">
        <div className="flex items-center justify-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  currentStep >= index ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                }`}
              >
                {index + 1}
              </div>
              <p className={`ml-2 hidden text-sm font-medium md:block ${currentStep >= index ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.title}
              </p>
              {index < steps.length - 1 && <div className="ml-4 h-px w-16 bg-border"></div>}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              {currentStep === 0 && <CustomerDetailsStep />}
              {currentStep === 1 && <GoldItemsStep />}
              {currentStep === 2 && <CalculationStep onGeneratePreview={() => setIsPreviewOpen(true)} />}

              <div className="mt-8 flex justify-between">
                {currentStep > 0 ? (
                  <Button type="button" variant="outline" onClick={handlePrevious}>
                    {ta.createLoan.previous}
                  </Button>
                ) : <div></div>}
                
                {currentStep < steps.length - 1 ? (
                  <Button type="button" onClick={handleNext}>
                    {ta.createLoan.next}
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? ta.createLoan.submitting : ta.createLoan.submit}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <LoanPreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        data={watchedData}
      />
    </FormProvider>
  );
}
