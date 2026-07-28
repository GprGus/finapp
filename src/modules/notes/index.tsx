import { NotesProvider } from './state/store';
import { NotesShell } from './NotesShell';

export function Notes() {
  return (
    <NotesProvider>
      <NotesShell />
    </NotesProvider>
  );
}
