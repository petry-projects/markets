import { renderHook, act } from '@testing-library/react-native';

import { useFollow } from '../useFollow';

const mockFollowMutate = jest.fn().mockResolvedValue({ data: {} });
const mockUnfollowMutate = jest.fn().mockResolvedValue({ data: {} });

jest.mock('@apollo/client/react', () => ({
  useMutation: jest.fn((doc: { kind: string; definitions: [{ name: { value: string } }] }) => {
    // Distinguish between Follow and Unfollow documents by checking mock call order
    const name = doc.definitions[0].name.value;
    if (name.includes('Unfollow') || name === 'Unfollow') {
      return [mockUnfollowMutate, { loading: false }];
    }
    return [mockFollowMutate, { loading: false }];
  }),
}));

jest.mock('@/graphql/generated/graphql', () => ({
  FollowDocument: { kind: 'Document', definitions: [{ name: { value: 'Follow' } }] },
  UnfollowDocument: { kind: 'Document', definitions: [{ name: { value: 'Unfollow' } }] },
  MyCustomerProfileDocument: {
    kind: 'Document',
    definitions: [{ name: { value: 'MyCustomerProfile' } }],
  },
  FollowingFeedDocument: { kind: 'Document', definitions: [{ name: { value: 'FollowingFeed' } }] },
}));

describe('useFollow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns toggleFollow function and loading state', () => {
    const { result } = renderHook(() => useFollow());
    expect(result.current.toggleFollow).toBeInstanceOf(Function);
    expect(result.current.loading).toBe(false);
  });

  it('calls followMutation when not currently following', async () => {
    const { result } = renderHook(() => useFollow());
    await act(async () => {
      await result.current.toggleFollow('VENDOR', 'v1', false);
    });
    expect(mockFollowMutate).toHaveBeenCalledWith({
      variables: { targetType: 'VENDOR', targetID: 'v1' },
    });
    expect(mockUnfollowMutate).not.toHaveBeenCalled();
  });

  it('calls unfollowMutation when currently following', async () => {
    const { result } = renderHook(() => useFollow());
    await act(async () => {
      await result.current.toggleFollow('MARKET', 'm1', true);
    });
    expect(mockUnfollowMutate).toHaveBeenCalledWith({
      variables: { targetType: 'MARKET', targetID: 'm1' },
    });
    expect(mockFollowMutate).not.toHaveBeenCalled();
  });
});
