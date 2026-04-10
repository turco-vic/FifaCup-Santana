import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useStandings } from '../hooks/useStandings'
import GroupTable from '../components/GroupTable'
import type { Tournament, Profile, Match, TournamentPlayer } from '../types'
import {
    ArrowLeft, MapPin, Calendar, Copy, Check,
    Trophy, Settings, Swords, Handshake, Pencil, Plus, Clock
} from 'lucide-react'
import { Skeleton } from '../components/Skeleton'
import ScoreModal from '../components/ScoreModal'

const FORMAT_LABEL: Record<string, string> = {
    groups_knockout: 'Grupos + Mata-mata',
    league: 'Liga',
    knockout: 'Mata-mata',
    league_final: 'Liga + Final',
}

const STAGE_LABEL: Record<string, string> = {
    groups: 'Grupos',
    quarters: 'Quartas',
    semis: 'Semifinal',
    final: 'Final',
    league: 'Liga',
    knockout: 'Mata-mata',
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    setup: { label: 'Em configuração', color: 'text-white/50', bg: 'bg-white/10' },
    active: { label: 'Em andamento', color: 'text-green-400', bg: 'bg-green-500/15' },
    finished: { label: 'Encerrado', color: 'text-white/30', bg: 'bg-white/5' },
}

type Tab = 'partidas' | 'jogadores'

type DuoWithPlayers = {
    id: string
    player1: Profile
    player2: Profile
    duo_name: string | null
}

export default function TournamentDashboard() {
    const { id } = useParams<{ id: string }>()
    const { profile, loading: authLoading, isSupreme } = useAuth()
    const navigate = useNavigate()

    const [tournament, setTournament] = useState<Tournament | null>(null)
    const [players, setPlayers] = useState<Profile[]>([])
    const [duos, setDuos] = useState<DuoWithPlayers[]>([])
    const [matches, setMatches] = useState<Match[]>([])
    const [myRole, setMyRole] = useState<TournamentPlayer['role'] | null>(null)
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<Tab>('partidas')
    const [copied, setCopied] = useState(false)
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
    const [notMember, setNotMember] = useState(false)
    const [generatingFinal, setGeneratingFinal] = useState(false)

    useEffect(() => {
        if (authLoading) return
        if (id) fetchAll(id)
    }, [id, authLoading, profile?.id])

    async function fetchAll(tid: string) {
        setLoading(true)
        const [{ data: t }, { data: tp }, { data: m }, { data: d }] = await Promise.all([
            supabase.from('tournaments').select('*').eq('id', tid).single(),
            supabase.from('tournament_players').select('*, profile:player_id(*)').eq('tournament_id', tid),
            supabase.from('matches').select('*').eq('tournament_id', tid).order('match_order'),
            supabase.from('duos').select('id, duo_name, player1:player1_id(*), player2:player2_id(*)').eq('tournament_id', tid),
        ])

        if (!t) { navigate('/'); return }

        setTournament(t)
        setMatches(m ?? [])
        setDuos((d as unknown as DuoWithPlayers[]) ?? [])

        const tpList = (tp ?? []) as (TournamentPlayer & { profile: Profile })[]
        setPlayers(tpList.map(tp => tp.profile).filter(Boolean))

        const me = tpList.find(tp => tp.player_id === profile?.id)
        if (me) {
            setMyRole(me.role)
            setNotMember(false)
        } else if (isSupreme) {
            setNotMember(false)
        } else {
            setNotMember(true)
        }

        setLoading(false)
    }

    function getEntityName(entityId: string): string {
        // Tenta dupla primeiro
        const duo = duos.find(d => d.id === entityId)
        if (duo) {
            if (duo.duo_name) return duo.duo_name
            const p1 = duo.player1?.username ?? duo.player1?.name ?? '?'
            const p2 = duo.player2?.username ?? duo.player2?.name ?? '?'
            return `${p1} & ${p2}`
        }
        // Senão tenta jogador
        const player = players.find(p => p.id === entityId)
        return player?.username ?? player?.name ?? 'Desconhecido'
    }

    // Para standings de liga 2v2, precisa de profiles fictícios das duplas
    const duosAsProfiles: Profile[] = duos.map(d => ({
        id: d.id,
        name: d.duo_name ?? `${d.player1?.username ?? d.player1?.name ?? '?'} & ${d.player2?.username ?? d.player2?.name ?? '?'}`,
        username: null,
        avatar_url: null,
        team_name: null,
        role: 'player' as const,
        status: 'active' as const,
        created_at: '',
    }))

    async function handleGenerateFinal() {
        if (!tournament || !id) return
        setGeneratingFinal(true)

        const leagueMatches = matches.filter(m => m.stage === 'league')
        const entityIds = tournament.mode === '2v2'
            ? duos.map(d => d.id)
            : players.map(p => p.id)

        const standings = entityIds.map(eid => {
            const pts = leagueMatches.filter(m => m.played).reduce((acc, m) => {
                if (m.home_id === eid) {
                    if ((m.home_score ?? 0) > (m.away_score ?? 0)) return acc + 3
                    if ((m.home_score ?? 0) === (m.away_score ?? 0)) return acc + 1
                }
                if (m.away_id === eid) {
                    if ((m.away_score ?? 0) > (m.home_score ?? 0)) return acc + 3
                    if ((m.home_score ?? 0) === (m.away_score ?? 0)) return acc + 1
                }
                return acc
            }, 0)
            return { id: eid, pts }
        }).sort((a, b) => b.pts - a.pts)

        if (standings.length < 2) { setGeneratingFinal(false); return }

        await supabase.from('matches').delete().eq('tournament_id', id).eq('stage', 'final')
        await supabase.from('matches').insert({
            tournament_id: id,
            mode: tournament.mode,
            stage: 'final',
            home_id: standings[0].id,
            away_id: standings[1].id,
            played: false,
            match_order: 999,
        })

        setGeneratingFinal(false)
        fetchAll(id)
    }

    function copyCode() {
        if (!tournament) return
        navigator.clipboard.writeText(tournament.invite_code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const isAdmin = isSupreme || myRole === 'admin'
    const leagueMatches = matches.filter(m => m.stage === 'league')
    const finalMatch = matches.find(m => m.stage === 'final')
    const knockoutMatches = matches.filter(m => ['quarters', 'semis', 'knockout'].includes(m.stage))
    const groupMatches = matches.filter(m => m.stage === 'groups')
    const allLeaguePlayed = leagueMatches.length > 0 && leagueMatches.every(m => m.played)

    // Standings — usa duplas como profiles pra 2v2, jogadores pra 1v1
    const standingsProfiles = tournament?.mode === '2v2' ? duosAsProfiles : players
    const leagueStandings = useStandings(standingsProfiles, leagueMatches)

    const hasChampion = !!finalMatch && finalMatch.played &&
        finalMatch.home_score !== null && finalMatch.away_score !== null &&
        finalMatch.home_score !== finalMatch.away_score

    if (authLoading || loading) {
        return (
            <div className="min-h-screen p-6">
                <div className="max-w-2xl mx-auto flex flex-col gap-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-28" />
                        <Skeleton className="h-9 w-28" />
                    </div>
                    <Skeleton className="h-40 w-full rounded-xl" />
                </div>
            </div>
        )
    }

    if (!tournament) return null

    if (notMember) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-4">
                <Trophy size={48} className="text-white/10" />
                <p className="text-white/50 text-center">Você não faz parte desse campeonato.</p>
                <button
                    onClick={() => navigate('/tournaments/join')}
                    className="px-6 py-3 rounded-xl font-bold transition hover:opacity-90"
                    style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-green)' }}
                >
                    Entrar com código
                </button>
            </div>
        )
    }

    const statusCfg = STATUS_CONFIG[tournament.status]

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate('/')} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition flex-shrink-0">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-white truncate">{tournament.name}</h1>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs px-2 py-0.5 rounded font-bold"
                                style={{ backgroundColor: 'rgba(201,153,42,0.2)', color: 'var(--color-gold)' }}>
                                {tournament.mode}
                            </span>
                            <span className="text-white/30 text-xs">{FORMAT_LABEL[tournament.format]}</span>
                            <span className={`text-xs px-2 py-0.5 rounded font-bold ${statusCfg.color} ${statusCfg.bg}`}>
                                {statusCfg.label}
                            </span>
                        </div>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => navigate(`/tournament/${tournament.id}/manage`)}
                            className="p-2 rounded-lg border border-white/20 text-white/40 hover:text-white hover:border-white/40 transition flex-shrink-0"
                        >
                            <Settings size={18} />
                        </button>
                    )}
                </div>

                {/* Info card */}
                <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 mb-6 flex flex-col gap-2">
                    {tournament.location && (
                        <div className="flex items-center gap-2 text-white/50 text-sm">
                            <MapPin size={13} /><span>{tournament.location}</span>
                        </div>
                    )}
                    {tournament.date && (
                        <div className="flex items-center gap-2 text-white/50 text-sm">
                            <Calendar size={13} />
                            <span>{new Date(tournament.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                    )}
                    {tournament.description && (
                        <p className="text-white/40 text-xs mt-1">{tournament.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/10">
                        <div>
                            <p className="text-white/30 text-xs">Código de convite</p>
                            <p className="text-white font-mono font-bold tracking-widest">{tournament.invite_code}</p>
                        </div>
                        <button onClick={copyCode}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white/50 hover:text-white hover:border-white/40 transition text-xs font-medium">
                            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                            {copied ? 'Copiado!' : 'Copiar'}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {(['partidas', 'jogadores'] as Tab[]).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className="px-4 py-2 rounded-lg font-bold text-sm transition"
                            style={tab === t
                                ? { backgroundColor: 'var(--color-gold)', color: 'var(--color-green)' }
                                : { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }
                            }>
                            {t === 'partidas' ? 'Partidas' : `Jogadores (${players.length})`}
                        </button>
                    ))}
                </div>

                {/* Tab: Partidas */}
                {tab === 'partidas' && (
                    <div className="flex flex-col gap-6">
                        {matches.length === 0 ? (
                            <div className="text-center py-12">
                                {tournament.mode === '1v1'
                                    ? <Swords size={40} className="mx-auto mb-3 text-white/10" />
                                    : <Handshake size={40} className="mx-auto mb-3 text-white/10" />
                                }
                                <p className="text-white/30 text-sm">Nenhuma partida ainda.</p>
                                {isAdmin && (
                                    <button
                                        onClick={() => navigate(`/tournament/${tournament.id}/manage`)}
                                        className="mt-4 px-5 py-2.5 rounded-xl font-bold text-sm transition hover:opacity-90"
                                        style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-green)' }}
                                    >
                                        Gerenciar campeonato
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Liga */}
                                {leagueMatches.length > 0 && (
                                    <div>
                                        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden mb-4">
                                            <div className="px-4 py-3 border-b border-white/10" style={{ backgroundColor: 'rgba(201,153,42,0.08)' }}>
                                                <h3 className="font-bold text-sm" style={{ color: 'var(--color-gold)' }}>Classificação</h3>
                                            </div>
                                            <div className="px-2 py-2">
                                                <GroupTable standings={leagueStandings} qualifiers={0} />
                                            </div>
                                        </div>

                                        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                                            <div className="px-4 py-3 border-b border-white/10" style={{ backgroundColor: 'rgba(201,153,42,0.08)' }}>
                                                <h3 className="font-bold text-sm" style={{ color: 'var(--color-gold)' }}>Partidas</h3>
                                            </div>
                                            <div className="px-4 py-3 flex flex-col">
                                                {leagueMatches.map(match => (
                                                    <MatchRow key={match.id} match={match}
                                                        getEntityName={getEntityName} isAdmin={isAdmin}
                                                        onEdit={() => setSelectedMatch(match)} />
                                                ))}
                                            </div>
                                        </div>

                                        {isAdmin && allLeaguePlayed && !finalMatch && tournament.format === 'league_final' && (
                                            <button onClick={handleGenerateFinal} disabled={generatingFinal}
                                                className="w-full mt-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition hover:opacity-90"
                                                style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-green)' }}>
                                                <Trophy size={16} />
                                                {generatingFinal ? 'Gerando...' : 'Gerar Final'}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Grupos */}
                                {groupMatches.length > 0 && (
                                    <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-white/10" style={{ backgroundColor: 'rgba(201,153,42,0.08)' }}>
                                            <h3 className="font-bold text-sm" style={{ color: 'var(--color-gold)' }}>Fase de Grupos</h3>
                                        </div>
                                        <div className="px-4 py-3 flex flex-col">
                                            {groupMatches.map(match => (
                                                <MatchRow key={match.id} match={match}
                                                    getEntityName={getEntityName} isAdmin={isAdmin}
                                                    onEdit={() => setSelectedMatch(match)} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Mata-mata */}
                                {knockoutMatches.length > 0 && (
                                    <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-white/10" style={{ backgroundColor: 'rgba(201,153,42,0.08)' }}>
                                            <h3 className="font-bold text-sm" style={{ color: 'var(--color-gold)' }}>Mata-mata</h3>
                                        </div>
                                        <div className="px-4 py-3 flex flex-col">
                                            {knockoutMatches.map(match => (
                                                <MatchRow key={match.id} match={match}
                                                    getEntityName={getEntityName} isAdmin={isAdmin}
                                                    onEdit={() => setSelectedMatch(match)} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Final */}
                                {finalMatch && (
                                    <div className="rounded-xl bg-white/5 border overflow-hidden"
                                        style={{ borderColor: 'var(--color-gold)' }}>
                                        <div className="px-4 py-3 border-b flex items-center gap-2"
                                            style={{ backgroundColor: 'rgba(201,153,42,0.15)', borderColor: 'var(--color-gold)' }}>
                                            <Trophy size={16} style={{ color: 'var(--color-gold)' }} />
                                            <h3 className="font-bold" style={{ color: 'var(--color-gold)' }}>Final</h3>
                                        </div>
                                        <div className="px-4 py-4">
                                            <MatchRow match={finalMatch}
                                                getEntityName={getEntityName} isAdmin={isAdmin}
                                                onEdit={() => setSelectedMatch(finalMatch)} />
                                            {hasChampion && (
                                                <div className="mt-4 text-center">
                                                    <p className="text-white/40 text-xs mb-1">🏆 Campeão</p>
                                                    <p className="font-bold text-lg" style={{ color: 'var(--color-gold)' }}>
                                                        {finalMatch.home_score! > finalMatch.away_score!
                                                            ? getEntityName(finalMatch.home_id)
                                                            : getEntityName(finalMatch.away_id)
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Tab: Jogadores */}
                {tab === 'jogadores' && (
                    <div className="flex flex-col gap-4">
                        {/* Se 2v2 e tem duplas, mostra duplas */}
                        {tournament.mode === '2v2' && duos.length > 0 ? (
                            <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                                <div className="px-4 py-3 border-b border-white/10" style={{ backgroundColor: 'rgba(201,153,42,0.08)' }}>
                                    <h3 className="font-bold text-sm" style={{ color: 'var(--color-gold)' }}>
                                        Duplas ({duos.length})
                                    </h3>
                                </div>
                                {duos.map((duo, i) => (
                                    <div key={duo.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0">
                                        <span className="text-white/30 text-xs w-5 text-center">{i + 1}</span>
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-bold">
                                                {duo.duo_name ?? `${duo.player1?.username ?? duo.player1?.name} & ${duo.player2?.username ?? duo.player2?.name}`}
                                            </p>
                                            {!duo.duo_name && (
                                                <p className="text-white/40 text-xs mt-0.5">
                                                    {duo.player1?.name} + {duo.player2?.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                                {players.length === 0 ? (
                                    <p className="text-white/30 text-sm text-center py-8">Nenhum jogador ainda.</p>
                                ) : players.map(player => (
                                    <div key={player.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center border"
                                            style={{ borderColor: 'var(--color-gold)' }}>
                                            {player.avatar_url
                                                ? <img src={player.avatar_url} alt="" className="w-full h-full object-cover" />
                                                : <span className="text-white/40 text-sm font-bold">{player.name?.charAt(0) ?? '?'}</span>
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{player.name}</p>
                                            {player.username && <span className="text-white/40 text-xs">@{player.username}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>

            {selectedMatch && (
                <ScoreModal
                    match={selectedMatch}
                    homeName={getEntityName(selectedMatch.home_id)}
                    awayName={getEntityName(selectedMatch.away_id)}
                    onClose={() => {
                        setSelectedMatch(null)
                        if (id) fetchAll(id)
                    }}
                />
            )}
        </div>
    )
}

function MatchRow({ match, getEntityName, isAdmin, onEdit }: {
    match: Match
    getEntityName: (id: string) => string
    isAdmin: boolean
    onEdit: () => void
}) {
    return (
        <div className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0">
            <span className="text-xs px-1.5 py-0.5 rounded font-bold flex-shrink-0"
                style={{ backgroundColor: 'rgba(201,153,42,0.15)', color: 'var(--color-gold)' }}>
                {STAGE_LABEL[match.stage] ?? match.stage}
            </span>
            <span className="flex-1 text-right text-sm text-white truncate">{getEntityName(match.home_id)}</span>
            {match.played ? (
                <span className="font-bold text-white px-2 flex-shrink-0">{match.home_score} × {match.away_score}</span>
            ) : (
                <span className="text-white/30 px-2 flex-shrink-0 text-sm flex items-center gap-1">
                    <Clock size={10} />vs
                </span>
            )}
            <span className="flex-1 text-left text-sm text-white truncate">{getEntityName(match.away_id)}</span>
            {isAdmin && (
                <button onClick={onEdit} className="p-1.5 rounded border border-white/20 text-white/40 hover:text-white hover:border-white/40 transition flex-shrink-0">
                    {match.played ? <Pencil size={12} /> : <Plus size={12} />}
                </button>
            )}
        </div>
    )
}
