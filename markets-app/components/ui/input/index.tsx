import React from 'react';
import { View, TextInput, type ViewProps, type TextInputProps } from 'react-native';

export type InputProps = ViewProps & {
  className?: string;
};

export function Input({ className, ...props }: InputProps) {
  return <View className={className} {...props} />;
}

export type InputFieldProps = TextInputProps & {
  className?: string;
};

export function InputField({ className, ...props }: InputFieldProps) {
  return <TextInput className={className} {...props} />;
}
