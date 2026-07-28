import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/state/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProfileSheet } from '@/components/ProfileSheet';
import { MODULES } from '@/modules/registry';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function ModuleSelector() {
  const { user, updateProfile, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const name = user?.name ?? '';
  const initial = name.trim() ? name.trim().charAt(0).toUpperCase() : '?';

  return (
    <div className="min-h-screen bg-surface max-w-[560px] mx-auto font-sans box-border px-5 pt-[calc(env(safe-area-inset-top,0px)+20px)] pb-10">
      <div className="flex items-center justify-between mb-[26px]">
        <div>
          <div className="text-[13px] text-ink/50 tracking-tight">{greeting()}</div>
          <div className="text-[22px] font-bold text-ink tracking-tight">{name.trim() || 'Bem-vindo'}</div>
        </div>
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <button
            onClick={() => setShowProfile(true)}
            className="w-10 h-10 rounded-[20px] flex items-center justify-center text-base font-semibold cursor-pointer"
            style={{
              background: 'var(--profile-avatar-bg)',
              border: '1px solid var(--profile-avatar-border)',
              color: 'var(--profile-avatar-fg)',
            }}
          >
            {initial}
          </button>
        </div>
      </div>

      <div className="text-[26px] font-bold text-ink tracking-tight mb-1">Seus módulos</div>
      <div className="text-[13.5px] text-ink/50 mb-6">Escolha um app para continuar</div>

      <div className="grid grid-cols-2 gap-4">
        {MODULES.map((mod) => (
          <Link
            key={mod.id}
            to={mod.path}
            className="aspect-square rounded-[24px] border border-ink/8 flex flex-col items-center justify-center gap-3 px-4 text-center no-underline"
            style={{ background: 'var(--color-card)' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: `oklch(0.5 0.11 ${mod.hue} / 0.14)` }}
            >
              {mod.icon(`oklch(0.5 0.13 ${mod.hue})`)}
            </div>
            <div>
              <div className="text-[15px] font-bold text-ink">{mod.name}</div>
              <div className="text-[11.5px] text-ink/45 mt-0.5 leading-snug">{mod.description}</div>
            </div>
          </Link>
        ))}
      </div>

      <button
        onClick={logout}
        className="mt-8 w-full py-[13px] rounded-2xl border-none text-[14px] font-bold cursor-pointer bg-transparent text-ink/45"
      >
        Sair
      </button>

      <ProfileSheet open={showProfile} name={name} onSave={updateProfile} onClose={() => setShowProfile(false)} />
    </div>
  );
}
