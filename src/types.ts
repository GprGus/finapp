export interface User {
  id: string;
  email: string;
  name: string;
}

// A friend, or a pending request in either direction — same shape either way, `requestId` is the
// friend_requests row id (used to accept/remove/cancel it), `id` is the other user's id.
export interface FriendLink {
  requestId: string;
  id: string;
  name: string;
  email: string;
}
