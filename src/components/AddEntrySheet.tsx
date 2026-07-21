import { useState } from 'react';
import { Sheet, SheetTitle, Field, inputClass } from './Sheet';
import { useFinance } from '../state/store';
import { EXPENSE_CATEGORIES, categoryBarColor } from '../lib/categories';
import { todayISO } from '../lib/format';
import type { CategoryId } from '../types';

export function AddEntrySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, addEntry } = useFinance();
  const [type, setType] = useState<'despesa' | 'receita'>('despesa');
  const [date, setDate] = useState(todayISO());
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryId>('moradia');
  const [accountId, setAccountId] = useState(state.accounts[0]?.id ?? '');

  const isDespesa = type === 'despesa';
  const isRetro = date < todayISO();
  const canSubmit = !!desc.trim() && !!date && !!parseFloat(amount) && !!accountId;

  const submit = () => {
    if (!canSubmit) return;
    const amt = parseFloat(amount);
    addEntry({
      date,
      desc: desc.trim(),
      amount: isDespesa ? -Math.abs(amt) : Math.abs(amt),
      categoryId: isDespesa ? category : 'renda',
      accountId,
    });
    setDesc('');
    setAmount('');
    setDate(todayISO());
    setType('despesa');
    onClose();
  };

  if (state.accounts.length === 0) {
    return (
      <Sheet open={open} onClose={onClose}>
        <SheetTitle>Nenhuma conta cadastrada</SheetTitle>
        <div className="text-[13.5px] text-ink/50">
          Cadastre uma conta na tela inicial antes de adicionar lançamentos.
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetTitle>Novo lançamento</SheetTitle>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setType('despesa')}
          className="flex-1 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer"
          style={{
            borderColor: 'rgba(20,20,15,0.1)',
            background: isDespesa ? '#14140F' : '#fff',
            color: isDespesa ? '#fff' : 'rgba(20,20,15,0.6)',
          }}
        >
          Despesa
        </button>
        <button
          onClick={() => setType('receita')}
          className="flex-1 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer"
          style={{
            borderColor: 'rgba(20,20,15,0.1)',
            background: !isDespesa ? 'oklch(0.42 0.13 152)' : '#fff',
            color: !isDespesa ? '#fff' : 'rgba(20,20,15,0.6)',
          }}
        >
          Receita
        </button>
      </div>

      <div className="mb-3.5">
        <div className="text-xs text-ink/50 mb-1.5 flex items-center gap-2">
          Data
          {isRetro && (
            <span
              className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md"
              style={{ color: 'oklch(0.5 0.15 35)', background: 'oklch(0.5 0.15 35 / 0.12)' }}
            >
              LANÇAMENTO RETROATIVO
            </span>
          )}
        </div>
        <input
          type="date"
          value={date}
          max={todayISO()}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
      </div>

      <Field label="Descrição">
        <input
          type="text"
          placeholder="Ex: Supermercado"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Valor (R$)">
        <input
          type="number"
          placeholder="0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={inputClass}
        />
      </Field>

      {isDespesa && (
        <Field label="Categoria">
          <div className="flex flex-wrap gap-2">
            {EXPENSE_CATEGORIES.map((c) => {
              const sel = category === c.id;
              const bar = categoryBarColor(c.hue);
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className="px-3 py-2 rounded-[10px] text-[13px] font-semibold border cursor-pointer"
                  style={{
                    borderColor: sel ? bar : 'rgba(20,20,15,0.12)',
                    background: sel ? `oklch(0.5 0.11 ${c.hue} / 0.15)` : '#fff',
                    color: sel ? `oklch(0.4 0.11 ${c.hue})` : 'rgba(20,20,15,0.6)',
                  }}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </Field>
      )}

      <div className="mb-5">
        <div className="text-xs text-ink/50 mb-2">Conta</div>
        <div className="flex gap-2 flex-wrap">
          {state.accounts.map((a) => {
            const sel = accountId === a.id;
            return (
              <button
                key={a.id}
                onClick={() => setAccountId(a.id)}
                className="px-3 py-2 rounded-[10px] text-[13px] font-semibold border cursor-pointer"
                style={{
                  background: sel ? 'rgba(20,20,15,0.9)' : '#fff',
                  color: sel ? '#fff' : 'rgba(20,20,15,0.6)',
                  borderColor: sel ? '#14140F' : 'rgba(20,20,15,0.12)',
                }}
              >
                {a.name}
              </button>
            );
          })}
        </div>
      </div>

      <button
        disabled={!canSubmit}
        onClick={submit}
        className="w-full py-[15px] rounded-2xl border-none text-[15.5px] font-bold cursor-pointer disabled:cursor-not-allowed"
        style={{
          background: canSubmit ? '#14140F' : 'rgba(20,20,15,0.15)',
          color: canSubmit ? '#fff' : 'rgba(20,20,15,0.4)',
        }}
      >
        Adicionar lançamento
      </button>
    </Sheet>
  );
}
