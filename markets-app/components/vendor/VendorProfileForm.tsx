import React, { useState, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export type VendorProfileFormData = {
  businessName: string;
  description: string;
  contactInfo: string;
  instagramHandle: string;
  facebookURL: string;
  websiteURL: string;
};

type VendorProfileFormProps = {
  initialData?: Partial<VendorProfileFormData>;
  mode: 'create' | 'edit';
  loading?: boolean;
  onSubmit: (data: VendorProfileFormData) => void;
};

type FieldErrors = Partial<Record<keyof VendorProfileFormData, string>>;

function validateField(
  field: keyof VendorProfileFormData,
  value: string,
): string | undefined {
  switch (field) {
    case 'businessName':
      if (!value.trim()) return 'Business name is required';
      break;
  }
  return undefined;
}

const emptyForm: VendorProfileFormData = {
  businessName: '',
  description: '',
  contactInfo: '',
  instagramHandle: '',
  facebookURL: '',
  websiteURL: '',
};

export default function VendorProfileForm({
  initialData,
  mode,
  loading,
  onSubmit,
}: VendorProfileFormProps) {
  const [form, setForm] = useState<VendorProfileFormData>({
    ...emptyForm,
    ...initialData,
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleChange = useCallback(
    (field: keyof VendorProfileFormData, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const handleBlur = useCallback(
    (field: keyof VendorProfileFormData) => {
      const error = validateField(field, form[field]);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [form],
  );

  const handleSubmit = useCallback(() => {
    const newErrors: FieldErrors = {};
    const error = validateField('businessName', form.businessName);
    if (error) newErrors.businessName = error;

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
          {mode === 'create' ? 'Create Vendor Profile' : 'Edit Profile'}
        </Heading>

        <FormField
          label="Business Name"
          placeholder="Your business name"
          value={form.businessName}
          error={errors.businessName}
          required
          onChangeText={(v) => handleChange('businessName', v)}
          onBlur={() => handleBlur('businessName')}
        />

        <FormField
          label="Description"
          placeholder="Tell customers about your business"
          value={form.description}
          multiline
          onChangeText={(v) => handleChange('description', v)}
        />

        <FormField
          label="Contact Info"
          placeholder="Phone or email"
          value={form.contactInfo}
          onChangeText={(v) => handleChange('contactInfo', v)}
        />

        <Heading className="text-lg text-typography-900 mt-2">
          Social Links (optional)
        </Heading>

        <FormField
          label="Instagram Handle"
          placeholder="@yourbusiness"
          value={form.instagramHandle}
          autoCapitalize="none"
          onChangeText={(v) => handleChange('instagramHandle', v)}
        />

        <FormField
          label="Facebook URL"
          placeholder="facebook.com/yourbusiness"
          value={form.facebookURL}
          autoCapitalize="none"
          onChangeText={(v) => handleChange('facebookURL', v)}
        />

        <FormField
          label="Website URL"
          placeholder="yourbusiness.com"
          value={form.websiteURL}
          autoCapitalize="none"
          onChangeText={(v) => handleChange('websiteURL', v)}
        />

        <Button
          className="h-14 bg-primary-500 rounded-lg mt-4"
          onPress={handleSubmit}
          disabled={loading}
          accessibilityLabel={
            mode === 'create' ? 'Create profile' : 'Save changes'
          }
        >
          {loading ? (
            <Spinner className="text-white" />
          ) : (
            <ButtonText className="text-white font-semibold text-base">
              {mode === 'create' ? 'Create Profile' : 'Save Changes'}
            </ButtonText>
          )}
        </Button>
      </VStack>
    </ScrollView>
  );
}

type FormFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  error?: string;
  required?: boolean;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  onChangeText: (text: string) => void;
  onBlur?: () => void;
};

function FormField({
  label,
  placeholder,
  value,
  error,
  required,
  multiline,
  autoCapitalize,
  onChangeText,
  onBlur,
}: FormFieldProps) {
  return (
    <VStack className="gap-1">
      <Text className="text-sm font-medium text-typography-600">
        {label}
        {required && <Text className="text-error-500"> *</Text>}
      </Text>
      <Input
        className={`rounded-lg border ${error ? 'border-error-500' : 'border-outline-200'} bg-background-50`}
      >
        <InputField
          className={`px-3 ${multiline ? 'h-20 py-2' : 'h-12'} text-typography-900`}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
          accessibilityLabel={label}
        />
      </Input>
      {error && <Text className="text-xs text-error-500">{error}</Text>}
    </VStack>
  );
}
