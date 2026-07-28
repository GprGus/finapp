import { AgendaProvider } from './state/store';
import { AgendaShell } from './AgendaShell';

export function Agenda() {
  return (
    <AgendaProvider>
      <AgendaShell />
    </AgendaProvider>
  );
}
