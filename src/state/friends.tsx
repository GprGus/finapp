import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiFetch } from '@/lib/api';
import type { FriendLink } from '@/types';

interface FriendsContextValue {
  friends: FriendLink[];
  incomingRequests: FriendLink[];
  outgoingRequests: FriendLink[];
  isLoading: boolean;
  sendRequest: (email: string) => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  removeRequest: (requestId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const FriendsContext = createContext<FriendsContextValue | null>(null);

// App-wide, not tied to any module: any module (Agenda today, others later) that needs to send
// something to a friend reads from this context rather than re-fetching /api/friends itself.
export function FriendsProvider({ children }: { children: ReactNode }) {
  const [friends, setFriends] = useState<FriendLink[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendLink[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    const [friendsList, requests] = await Promise.all([
      apiFetch<FriendLink[]>('/friends'),
      apiFetch<{ incoming: FriendLink[]; outgoing: FriendLink[] }>('/friends/requests'),
    ]);
    setFriends(friendsList);
    setIncomingRequests(requests.incoming);
    setOutgoingRequests(requests.outgoing);
  };

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<FriendsContextValue>(
    () => ({
      friends,
      incomingRequests,
      outgoingRequests,
      isLoading,
      sendRequest: async (email) => {
        await apiFetch('/friends/requests', { method: 'POST', body: { email } });
        await refresh();
      },
      acceptRequest: async (requestId) => {
        await apiFetch(`/friends/requests/${requestId}/accept`, { method: 'POST' });
        await refresh();
      },
      removeRequest: async (requestId) => {
        await apiFetch(`/friends/${requestId}`, { method: 'DELETE' });
        await refresh();
      },
      refresh,
    }),
    [friends, incomingRequests, outgoingRequests, isLoading],
  );

  return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>;
}

export function useFriends(): FriendsContextValue {
  const ctx = useContext(FriendsContext);
  if (!ctx) throw new Error('useFriends must be used within FriendsProvider');
  return ctx;
}
