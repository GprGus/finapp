import { useMemo, useState } from 'react';
import { useFinance } from '../state/store';
import { useTheme } from '@/state/theme';
import { fmtBRL, daysUntil, dateLabel } from '../lib/format';
import { avatarTileStyle, categoryBarColor } from '../lib/categories';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDeleteSheet } from '@/components/ConfirmDeleteSheet';
import { AddDebtSheet } from '../components/AddDebtSheet';
import { AbateDebtSheet } from '../components/AbateDebtSheet';
import type { Debt } from '../types';

export function Dividas() {
  const { state, deleteDebt } = useFinance();
  const { theme } = useTheme();
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
    <div className="px-5 pt-5 pb-[calc(env(safe-area-inset-bottom,0px)+110px)]">
      <div className="text-[26px] font-bold text-ink tracking-tight mb-1">Dívidas</div>
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
              className="text-left flex flex-col gap-2.5 border border-ink/8 rounded-[18px] px-4 py-3.5 cursor-pointer"
              style={{ background: 'var(--color-card)' }}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-[17px] font-bold flex-shrink-0"
                  style={avatarTileStyle(debt.hue, theme)}
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
                    color: paidOff
                      ? 'rgba(var(--ink-rgb), 0.4)'
                      : urgent
                        ? 'var(--warning-color)'
                        : 'rgba(var(--ink-rgb), 0.55)',
                    background: paidOff
                      ? 'rgba(var(--ink-rgb), 0.06)'
                      : urgent
                        ? 'var(--warning-bg-mid)'
                        : 'rgba(var(--ink-rgb), 0.06)',
                  }}
                >
                  {paidOff ? 'Quitada' : days >= 0 ? `Próxima em ${days}d` : `Atrasada há ${-days}d`}
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-ink/8 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: categoryBarColor(debt.hue) }}
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

      <div className="fixed left-0 right-0 bottom-0 flex justify-center pointer-events-none z-70">
        <div className="relative w-full max-w-[560px] pointer-events-none">
          <button
            onClick={() => setShowAdd(true)}
            aria-label="Nova dívida"
            className="absolute right-5 bottom-[calc(env(safe-area-inset-bottom,0px)+24px)] w-14 h-14 rounded-[28px] flex items-center justify-center text-[28px] leading-none pointer-events-auto cursor-pointer"
            style={{
              boxShadow: 'var(--fab-shadow)',
              background: 'var(--fab-bg)',
              border: '1px solid var(--fab-border)',
              color: 'var(--fab-fg)',
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
