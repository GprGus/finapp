import { useMemo, useState } from 'react';
import { useFinance } from '../state/store';
import { fmtBRL, daysUntil, dateLabel } from '../lib/format';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDeleteSheet } from '../components/ConfirmDeleteSheet';
import { AddDebtSheet } from '../components/AddDebtSheet';
import { AbateDebtSheet } from '../components/AbateDebtSheet';
import type { Debt } from '../types';

export function Dividas() {
  const { state, deleteDebt } = useFinance();
  const [editing, setEditing] = useState<Debt | null>(null);
  const [target, setTarget] = useState<Debt | null>(null);
  const [abating, setAbating] = useState<Debt | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const isPaidOff = (debt: Debt) => debt.paidInstallments >= debt.totalInstallments;

  const totalMonthly = useMemo(
    () => state.debts.filter((d) => !isPaidOff(d)).reduce((sum, d) => sum + d.installmentAmount, 0),
    [state.debts],
  );

  return (
    <div className="px-5 pt-5 pb-10">
      <div className="flex items-start justify-between mb-1">
        <div className="text-[26px] font-bold text-ink tracking-tight">Dívidas</div>
        <button
          onClick={() => setShowAdd(true)}
          className="w-9 h-9 rounded-full bg-ink text-white text-xl leading-none border-none cursor-pointer flex-shrink-0"
        >
          +
        </button>
      </div>
      <div className="text-[13.5px] text-ink/50 mb-[22px]">
        {fmtBRL(totalMonthly)} por mês em parcelas ativas
      </div>

      {state.debts.length === 0 && (
        <EmptyState
          title="Nenhuma dívida cadastrada"
          subtitle="Toque no botão + para registrar uma fatura renegociada, empréstimo ou financiamento"
        />
      )}

      <div className="flex flex-col gap-3">
        {state.debts.map((debt) => {
          const paidOff = isPaidOff(debt);
          const days = daysUntil(debt.nextChargeDate);
          const urgent = !paidOff && days <= 5;
          const pct = Math.min(100, Math.round((debt.paidInstallments / debt.totalInstallments) * 100));

          return (
            <button
              key={debt.id}
              onClick={() => setEditing(debt)}
              className="text-left flex flex-col gap-2.5 bg-white border border-ink/8 rounded-[18px] px-4 py-3.5 cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-xl text-white flex items-center justify-center text-[17px] font-bold flex-shrink-0"
                  style={{ background: `oklch(0.55 0.1 ${debt.hue})` }}
                >
                  {debt.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14.5px] font-semibold text-ink">{debt.name}</div>
                  <div className="text-[12.5px] text-ink/50 mt-0.5">
                    {fmtBRL(debt.installmentAmount)} · {debt.paidInstallments}/{debt.totalInstallments} parcelas
                  </div>
                </div>
                <div
                  className="text-[11.5px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap flex-shrink-0"
                  style={{
                    color: paidOff ? 'rgba(20,20,15,0.4)' : urgent ? 'oklch(0.5 0.15 35)' : 'rgba(20,20,15,0.55)',
                    background: paidOff
                      ? 'rgba(20,20,15,0.06)'
                      : urgent
                        ? 'oklch(0.5 0.15 35 / 0.12)'
                        : 'rgba(20,20,15,0.06)',
                  }}
                >
                  {paidOff ? 'Quitada' : days >= 0 ? `Próxima em ${days}d` : `Atrasada há ${-days}d`}
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-ink/8 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: `oklch(0.55 0.1 ${debt.hue})` }}
                />
              </div>
              {debt.lastChargeDate && (
                <div className="text-[11.5px] text-ink/40">Última parcela: {dateLabel(debt.lastChargeDate)}</div>
              )}
            </button>
          );
        })}
      </div>

      <AddDebtSheet
        open={showAdd || !!editing}
        editing={editing}
        onClose={() => {
          setShowAdd(false);
          setEditing(null);
        }}
        onRequestDelete={(debt) => {
          setEditing(null);
          setTarget(debt);
        }}
        onRequestAbate={(debt) => {
          setEditing(null);
          setAbating(debt);
        }}
      />

      <AbateDebtSheet debt={abating} onClose={() => setAbating(null)} />

      <ConfirmDeleteSheet
        open={!!target}
        title={`Excluir "${target?.name}"?`}
        detail="Os lançamentos já feitos dessa dívida continuam no histórico."
        onConfirm={async () => {
          if (target) await deleteDebt(target.id);
        }}
        onClose={() => setTarget(null)}
      />
    </div>
  );
}
