import { ApolloClient, InMemoryCache } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import { SetContextLink } from '@apollo/client/link/context';

const apiUrl: string =
  (process.env['EXPO_PUBLIC_API_URL'] as string | undefined) ?? 'http://localhost:8080/query';

const httpLink = new HttpLink({
  uri: apiUrl,
});

const authLink = new SetContextLink((prevContext) => {
  // Token retrieval will be implemented in Story 1.2
  const headers = (prevContext['headers'] ?? {}) as Record<string, string>;
  return {
    headers: {
      ...headers,
      // authorization: `Bearer ${token}`,
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
