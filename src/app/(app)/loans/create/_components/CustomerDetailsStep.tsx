'use client';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ta } from '@/lib/constants/ta';

export function CustomerDetailsStep() {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="customer.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{ta.common.name}</FormLabel>
            <FormControl>
              <Input placeholder="வாடிக்கையாளர் பெயர்" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="customer.phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{ta.common.phone}</FormLabel>
            <FormControl>
              <Input placeholder="9876543210" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="customer.address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{ta.common.address}</FormLabel>
            <FormControl>
              <Textarea placeholder="முழு முகவரி" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
