import React from 'react';
import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';

export type SpinnerProps = ActivityIndicatorProps;

/**
 * Gluestack-compatible Spinner wrapping React Native's ActivityIndicator.
 * Mirrors the pattern used by Gluestack UI v3 CLI-generated spinner.
 */
export function Spinner(props: SpinnerProps) {
  return <ActivityIndicator {...props} />;
}
