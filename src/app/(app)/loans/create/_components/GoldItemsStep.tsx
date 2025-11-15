'use client';
import { useFormContext, useFieldArray } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { ta } from '@/lib/constants/ta';
import { Card, CardContent } from '@/components/ui/card';

export function GoldItemsStep() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'loanItems',
  });

  return (
    <div className="space-y-6">
      {fields.map((item, index) => (
        <Card key={item.id} className="relative pt-6">
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
                control={control}
                name={`loanItems.${index}.name`}
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{ta.createLoan.itemName}</FormLabel>
                    <FormControl>
                    <Input placeholder="செயின், வளையல்..." {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`loanItems.${index}.weight`}
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{ta.createLoan.weight}</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="10.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`loanItems.${index}.purity`}
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{ta.createLoan.purity}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="தூய்மை" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="24">24K</SelectItem>
                            <SelectItem value="22">22K</SelectItem>
                            <SelectItem value="18">18K</SelectItem>
                            <SelectItem value="14">14K</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
            </CardContent>
            {fields.length > 1 && (
                <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 text-destructive hover:bg-destructive/10"
                onClick={() => remove(index)}
                >
                <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ name: '', weight: 0, purity: '22' })}
      >
        {ta.createLoan.addGoldItem}
      </Button>
    </div>
  );
}
