import { useCallback } from 'react';
import { useMutation } from '@apollo/client/react';
import {
  FollowDocument,
  UnfollowDocument,
  MyCustomerProfileDocument,
  FollowingFeedDocument,
} from '@/graphql/generated/graphql';

type UseFollowResult = {
  toggleFollow: (
    targetType: 'VENDOR' | 'MARKET',
    targetID: string,
    isCurrentlyFollowing: boolean,
  ) => Promise<void>;
  loading: boolean;
};

/**
 * Hook to follow/unfollow a vendor or market.
 * Refetches customer profile and feed after mutation.
 */
export function useFollow(): UseFollowResult {
  const [followMutation, { loading: followLoading }] = useMutation(FollowDocument, {
    refetchQueries: [{ query: MyCustomerProfileDocument }, { query: FollowingFeedDocument }],
  });

  const [unfollowMutation, { loading: unfollowLoading }] = useMutation(UnfollowDocument, {
    refetchQueries: [{ query: MyCustomerProfileDocument }, { query: FollowingFeedDocument }],
  });

  const toggleFollow = useCallback(
    async (targetType: 'VENDOR' | 'MARKET', targetID: string, isCurrentlyFollowing: boolean) => {
      if (isCurrentlyFollowing) {
        await unfollowMutation({ variables: { targetType, targetID } });
      } else {
        await followMutation({ variables: { targetType, targetID } });
      }
    },
    [followMutation, unfollowMutation],
  );

  return {
    toggleFollow,
    loading: followLoading || unfollowLoading,
  };
}
