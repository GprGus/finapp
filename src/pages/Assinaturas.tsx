import { useMemo, useState } from 'react';
import { useFinance } from '../state/store';
import { useTheme } from '../state/theme';
import { fmtBRL, daysUntil, dateLabel } from '../lib/format';
import { avatarTileStyle } from '../lib/categories';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDeleteSheet } from '../components/ConfirmDeleteSheet';
import { AddSubscriptionSheet } from '../components/AddSubscriptionSheet';
import type { Subscription } from '../types';

export function Assinaturas() {
  const { state, deleteSubscription } = useFinance();
  const { theme } = useTheme();
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [target, setTarget] = useState<Subscription | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const isActive = (sub: Subscription) =>
    sub.isRecurring || !sub.endDate || sub.nextChargeDate <= sub.endDate;

  const total = useMemo(
    () => state.subscriptions.filter(isActive).reduce((sum, s) => sum + s.price, 0),
    [state.subscriptions],
  );

  return (
    <div className="px-5 pt-5 pb-[calc(env(safe-area-inset-bottom,0px)+110px)]">
      <div className="text-[26px] font-bold text-ink tracking-tight mb-1">Assinaturas</div>
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
              onClick={() => setEditing(sub)}
              className="text-left flex items-center gap-3.5 border border-ink/8 rounded-[18px] px-4 py-3.5 cursor-pointer"
              style={{ background: 'var(--color-card)' }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-[17px] font-bold flex-shrink-0"
                style={avatarTileStyle(sub.hue, theme)}
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
                className="text-[11.5px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap flex-shrink-0"
                style={{
                  color: !active
                    ? 'rgba(var(--ink-rgb), 0.4)'
                    : urgent
                      ? 'var(--warning-color)'
                      : 'rgba(var(--ink-rgb), 0.55)',
                  background: !active
                    ? 'rgba(var(--ink-rgb), 0.06)'
                    : urgent
                      ? 'var(--warning-bg-mid)'
                      : 'rgba(var(--ink-rgb), 0.06)',
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

      <AddSubscriptionSheet
        open={showAdd || !!editing}
        editing={editing}
        onClose={() => {
          setShowAdd(false);
          setEditing(null);
        }}
        onRequestDelete={(sub) => {
          setEditing(null);
          setTarget(sub);
        }}
      />

      <ConfirmDeleteSheet
        open={!!target}
        title={`Excluir "${target?.name}"?`}
        onConfirm={async () => {
          if (target) await deleteSubscription(target.id);
        }}
        onClose={() => setTarget(null)}
      />

      <div className="fixed left-0 right-0 bottom-0 flex justify-center pointer-events-none z-70">
        <div className="relative w-full max-w-[560px] pointer-events-none">
          <button
            onClick={() => setShowAdd(true)}
            aria-label="Nova assinatura"
            className="absolute right-5 bottom-[calc(env(safe-area-inset-bottom,0px)+24px)] w-14 h-14 rounded-[28px] text-[28px] leading-[56px] pointer-events-auto cursor-pointer"
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
