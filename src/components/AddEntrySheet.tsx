import { CATS, TODAY } from '../data';
import type { Account, EntryForm } from '../types';

interface Props {
  form: EntryForm;
  accounts: Account[];
  onClose: () => void;
  onDateChange: (date: string) => void;
  onDescChange: (desc: string) => void;
  onAmountChange: (amount: string) => void;
  onSetTipo: (type: 'despesa' | 'receita') => void;
  onSelectCategory: (id: string) => void;
  onSelectAccount: (name: string) => void;
  onSubmit: () => void;
}

export default function AddEntrySheet({
  form,
  accounts,
  onClose,
  onDateChange,
  onDescChange,
  onAmountChange,
  onSetTipo,
  onSelectCategory,
  onSelectAccount,
  onSubmit,
}: Props) {
  const isDespesa = form.type === 'despesa';
  const isRetro = form.date < TODAY;
  const canSubmit = !!(form.desc && form.date && parseFloat(form.amount));
  const expenseCategories = CATS.filter((c) => c.id !== 'renda');

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,20,15,0.4)', zIndex: 80 }} onClick={onClose} />
      <div
        style={{
          position: 'fixed',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: 0,
          width: '100%',
          maxWidth: 560,
          zIndex: 81,
          background: '#FAFAF8',
          borderRadius: '28px 28px 0 0',
          padding: '10px 20px calc(env(safe-area-inset-bottom, 0px) + 30px)',
          maxHeight: '82vh',
          overflow: 'auto',
          boxShadow: '0 -20px 50px rgba(0,0,0,0.25)',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ width: 36, height: 5, borderRadius: 3, background: 'rgba(20,20,15,0.15)', margin: '4px auto 16px' }} />
        <div style={{ fontSize: 19, fontWeight: 700, color: '#14140F', marginBottom: 16 }}>Novo lançamento</div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 12,
              border: '1px solid rgba(20,20,15,0.1)',
              fontSize: 14,
              fontWeight: 600,
              background: isDespesa ? '#14140F' : '#fff',
              color: isDespesa ? '#fff' : 'rgba(20,20,15,0.6)',
            }}
            onClick={() => onSetTipo('despesa')}
          >
            Despesa
          </button>
          <button
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 12,
              border: '1px solid rgba(20,20,15,0.1)',
              fontSize: 14,
              fontWeight: 600,
              background: !isDespesa ? 'oklch(0.42 0.13 152)' : '#fff',
              color: !isDespesa ? '#fff' : 'rgba(20,20,15,0.6)',
            }}
            onClick={() => onSetTipo('receita')}
          >
            Receita
          </button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'rgba(20,20,15,0.5)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            Data
            {isRetro && (
              <span style={{ fontSize: 9.5, fontWeight: 700, color: 'oklch(0.5 0.15 35)', background: 'oklch(0.5 0.15 35 / 0.12)', padding: '2px 6px', borderRadius: 6 }}>
                LANÇAMENTO RETROATIVO
              </span>
            )}
          </div>
          <input
            type="date"
            value={form.date}
            max={TODAY}
            onChange={(e) => onDateChange(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px', borderRadius: 12, border: '1px solid rgba(20,20,15,0.15)', fontSize: 15, background: '#fff', color: '#14140F' }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'rgba(20,20,15,0.5)', marginBottom: 6 }}>Descrição</div>
          <input
            type="text"
            placeholder="Ex: Supermercado"
            value={form.desc}
            onChange={(e) => onDescChange(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px', borderRadius: 12, border: '1px solid rgba(20,20,15,0.15)', fontSize: 15, background: '#fff', color: '#14140F' }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'rgba(20,20,15,0.5)', marginBottom: 6 }}>Valor (R$)</div>
          <input
            type="number"
            placeholder="0,00"
            value={form.amount}
            onChange={(e) => onAmountChange(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px', borderRadius: 12, border: '1px solid rgba(20,20,15,0.15)', fontSize: 15, background: '#fff', color: '#14140F' }}
          />
        </div>

        {isDespesa && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: 'rgba(20,20,15,0.5)', marginBottom: 8 }}>Categoria</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {expenseCategories.map((c) => {
                const sel = form.category === c.id;
                return (
                  <button
                    key={c.id}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      border: `1px solid ${sel ? `oklch(0.5 0.11 ${c.hue})` : 'rgba(20,20,15,0.12)'}`,
                      background: sel ? `oklch(0.5 0.11 ${c.hue} / 0.15)` : '#fff',
                      color: sel ? `oklch(0.4 0.11 ${c.hue})` : 'rgba(20,20,15,0.6)',
                    }}
                    onClick={() => onSelectCategory(c.id)}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'rgba(20,20,15,0.5)', marginBottom: 8 }}>Conta</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {accounts.map((a) => {
              const sel = form.account === a.name;
              return (
                <button
                  key={a.name}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    border: `1px solid ${sel ? '#14140F' : 'rgba(20,20,15,0.12)'}`,
                    background: sel ? 'rgba(20,20,15,0.9)' : '#fff',
                    color: sel ? '#fff' : 'rgba(20,20,15,0.6)',
                  }}
                  onClick={() => onSelectAccount(a.name)}
                >
                  {a.name}
                </button>
              );
            })}
          </div>
        </div>

        <button
          disabled={!canSubmit}
          style={{
            width: '100%',
            padding: 15,
            borderRadius: 14,
            border: 'none',
            fontSize: 15.5,
            fontWeight: 700,
            background: canSubmit ? '#14140F' : 'rgba(20,20,15,0.15)',
            color: canSubmit ? '#fff' : 'rgba(20,20,15,0.4)',
          }}
          onClick={onSubmit}
        >
          Adicionar lançamento
        </button>
      </div>
    </>
  );
}
