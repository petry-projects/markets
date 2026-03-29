/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { setAuthToken, getAuthToken, apolloClient } from '../apollo';
import { gql } from '@apollo/client';

// Mock expo-router to prevent import errors
jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

describe('Apollo Client auth', () => {
  beforeEach(() => {
    setAuthToken(null);
  });

  // Test case 1.2.11: Successful sign-in configures Apollo with Bearer header
  it('setAuthToken stores the token for use in auth headers', () => {
    setAuthToken('test-jwt-123');
    expect(getAuthToken()).toBe('test-jwt-123');
  });

  it('setAuthToken(null) clears the token', () => {
    setAuthToken('some-token');
    setAuthToken(null);
    expect(getAuthToken()).toBeNull();
  });

  it('getAuthToken returns null when no token is set', () => {
    expect(getAuthToken()).toBeNull();
  });

  it('sends Bearer token in Authorization header on requests', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve(JSON.stringify({ data: { __typename: 'Query' } })),
      json: () => Promise.resolve({ data: { __typename: 'Query' } }),
      clone: function () {
        return this;
      },
    });
    const originalFetch = global.fetch;
    global.fetch = mockFetch;

    try {
      setAuthToken('test-token');

      await apolloClient.query({
        query: gql`
          query TestQuery {
            __typename
          }
        `,
        fetchPolicy: 'network-only',
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [, requestInit] = mockFetch.mock.calls[0];
      expect(requestInit.headers.authorization).toBe('Bearer test-token');
    } finally {
      global.fetch = originalFetch;
    }
  });
});
