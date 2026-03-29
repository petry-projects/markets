import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

export type TextProps = RNTextProps & {
  className?: string;
};

export function Text({ className, ...props }: TextProps) {
  return <RNText className={className} {...props} />;
}
