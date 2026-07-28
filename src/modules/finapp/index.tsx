import { FinanceProvider } from './state/store';
import { FinAppShell } from './FinAppShell';

export function FinApp() {
  return (
    <FinanceProvider>
      <FinAppShell />
    </FinanceProvider>
  );
}
