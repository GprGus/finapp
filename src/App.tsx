import { useState } from 'react';
import { ACCOUNTS, GOALS, INITIAL_ENTRIES, SUBSCRIPTIONS, TODAY } from './data';
import type { Entry, EntryForm, ReportView, Tab } from './types';
import Dashboard from './components/Dashboard';
import Lancamentos from './components/Lancamentos';
import Assinaturas from './components/Assinaturas';
import Relatorios from './components/Relatorios';
import BottomNav from './components/BottomNav';
import AddEntrySheet from './components/AddEntrySheet';

const INITIAL_FORM: EntryForm = { date: TODAY, desc: '', amount: '', type: 'despesa', category: 'moradia', account: 'Conta Corrente' };

function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [showAdd, setShowAdd] = useState(false);
  const [entries, setEntries] = useState<Entry[]>(INITIAL_ENTRIES);
  const [form, setForm] = useState<EntryForm>(INITIAL_FORM);
  const [reportView, setReportView] = useState<ReportView>('misto');

  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const recentEntries = sortedEntries.slice(0, 5);

  const handleSetTipo = (type: 'despesa' | 'receita') => {
    setForm((f) => ({
      ...f,
      type,
      category: type === 'receita' ? 'renda' : f.category === 'renda' ? 'moradia' : f.category,
    }));
  };

  const submitEntry = () => {
    const amt = parseFloat(form.amount);
    if (!form.desc || !form.date || !amt) return;
    const entry: Entry = {
      id: Date.now(),
      date: form.date,
      desc: form.desc,
      amount: form.type === 'receita' ? Math.abs(amt) : -Math.abs(amt),
      cat: form.type === 'receita' ? 'renda' : form.category,
      account: form.account,
      retro: form.date < TODAY,
    };
    setEntries((es) => [entry, ...es]);
    setShowAdd(false);
    setTab('lancamentos');
    setForm(INITIAL_FORM);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FAFAF8',
        maxWidth: 560,
        margin: '0 auto',
        position: 'relative',
        fontFamily: '-apple-system,system-ui,sans-serif',
        boxSizing: 'border-box',
        boxShadow: '0 0 60px rgba(20,20,15,0.06)',
      }}
    >
      <div style={{ position: 'relative' }}>
        {tab === 'dashboard' && <Dashboard accounts={ACCOUNTS} goals={GOALS} recentEntries={recentEntries} onSeeAll={() => setTab('lancamentos')} />}
        {tab === 'lancamentos' && <Lancamentos entries={entries} />}
        {tab === 'assinaturas' && <Assinaturas subscriptions={SUBSCRIPTIONS} />}
        {tab === 'relatorios' && <Relatorios entries={entries} reportView={reportView} onSetReportView={setReportView} />}
      </div>

      <BottomNav tab={tab} onNavigate={setTab} onOpenAdd={() => setShowAdd(true)} />

      {showAdd && (
        <AddEntrySheet
          form={form}
          accounts={ACCOUNTS}
          onClose={() => setShowAdd(false)}
          onDateChange={(date) => setForm((f) => ({ ...f, date }))}
          onDescChange={(desc) => setForm((f) => ({ ...f, desc }))}
          onAmountChange={(amount) => setForm((f) => ({ ...f, amount }))}
          onSetTipo={handleSetTipo}
          onSelectCategory={(category) => setForm((f) => ({ ...f, category }))}
          onSelectAccount={(account) => setForm((f) => ({ ...f, account }))}
          onSubmit={submitEntry}
        />
      )}
    </div>
  );
}

export default App;
