import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { HttpLink } from '@apollo/client/link/http';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { router } from 'expo-router';

const apiUrl: string = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:8080/query';

const httpLink = new HttpLink({
  uri: apiUrl,
});

/**
 * In-memory auth token. Updated by useAuth hook on sign-in/sign-out.
 * This avoids async SecureStore reads on every request for performance.
 */
let currentAuthToken: string | null = null;

/**
 * Set the auth token used by Apollo Client for all requests.
 * Called by the useAuth hook when token changes.
 */
export function setAuthToken(token: string | null): void {
  currentAuthToken = token;
}

/**
 * Get the current auth token (for testing purposes).
 */
export function getAuthToken(): string | null {
  return currentAuthToken;
}

const authLink = new SetContextLink((prevContext) => {
  const headers = (prevContext['headers'] ?? {}) as Record<string, string>;
  return {
    headers: {
      ...headers,
      ...(currentAuthToken !== null && currentAuthToken !== ''
        ? { authorization: `Bearer ${currentAuthToken}` }
        : {}),
    },
  };
});

/**
 * Error link that redirects to login on UNAUTHENTICATED errors.
 */
const errorLink = new ErrorLink(({ error }) => {
  if (CombinedGraphQLErrors.is(error)) {
    for (const err of error.errors) {
      if (err.extensions?.['code'] === 'UNAUTHENTICATED') {
        // Redirect to login screen on auth failure
        router.replace('/(auth)');
        break;
      }
    }
  }
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
