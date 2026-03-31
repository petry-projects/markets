import React, { useState, useCallback } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export type MarketFormData = {
  name: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
  contactEmail: string;
  contactPhone: string;
  recoveryContact: string;
  instagram: string;
  facebook: string;
  website: string;
  twitter: string;
};

type MarketFormProps = {
  initialData?: Partial<MarketFormData>;
  mode: 'create' | 'edit';
  loading?: boolean;
  onSubmit: (data: MarketFormData) => void;
};

type FieldErrors = Partial<Record<keyof MarketFormData, string>>;

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateField(
  field: keyof MarketFormData,
  value: string,
  mode: 'create' | 'edit',
): string | undefined {
  switch (field) {
    case 'name':
      if (!value.trim()) return 'Market name is required';
      break;
    case 'address':
      if (!value.trim()) return 'Address is required';
      break;
    case 'latitude': {
      const lat = parseFloat(value);
      if (isNaN(lat) || lat < -90 || lat > 90) return 'Latitude must be between -90 and 90';
      break;
    }
    case 'longitude': {
      const lng = parseFloat(value);
      if (isNaN(lng) || lng < -180 || lng > 180) return 'Longitude must be between -180 and 180';
      break;
    }
    case 'contactEmail':
      if (!value.trim()) return 'Contact email is required';
      if (!validateEmail(value)) return 'Invalid email format';
      break;
    case 'recoveryContact':
      if (mode === 'create' && !value.trim()) return 'Recovery contact is required';
      break;
  }
  return undefined;
}

const emptyForm: MarketFormData = {
  name: '',
  description: '',
  address: '',
  latitude: '',
  longitude: '',
  contactEmail: '',
  contactPhone: '',
  recoveryContact: '',
  instagram: '',
  facebook: '',
  website: '',
  twitter: '',
};

export function MarketForm({ initialData, mode, loading, onSubmit }: MarketFormProps) {
  const [form, setForm] = useState({ ...emptyForm, ...initialData });
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleBlur = useCallback(
    (field: keyof MarketFormData) => {
      const error = validateField(field, form[field], mode);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [form, mode],
  );

  const handleChange = useCallback((field: keyof MarketFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleSubmit = useCallback(() => {
    const requiredFields: (keyof MarketFormData)[] = [
      'name',
      'address',
      'latitude',
      'longitude',
      'contactEmail',
    ];
    if (mode === 'create') requiredFields.push('recoveryContact');

    const newErrors: FieldErrors = {};
    for (const field of requiredFields) {
      const error = validateField(field, form[field], mode);
      if (error !== undefined) newErrors[field] = error;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Validation Error', 'Please fix the errors before submitting.');
      return;
    }

    onSubmit(form);
  }, [form, mode, onSubmit]);

  return (
    <ScrollView className="flex-1 bg-background-0">
      <VStack className="p-4 gap-5">
        <Heading className="text-xl text-typography-900">
          {mode === 'create' ? 'Create Market' : 'Edit Market'}
        </Heading>

        <FormField
          label="Market Name"
          placeholder="e.g. Riverside Farmers Market"
          value={form.name}
          error={errors.name}
          required
          onChangeText={(v) => {
            handleChange('name', v);
          }}
          onBlur={() => {
            handleBlur('name');
          }}
        />

        <FormField
          label="Address"
          placeholder="123 Market St"
          value={form.address}
          error={errors.address}
          required
          onChangeText={(v) => {
            handleChange('address', v);
          }}
          onBlur={() => {
            handleBlur('address');
          }}
        />

        <FormField
          label="Description"
          placeholder="Tell customers about your market (optional)"
          value={form.description}
          onChangeText={(v) => {
            handleChange('description', v);
          }}
          multiline
        />

        <Box className="flex-row gap-3">
          <Box className="flex-1">
            <FormField
              label="Latitude"
              placeholder="40.7128"
              value={form.latitude}
              error={errors.latitude}
              required
              keyboardType="numeric"
              onChangeText={(v) => {
                handleChange('latitude', v);
              }}
              onBlur={() => {
                handleBlur('latitude');
              }}
            />
          </Box>
          <Box className="flex-1">
            <FormField
              label="Longitude"
              placeholder="-74.0060"
              value={form.longitude}
              error={errors.longitude}
              required
              keyboardType="numeric"
              onChangeText={(v) => {
                handleChange('longitude', v);
              }}
              onBlur={() => {
                handleBlur('longitude');
              }}
            />
          </Box>
        </Box>

        <FormField
          label="Contact Email"
          placeholder="info@yourmarket.com"
          value={form.contactEmail}
          error={errors.contactEmail}
          required
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(v) => {
            handleChange('contactEmail', v);
          }}
          onBlur={() => {
            handleBlur('contactEmail');
          }}
        />

        <FormField
          label="Contact Phone (optional)"
          placeholder="+1 (555) 000-0000"
          value={form.contactPhone}
          keyboardType="phone-pad"
          onChangeText={(v) => {
            handleChange('contactPhone', v);
          }}
        />

        {mode === 'create' && (
          <FormField
            label="Recovery Contact"
            placeholder="recovery@example.com"
            value={form.recoveryContact}
            error={errors.recoveryContact}
            required
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(v) => {
              handleChange('recoveryContact', v);
            }}
            onBlur={() => {
              handleBlur('recoveryContact');
            }}
            hint="Required for account security. Must differ from sign-in email."
          />
        )}

        <Heading className="text-lg text-typography-900 mt-2">Social Links (optional)</Heading>

        <FormField
          label="Instagram"
          placeholder="@yourmarket"
          value={form.instagram}
          autoCapitalize="none"
          onChangeText={(v) => {
            handleChange('instagram', v);
          }}
        />

        <FormField
          label="Facebook"
          placeholder="facebook.com/your-market"
          value={form.facebook}
          autoCapitalize="none"
          onChangeText={(v) => {
            handleChange('facebook', v);
          }}
        />

        <FormField
          label="Website"
          placeholder="your-market.com"
          value={form.website}
          autoCapitalize="none"
          onChangeText={(v) => {
            handleChange('website', v);
          }}
        />

        <FormField
          label="Twitter / X"
          placeholder="@yourmarket"
          value={form.twitter}
          autoCapitalize="none"
          onChangeText={(v) => {
            handleChange('twitter', v);
          }}
        />

        <Button
          className="h-14 bg-primary-500 rounded-lg mt-4"
          onPress={handleSubmit}
          disabled={loading}
          accessibilityLabel={mode === 'create' ? 'Create market' : 'Save changes'}
        >
          {loading === true ? (
            <Spinner className="text-white" />
          ) : (
            <ButtonText className="text-white font-semibold text-base">
              {mode === 'create' ? 'Create Market' : 'Save Changes'}
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
  hint?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
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
  hint,
  multiline,
  keyboardType,
  autoCapitalize,
  onChangeText,
  onBlur,
}: FormFieldProps) {
  return (
    <VStack className="gap-1">
      <Text className="text-sm font-medium text-typography-600">
        {label}
        {required === true && <Text className="text-error-500"> *</Text>}
      </Text>
      <Input
        className={`rounded-lg border ${error !== undefined && error !== '' ? 'border-error-500' : 'border-outline-200'} bg-background-50`}
      >
        <InputField
          className={`px-3 ${multiline === true ? 'h-20 py-2' : 'h-12'} text-typography-900`}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          multiline={multiline === true}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          accessibilityLabel={label}
        />
      </Input>
      {hint !== undefined && hint !== '' && (error === undefined || error === '') && (
        <Text className="text-xs text-typography-400">{hint}</Text>
      )}
      {error !== undefined && error !== '' && (
        <Text className="text-xs text-error-500">{error}</Text>
      )}
    </VStack>
  );
}
