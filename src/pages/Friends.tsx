import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFriends } from '@/state/friends';
import { ApiError } from '@/lib/api';
import { inputClass, primaryButtonStyle, dangerTextButtonStyle } from '@/components/Sheet';
import { EmptyState } from '@/components/EmptyState';
import type { FriendLink } from '@/types';

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Voltar aos módulos"
      className="w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer bg-transparent flex-shrink-0"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M12.5 4.5L6 10l6.5 5.5"
          stroke="var(--color-ink)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function PersonRow({
  person,
  action,
}: {
  person: FriendLink;
  action: ReactNode;
}) {
  const initial = person.name.trim() ? person.name.trim().charAt(0).toUpperCase() : person.email.charAt(0).toUpperCase();
  return (
    <div
      className="flex items-center gap-3 border border-ink/8 rounded-[16px] px-4 py-3"
      style={{ background: 'var(--color-card)' }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
        style={{
          background: 'var(--profile-avatar-bg)',
          border: '1px solid var(--profile-avatar-border)',
          color: 'var(--profile-avatar-fg)',
        }}
      >
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-ink truncate">{person.name.trim() || person.email}</div>
        <div className="text-[12px] text-ink/45 truncate">{person.email}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">{action}</div>
    </div>
  );
}

function SmallButton({ onClick, danger, children }: { onClick: () => void; danger?: boolean; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-[12.5px] font-bold cursor-pointer border-none"
      style={danger ? { background: 'var(--btn-danger-bg)', color: 'var(--btn-danger-fg)' } : primaryButtonStyle(true)}
    >
      {children}
    </button>
  );
}

export function Friends() {
  const navigate = useNavigate();
  const { friends, incomingRequests, outgoingRequests, isLoading, sendRequest, acceptRequest, removeRequest } = useFriends();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const submit = async () => {
    if (!email.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await sendRequest(email.trim());
      setEmail('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao enviar solicitação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const withBusy = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    try {
      await action();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao processar solicitação');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface max-w-[560px] mx-auto relative font-sans box-border shadow-[0_0_60px_rgba(20,20,15,0.06)]">
      <div
        className="sticky top-0 z-60 flex items-center gap-1 px-4 pt-[calc(env(safe-area-inset-top,0px)+10px)] pb-2"
        style={{
          background: 'var(--header-blur-bg)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        }}
      >
        <BackButton onClick={() => navigate('/modulos')} />
        <div className="text-[15px] font-bold text-ink">Amigos</div>
      </div>

      <div className="px-5 pt-5 pb-10">
        <div className="text-[13px] text-ink/50 mb-1.5">Adicionar amigo por e-mail</div>
        <div className="flex gap-2 mb-1.5">
          <input
            className={inputClass}
            type="email"
            placeholder="amigo@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <button
            onClick={submit}
            disabled={!email.trim() || isSubmitting}
            className="px-4 rounded-xl text-[13.5px] font-bold cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
            style={primaryButtonStyle(!!email.trim() && !isSubmitting)}
          >
            Enviar
          </button>
        </div>
        {error && (
          <div className="text-[13px] mb-2" style={{ color: 'var(--warning-color)' }}>
            {error}
          </div>
        )}

        {!isLoading && incomingRequests.length > 0 && (
          <div className="mt-6">
            <div className="text-[13px] font-semibold text-ink/60 mb-2">Solicitações recebidas</div>
            <div className="flex flex-col gap-2">
              {incomingRequests.map((r) => (
                <PersonRow
                  key={r.requestId}
                  person={r}
                  action={
                    <>
                      <SmallButton onClick={() => withBusy(r.requestId, () => acceptRequest(r.requestId))}>
                        {busyId === r.requestId ? '…' : 'Aceitar'}
                      </SmallButton>
                      <SmallButton danger onClick={() => withBusy(r.requestId, () => removeRequest(r.requestId))}>
                        Recusar
                      </SmallButton>
                    </>
                  }
                />
              ))}
            </div>
          </div>
        )}

        {!isLoading && outgoingRequests.length > 0 && (
          <div className="mt-6">
            <div className="text-[13px] font-semibold text-ink/60 mb-2">Solicitações enviadas</div>
            <div className="flex flex-col gap-2">
              {outgoingRequests.map((r) => (
                <PersonRow
                  key={r.requestId}
                  person={r}
                  action={
                    <button
                      onClick={() => withBusy(r.requestId, () => removeRequest(r.requestId))}
                      className="text-[12.5px] font-semibold cursor-pointer bg-transparent border-none"
                      style={dangerTextButtonStyle}
                    >
                      {busyId === r.requestId ? '…' : 'Cancelar'}
                    </button>
                  }
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <div className="text-[13px] font-semibold text-ink/60 mb-2">Meus amigos</div>
          {!isLoading && friends.length === 0 && (
            <EmptyState title="Nenhum amigo ainda" subtitle="Envie uma solicitação usando o e-mail de cadastro dele" />
          )}
          <div className="flex flex-col gap-2">
            {friends.map((f) => (
              <PersonRow
                key={f.requestId}
                person={f}
                action={
                  <button
                    onClick={() => withBusy(f.requestId, () => removeRequest(f.requestId))}
                    className="text-[12.5px] font-semibold cursor-pointer bg-transparent border-none"
                    style={dangerTextButtonStyle}
                  >
                    {busyId === f.requestId ? '…' : 'Remover'}
                  </button>
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
