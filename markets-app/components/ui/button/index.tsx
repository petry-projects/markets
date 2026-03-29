import React from 'react';
import {
  Pressable,
  Text as RNText,
  type PressableProps,
  type TextProps as RNTextProps,
} from 'react-native';

export type ButtonProps = PressableProps & {
  className?: string;
};

export function Button({ className, ...props }: ButtonProps) {
  return <Pressable className={className} accessibilityRole="button" {...props} />;
}

export type ButtonTextProps = RNTextProps & {
  className?: string;
};

export function ButtonText({ className, ...props }: ButtonTextProps) {
  return <RNText className={className} {...props} />;
}
