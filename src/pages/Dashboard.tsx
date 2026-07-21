import { useMemo, useState } from 'react';
import { useFinance } from '../state/store';
import { fmtBRL, fmtSigned } from '../lib/format';
import { getCategory, categoryDotColor } from '../lib/categories';
import { EmptyState } from '../components/EmptyState';
import { AddAccountSheet } from '../components/AddAccountSheet';
import { AddGoalSheet } from '../components/AddGoalSheet';
import { GoalActionSheet } from '../components/GoalActionSheet';
import { ConfirmDeleteSheet } from '../components/ConfirmDeleteSheet';
import type { Account, Tab } from '../types';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function Dashboard({
  name,
  onOpenProfile,
  onNavigate,
}: {
  name: string;
  onOpenProfile: () => void;
  onNavigate: (t: Tab) => void;
}) {
  const { state, accountBalance, deleteAccount } = useFinance();
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [deleteAccountTarget, setDeleteAccountTarget] = useState<Account | null>(null);

  const totalBalance = useMemo(
    () => state.accounts.reduce((sum, a) => sum + accountBalance(a.id), 0),
    [state.accounts, accountBalance],
  );

  const recentEntries = useMemo(() => {
    return [...state.entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [state.entries]);

  const activeGoal = state.goals.find((g) => g.id === activeGoalId) ?? null;
  const initial = name.trim() ? name.trim().charAt(0).toUpperCase() : '?';

  return (
    <div className="px-5 pt-[calc(env(safe-area-inset-top,0px)+20px)] pb-[110px]">
      <div className="flex items-center justify-between mb-[22px]">
        <div>
          <div className="text-[13px] text-ink/50 tracking-tight">{greeting()}</div>
          <div className="text-[22px] font-bold text-ink tracking-tight">
            {name.trim() || 'Bem-vindo'}
          </div>
        </div>
        <button
          onClick={onOpenProfile}
          className="w-10 h-10 rounded-[20px] bg-ink text-white flex items-center justify-center text-base font-semibold border-none cursor-pointer"
        >
          {initial}
        </button>
      </div>

      <div className="bg-ink rounded-[24px] px-5 py-[22px] mb-[18px]">
        <div className="text-[12.5px] text-white/55 mb-1.5">Saldo total</div>
        <div className="text-[32px] font-bold text-white tracking-tight tabular-nums">
          {fmtBRL(totalBalance)}
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto -mx-5 mb-[22px] px-5">
        {state.accounts.map((acc) => (
          <button
            key={acc.id}
            onClick={() => setDeleteAccountTarget(acc)}
            className="flex-none w-[168px] text-left bg-white border border-ink/8 rounded-[18px] p-4 cursor-pointer"
          >
            <div className="text-[11px] text-ink/45 uppercase tracking-wide mb-2">{acc.type}</div>
            <div className="text-[13.5px] text-ink font-semibold mb-3.5 truncate">{acc.name}</div>
            <div className="text-[16.5px] font-bold text-ink tabular-nums">
              {fmtBRL(accountBalance(acc.id))}
            </div>
          </button>
        ))}
        <button
          onClick={() => setShowAddAccount(true)}
          className="flex-none w-[168px] border border-dashed border-ink/20 rounded-[18px] flex items-center justify-center text-ink/40 text-sm font-semibold cursor-pointer bg-transparent"
        >
          + Nova conta
        </button>
      </div>

      <div className="flex items-baseline justify-between mb-3">
        <div className="text-[15px] font-bold text-ink">Metas de economia</div>
        <button
          onClick={() => setShowAddGoal(true)}
          className="border-none bg-transparent text-[13px] font-semibold cursor-pointer text-accent"
        >
          + Nova meta
        </button>
      </div>
      <div className="flex flex-col gap-3.5 mb-6">
        {state.goals.length === 0 && (
          <EmptyState
            title="Nenhuma meta ainda"
            subtitle="Crie uma meta para acompanhar sua economia"
          />
        )}
        {state.goals.map((g) => {
          const pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
          return (
            <button
              key={g.id}
              onClick={() => setActiveGoalId(g.id)}
              className="text-left bg-white border border-ink/8 rounded-2xl px-4 py-3.5 cursor-pointer"
            >
              <div className="flex justify-between mb-2">
                <div className="text-sm font-semibold text-ink">{g.name}</div>
                <div className="text-[12.5px] text-ink/50">
                  {fmtBRL(g.current)} / {fmtBRL(g.target)}
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-ink/8 overflow-hidden">
                <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-baseline justify-between mb-3">
        <div className="text-[15px] font-bold text-ink">Últimos lançamentos</div>
        <button
          onClick={() => onNavigate('lancamentos')}
          className="border-none bg-transparent text-[13px] font-semibold cursor-pointer text-accent"
        >
          Ver tudo
        </button>
      </div>

      {recentEntries.length === 0 ? (
        <EmptyState
          title="Nenhum lançamento ainda"
          subtitle="Adicione lançamentos na aba Lançamentos"
        />
      ) : (
        <div className="bg-white border border-ink/8 rounded-[18px] overflow-hidden">
          {recentEntries.map((item, i) => {
            const cat = getCategory(item.categoryId);
            return (
              <div key={item.id} className="flex items-center gap-3 px-4 py-[13px] relative">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: categoryDotColor(cat.hue) }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[14.5px] text-ink font-medium truncate">{item.desc}</div>
                  <div className="text-xs text-ink/45">{cat.name}</div>
                </div>
                <div
                  className="text-[14.5px] font-semibold tabular-nums"
                  style={{ color: item.amount >= 0 ? 'oklch(0.42 0.13 152)' : '#14140F' }}
                >
                  {fmtSigned(item.amount)}
                </div>
                {i < recentEntries.length - 1 && (
                  <div className="absolute bottom-0 left-[52px] right-4 h-px bg-ink/8" />
                )}
              </div>
            );
          })}
        </div>
      )}

      <AddAccountSheet open={showAddAccount} onClose={() => setShowAddAccount(false)} />
      <AddGoalSheet open={showAddGoal} onClose={() => setShowAddGoal(false)} />
      <GoalActionSheet goal={activeGoal} onClose={() => setActiveGoalId(null)} />
      <ConfirmDeleteSheet
        open={!!deleteAccountTarget}
        title={`Excluir "${deleteAccountTarget?.name}"?`}
        detail="Todos os lançamentos associados a esta conta também serão excluídos."
        onConfirm={() => deleteAccountTarget && deleteAccount(deleteAccountTarget.id)}
        onClose={() => setDeleteAccountTarget(null)}
      />
    </div>
  );
}
