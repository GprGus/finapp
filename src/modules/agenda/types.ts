export interface AgendaEvent {
  id: string;
  title: string;
  notes: string | null;
  date: string; // ISO yyyy-mm-dd
  time: string | null; // HH:MM
  sharedFromUserId: string | null;
  createdAt: string;
}

export interface AgendaEventShare {
  id: string;
  event: { id: string; title: string; notes: string | null; date: string; time: string | null };
  from: { id: string; name: string; email: string };
}
