import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Tournament } from '../types'
import { usePWA } from '../hooks/usePWA'
import { Skeleton, SkeletonCard } from '../components/Skeleton'
import { Trophy, User, Download, Shield, Plus, Swords, Handshake, Calendar, Hash } from 'lucide-react'

const FORMAT_LABEL: Record<string, string> = {
  groups_knockout: 'Grupos + Mata-mata',
  league: 'Liga',
  knockout: 'Mata-mata',
  league_final: 'Liga + Final',
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  setup: { label: 'Em configuração', color: 'text-white/40' },
  active: { label: 'Em andamento', color: 'text-green-400' },
  finished: { label: 'Encerrado', color: 'text-white/30' },
}

export default function Home() {
  const { profile, isSupreme } = useAuth()
  const navigate = useNavigate()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const { installPrompt, isInstalled, install } = usePWA()

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false })

      setTournaments(data ?? [])
      setLoading(false)
    }

    fetchData()
  }, [])

  const displayName = isSupreme
    ? `AdminSupremo Turco`
    : profile?.username ?? profile?.name?.split(' ')[0] ?? ''

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center mb-10 gap-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    )
  }

  const activeTournaments = tournaments.filter(t => t.status === 'active')
  const otherTournaments = tournaments.filter(t => t.status !== 'active')

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-4xl font-bold mb-1" style={{ color: 'var(--color-gold)' }}>
            FifaCup
          </h1>
          <h2 className="text-2xl font-bold text-white mb-2">Santana</h2>
          {profile && (
            <p className="text-white/40 text-sm flex items-center gap-1.5">
              {isSupreme && <Shield size={12} style={{ color: 'var(--color-gold)' }} />}
              Olá, {displayName}
            </p>
          )}
        </div>

        {/* Botão instalar PWA */}
        {!isInstalled && (
          <div className="mb-6">
            {installPrompt ? (
              <button
                onClick={install}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition text-sm font-medium"
              >
                <Download size={16} style={{ color: 'var(--color-gold)' }} />
                Instalar app no celular
              </button>
            ) : (
              <div className="px-4 py-3 rounded-xl border border-white/10 bg-white/5">
                <p className="text-white/60 text-xs text-center">
                  📱 Para instalar: toque em{' '}
                  <span className="text-white font-medium">Compartilhar</span> →{' '}
                  <span className="text-white font-medium">Adicionar à Tela de Início</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Atalhos fixos */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {isSupreme && (
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-3 p-4 rounded-xl border hover:bg-white/10 transition col-span-2"
              style={{ backgroundColor: 'rgba(201,153,42,0.08)', borderColor: 'rgba(201,153,42,0.3)' }}
            >
              <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(201,153,42,0.2)' }}>
                <Shield size={20} style={{ color: 'var(--color-gold)' }} />
              </div>
              <div className="min-w-0 text-left">
                <p className="font-bold text-sm" style={{ color: 'var(--color-gold)' }}>Painel Supreme</p>
                <p className="text-white/40 text-xs">Aprovar contas e gerenciar usuários</p>
              </div>
            </button>
          )}

          {!isSupreme && (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(201,153,42,0.2)' }}>
                  <User size={20} style={{ color: 'var(--color-gold)' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">Meu perfil</p>
                  <p className="text-white/40 text-xs truncate">Editar informações</p>
                </div>
              </Link>
              <button
                onClick={() => navigate('/tournaments/new')}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(201,153,42,0.2)' }}>
                  <Plus size={20} style={{ color: 'var(--color-gold)' }} />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-white font-bold text-sm truncate">Criar campeonato</p>
                  <p className="text-white/40 text-xs truncate">1v1 ou 2v2</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/tournaments/join')}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(201,153,42,0.2)' }}>
                  <Hash size={20} style={{ color: 'var(--color-gold)' }} />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-white font-bold text-sm truncate">Entrar com código</p>
                  <p className="text-white/40 text-xs truncate">Tenho um convite</p>
                </div>
              </button>
            </>
          )}
        </div>

        {/* Campeonatos ativos */}
        {activeTournaments.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">
              Em andamento
            </h3>
            <div className="flex flex-col gap-3">
              {activeTournaments.map(t => (
                <TournamentCard key={t.id} tournament={t} onClick={() => navigate(`/tournament/${t.id}`)} />
              ))}
            </div>
          </div>
        )}

        {/* Outros campeonatos */}
        {otherTournaments.length > 0 && (
          <div className="mb-6">
            <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">
              Outros campeonatos
            </h3>
            <div className="flex flex-col gap-3">
              {otherTournaments.map(t => (
                <TournamentCard key={t.id} tournament={t} onClick={() => navigate(`/tournament/${t.id}`)} />
              ))}
            </div>
          </div>
        )}

        {tournaments.length === 0 && (
          <div className="text-center mt-8">
            <Trophy size={40} className="mx-auto mb-3 text-white/10" />
            <p className="text-white/30 text-sm">Nenhum campeonato ainda.</p>
            <p className="text-white/20 text-xs mt-1">Crie o primeiro ou entre com um código.</p>
          </div>
        )}

      </div>
    </div>
  )
}

function TournamentCard({ tournament: t, onClick }: { tournament: Tournament; onClick: () => void }) {
  const status = STATUS_LABEL[t.status] ?? { label: t.status, color: 'text-white/40' }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-left w-full"
    >
      <div className="p-2.5 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(201,153,42,0.15)' }}>
        {t.mode === '1v1'
          ? <Swords size={20} style={{ color: 'var(--color-gold)' }} />
          : <Handshake size={20} style={{ color: 'var(--color-gold)' }} />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm truncate">{t.name}</p>
        <p className="text-white/40 text-xs truncate">
          {t.mode} · {FORMAT_LABEL[t.format] ?? t.format}
        </p>
        {t.date && (
          <p className="text-white/30 text-xs flex items-center gap-1 mt-0.5">
            <Calendar size={10} />
            {new Date(t.date).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>
      <div className="flex-shrink-0 text-right">
        <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
        <p className="text-white/20 text-xs mt-0.5 font-mono">{t.invite_code}</p>
      </div>
    </button>
  )
}
