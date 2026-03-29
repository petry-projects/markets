import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

export type HeadingProps = RNTextProps & {
  className?: string;
};

export function Heading({ className, ...props }: HeadingProps) {
  return <RNText className={className} accessibilityRole="header" {...props} />;
}
