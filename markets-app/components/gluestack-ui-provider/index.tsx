import React from 'react';
import { View, useColorScheme } from 'react-native';
import { config } from './config';

type GluestackUIProviderProps = {
  mode?: 'light' | 'dark';
  children: React.ReactNode;
};

export function GluestackUIProvider({ mode, children }: GluestackUIProviderProps) {
  const colorScheme = useColorScheme();
  const systemScheme = colorScheme === 'dark' || colorScheme === 'light' ? colorScheme : 'light';
  const resolvedMode = mode ?? systemScheme;

  return (
    <View style={[{ flex: 1 }, resolvedMode === 'dark' ? config.dark : config.light]}>
      {children}
    </View>
  );
}
