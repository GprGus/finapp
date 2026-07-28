import { CookProvider } from './state/store';
import { CookShell } from './CookShell';

export function Cook() {
  return (
    <CookProvider>
      <CookShell />
    </CookProvider>
  );
}
