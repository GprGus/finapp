import { useMemo, useState } from 'react';
import { useFinance } from '../state/store';
import { fmtBRL, daysUntil, dateLabel } from '../lib/format';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDeleteSheet } from '../components/ConfirmDeleteSheet';
import { AddSubscriptionSheet } from '../components/AddSubscriptionSheet';
import type { Subscription } from '../types';

export function Assinaturas() {
  const { state, deleteSubscription } = useFinance();
  const [target, setTarget] = useState<Subscription | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const isActive = (sub: Subscription) =>
    sub.isRecurring || !sub.endDate || sub.nextChargeDate <= sub.endDate;

  const total = useMemo(
    () => state.subscriptions.filter(isActive).reduce((sum, s) => sum + s.price, 0),
    [state.subscriptions],
  );

  return (
    <div className="px-5 pt-[calc(env(safe-area-inset-top,0px)+20px)] pb-[130px]">
      <div className="flex items-start justify-between mb-1">
        <div className="text-[26px] font-bold text-ink tracking-tight">Assinaturas</div>
        <button
          onClick={() => setShowAdd(true)}
          className="w-9 h-9 rounded-full bg-ink text-white text-xl leading-none border-none cursor-pointer flex-shrink-0"
        >
          +
        </button>
      </div>
      <div className="text-[13.5px] text-ink/50 mb-[22px]">
        {fmtBRL(total)} por mês em recorrências
      </div>

      {state.subscriptions.length === 0 && (
        <EmptyState
          title="Nenhuma assinatura ainda"
          subtitle="Toque no botão + para adicionar uma recorrência"
        />
      )}

      <div className="flex flex-col gap-3">
        {state.subscriptions.map((sub) => {
          const active = isActive(sub);
          const days = daysUntil(sub.nextChargeDate);
          const urgent = active && days <= 5;
          return (
            <button
              key={sub.id}
              onClick={() => setTarget(sub)}
              className="text-left flex items-center gap-3.5 bg-white border border-ink/8 rounded-[18px] px-4 py-3.5 cursor-pointer"
            >
              <div
                className="w-11 h-11 rounded-xl text-white flex items-center justify-center text-[17px] font-bold flex-shrink-0"
                style={{ background: `oklch(0.55 0.1 ${sub.hue})` }}
              >
                {sub.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14.5px] font-semibold text-ink">{sub.name}</div>
                <div className="text-[12.5px] text-ink/50 mt-0.5">{fmtBRL(sub.price)}/mês</div>
                <div className="text-[11.5px] text-ink/40 mt-0.5">
                  {sub.lastChargeDate
                    ? `Última cobrança: ${dateLabel(sub.lastChargeDate)}`
                    : 'Ainda não cobrada'}
                  {!sub.isRecurring && sub.endDate && ` · até ${dateLabel(sub.endDate)}`}
                </div>
              </div>
              <div
                className="text-[11.5px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap"
                style={{
                  color: !active ? 'rgba(20,20,15,0.4)' : urgent ? 'oklch(0.5 0.15 35)' : 'rgba(20,20,15,0.55)',
                  background: !active
                    ? 'rgba(20,20,15,0.06)'
                    : urgent
                      ? 'oklch(0.5 0.15 35 / 0.12)'
                      : 'rgba(20,20,15,0.06)',
                }}
              >
                {!active
                  ? 'Encerrada'
                  : days >= 0
                    ? `Próxima em ${days}d`
                    : `Atrasada há ${-days}d`}
              </div>
            </button>
          );
        })}
      </div>

      <AddSubscriptionSheet open={showAdd} onClose={() => setShowAdd(false)} />

      <ConfirmDeleteSheet
        open={!!target}
        title={`Excluir "${target?.name}"?`}
        onConfirm={async () => {
          if (target) await deleteSubscription(target.id);
        }}
        onClose={() => setTarget(null)}
      />
    </div>
  );
}
