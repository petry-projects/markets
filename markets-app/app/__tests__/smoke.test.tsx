import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { GluestackUIProvider } from '@/components/gluestack-ui-provider';

describe('App Smoke Test', () => {
  it('renders GluestackUIProvider with a child component', () => {
    const { toJSON } = render(
      <GluestackUIProvider mode="light">
        <Text>Markets App</Text>
      </GluestackUIProvider>,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders text content correctly inside GluestackUIProvider', () => {
    const { getByText } = render(
      <GluestackUIProvider mode="light">
        <Text>Hello Markets</Text>
      </GluestackUIProvider>,
    );
    expect(getByText('Hello Markets')).toBeTruthy();
  });
});
