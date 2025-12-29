'use client';
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomerDetailsStep } from './_components/CustomerDetailsStep';
import { GoldItemsStep } from './_components/GoldItemsStep';
import { CalculationStep } from './_components/CalculationStep';
import { PhotoCaptureStep } from './_components/PhotoCaptureStep';
import { LoanItemSchema, CustomerSchema, Loan } from '@/lib/types';
import { ta } from '@/lib/constants/ta';
import { useToast } from '@/hooks/use-toast';
import { LoanPreviewModal } from './_components/LoanPreviewModal';
import { createCustomer } from '@/lib/firebase/firestore';
import { createLoanWithAccounting } from '@/lib/firebase/loans-with-accounting';

const CreateLoanFormSchema = z.object({
  customer: CustomerSchema,
  loanItems: z.array(LoanItemSchema).min(1, "Please add at least one gold item."),
  netWeight: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val),
  goldRate: z.union([z.number().positive("Gold rate must be positive."), z.literal('')]).refine(val => val !== '', { message: "Gold rate is required" }),
  estimatedValue: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val),
  margin: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val),
  loanAmount: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val),
  customerPhoto: z.string().nullable().optional(),
  disbursementDate: z.date(),
});

type CreateLoanFormData = z.infer<typeof CreateLoanFormSchema>;

const steps = [
  { id: 'customer', title: ta.createLoan.customerDetails },
  { id: 'items', title: ta.createLoan.goldItems },
  { id: 'photos', title: 'Photos' },
  { id: 'calculate', title: ta.createLoan.calculation },
];

export function CreateLoanForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const methods = useForm<CreateLoanFormData>({
    resolver: zodResolver(CreateLoanFormSchema),
    mode: 'onChange',
    defaultValues: {
      customer: { name: '', phone: '', address: '' },
      loanItems: [{ name: '', weight: 0, purity: '22', photo: null }],
      netWeight: 0,
      goldRate: '',
      estimatedValue: 0,
      margin: 75,
      loanAmount: 0,
      customerPhoto: null,
      disbursementDate: new Date(),
    },
  });

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      setIsEditMode(true);
      setEditingLoanId(editId);
      loadLoanForEdit(editId);
    } else {
      loadSettings();
    }
  }, [searchParams]);

  const loadLoanForEdit = async (loanId: string) => {
    try {
      const loanDoc = await getDoc(doc(db, 'loans', loanId));
      if (loanDoc.exists()) {
        const loan = { id: loanDoc.id, ...loanDoc.data() } as Loan;
        
        // Get customer details
        const customerDoc = await getDoc(doc(db, 'customers', loan.customerId));
        const customer = customerDoc.exists() ? customerDoc.data() : { name: loan.customerName, phone: '', address: '' };
        
        // Populate form with loan data exactly as stored - no calculations
        methods.reset({
          customer,
          loanItems: loan.loanItems,
          goldRate: loan.goldRate,
          netWeight: loan.totalWeight,
          estimatedValue: loan.estimatedValue,
          loanAmount: loan.loanAmount,
          margin: 75, // Keep default margin
          customerPhoto: loan.customerPhoto || null,
          disbursementDate: loan.loanDate?.toDate ? loan.loanDate.toDate() : new Date(loan.loanDate)
        });
      }
    } catch (error) {
      console.error('Error loading loan for edit:', error);
      toast({
        title: "Error",
        description: "Failed to load loan data",
        variant: "destructive"
      });
    }
  };

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
      if (settingsDoc.exists()) {
        const settings = settingsDoc.data();
        if (settings.defaultGoldRate) {
          methods.setValue('goldRate', settings.defaultGoldRate);
        }
        if (settings.ltvRatio) {
          methods.setValue('margin', settings.ltvRatio);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const { trigger, handleSubmit, watch } = methods;

  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 0) isValid = await trigger('customer');
    if (currentStep === 1) isValid = await trigger('loanItems');
    if (currentStep === 2) isValid = true; // Photos are optional
    if (currentStep === 3) isValid = await trigger(['netWeight', 'goldRate', 'estimatedValue', 'margin', 'loanAmount']);

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
    console.log('onSubmit called with data:', data);
    setIsSubmitting(true);
    
    try {
      const { auth } = await import('@/lib/firebase/client');
      console.log('Auth user:', auth.currentUser);
      if (!auth.currentUser) {
        throw new Error('User not authenticated. Please login first.');
      }
      
      if (isEditMode && editingLoanId) {
        // Update existing loan
        const totalWeight = data.loanItems.reduce((sum, item) => sum + item.weight, 0);
        const estimatedValue = totalWeight * data.goldRate;
        
        await updateDoc(doc(db, 'loans', editingLoanId), {
          customerName: data.customer.name,
          loanItems: data.loanItems,
          goldRate: data.goldRate,
          totalWeight,
          estimatedValue,
          loanAmount: data.loanAmount,
          customerPhoto: data.customerPhoto
        });
        
        // Update customer details
        const loanDoc = await getDoc(doc(db, 'loans', editingLoanId));
        if (loanDoc.exists()) {
          const loan = loanDoc.data();
          await updateDoc(doc(db, 'customers', loan.customerId), data.customer);
        }
        
        toast({
          title: "Loan Updated",
          description: `${data.customer.name}'s loan has been updated.`
        });
      } else {
        // Create new loan
        console.log('Creating customer:', data.customer);
        const customerDoc = await createCustomer(data.customer);
        console.log('Customer created:', customerDoc.id);
        
        const totalWeight = data.loanItems.reduce((sum, item) => sum + item.weight, 0);
        const estimatedValue = totalWeight * data.goldRate;
        
        const loanData = {
          customerId: customerDoc.id,
          customerName: data.customer.name,
          loanItems: data.loanItems,
          goldRate: data.goldRate,
          totalWeight,
          estimatedValue,
          loanAmount: data.loanAmount,
          loanDate: data.disbursementDate,
          status: 'Active' as const,
          customerPhoto: data.customerPhoto,
          receiptNumber: (window as any).currentReceiptNumber
        };
        
        console.log('Creating loan with accounting:', loanData);
        const loanId = await createLoanWithAccounting(loanData, auth.currentUser.uid);
        console.log('Loan created with accounting entries:', loanId);
        
        toast({
          title: "கடன் வெற்றிகரமாக உருவாக்கப்பட்டது",
          description: `${data.customer.name} அவர்களின் கடன் பதியப்பட்டது.`
        });
      }
      
      router.push('/loans');
    } catch (error) {
      console.error('Loan creation/update error:', error);
      alert(`Error: ${error.message}`);
      toast({
        title: "பிழை",
        description: `கடன் ${isEditMode ? 'மாற்றுவதில்' : 'உருவாக்குவதில்'} பிழை: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedData = watch();

  return (
    <FormProvider {...methods}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {isEditMode ? 'Edit Loan' : ta.createLoan.title}
          </h1>
        </div>
        
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
              {currentStep === 2 && <PhotoCaptureStep />}
              {currentStep === 3 && <CalculationStep onGeneratePreview={() => setIsPreviewOpen(true)} />}

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
                  <Button type="button" onClick={() => setIsPreviewOpen(true)} disabled={isSubmitting}>
                    Preview & {isEditMode ? 'Update' : 'Save'} Loan
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
        onConfirm={async () => {
          console.log('Confirm clicked - starting submission');
          try {
            await handleSubmit(onSubmit)();
            console.log('Submission completed successfully');
          } catch (error) {
            console.error('Submission failed:', error);
          } finally {
            setIsPreviewOpen(false);
          }
        }}
        data={watchedData}
        isEditMode={isEditMode}
        existingReceiptNumber={isEditMode ? watchedData.receiptNumber : undefined}
      />
    </FormProvider>
  );
}
