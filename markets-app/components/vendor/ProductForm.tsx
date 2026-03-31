import React, { useState, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export type ProductFormData = {
  name: string;
  description: string;
  category: string;
};

type ProductFormProps = {
  initialData?: Partial<ProductFormData>;
  mode: 'create' | 'edit';
  loading?: boolean;
  onSubmit: (data: ProductFormData) => void;
};

type FieldErrors = Partial<Record<keyof ProductFormData, string>>;

function validateField(field: keyof ProductFormData, value: string): string | undefined {
  switch (field) {
    case 'name':
      if (!value.trim()) return 'Product name is required';
      break;
  }
  return undefined;
}

const emptyForm: ProductFormData = {
  name: '',
  description: '',
  category: '',
};

export default function ProductForm({ initialData, mode, loading, onSubmit }: ProductFormProps) {
  const [form, setForm] = useState({
    ...emptyForm,
    ...initialData,
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleChange = useCallback((field: keyof ProductFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleBlur = useCallback(
    (field: keyof ProductFormData) => {
      const error = validateField(field, form[field]);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [form],
  );

  const handleSubmit = useCallback(() => {
    const newErrors: FieldErrors = {};
    const error = validateField('name', form.name);
    if (error != null && error !== '') newErrors.name = error;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(form);
  }, [form, onSubmit]);

  return (
    <ScrollView className="flex-1 bg-background-0">
      <VStack className="p-4 gap-5">
        <Heading className="text-xl text-typography-900">
          {mode === 'create' ? 'Add Product' : 'Edit Product'}
        </Heading>

        <VStack className="gap-1">
          <Text className="text-sm font-medium text-typography-600">
            Product Name <Text className="text-error-500">*</Text>
          </Text>
          <Input
            className={`rounded-lg border ${errors.name != null && errors.name !== '' ? 'border-error-500' : 'border-outline-200'} bg-background-50`}
          >
            <InputField
              className="px-3 h-12 text-typography-900"
              value={form.name}
              onChangeText={(v) => {
                handleChange('name', v);
              }}
              onBlur={() => {
                handleBlur('name');
              }}
              placeholder="Product name"
              accessibilityLabel="Product name"
            />
          </Input>
          {errors.name != null && errors.name !== '' && (
            <Text className="text-xs text-error-500">{errors.name}</Text>
          )}
        </VStack>

        <VStack className="gap-1">
          <Text className="text-sm font-medium text-typography-600">Category</Text>
          <Input className="rounded-lg border border-outline-200 bg-background-50">
            <InputField
              className="px-3 h-12 text-typography-900"
              value={form.category}
              onChangeText={(v) => {
                handleChange('category', v);
              }}
              placeholder="e.g., Produce, Dairy, Baked Goods"
              accessibilityLabel="Product category"
            />
          </Input>
        </VStack>

        <VStack className="gap-1">
          <Text className="text-sm font-medium text-typography-600">Description</Text>
          <Input className="rounded-lg border border-outline-200 bg-background-50">
            <InputField
              className="px-3 h-20 py-2 text-typography-900"
              value={form.description}
              onChangeText={(v) => {
                handleChange('description', v);
              }}
              placeholder="Describe your product"
              accessibilityLabel="Product description"
              multiline
            />
          </Input>
        </VStack>

        <Button
          className="h-14 bg-primary-500 rounded-lg mt-4"
          onPress={handleSubmit}
          disabled={loading}
          accessibilityLabel={mode === 'create' ? 'Add product' : 'Save product changes'}
        >
          {loading === true ? (
            <Spinner className="text-white" />
          ) : (
            <ButtonText className="text-white font-semibold text-base">
              {mode === 'create' ? 'Add Product' : 'Save Changes'}
            </ButtonText>
          )}
        </Button>
      </VStack>
    </ScrollView>
  );
}
