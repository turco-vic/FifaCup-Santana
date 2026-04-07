import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useMatches } from '../hooks/useMatches'
import { useStandings } from '../hooks/useStandings'
import GroupTable from '../components/GroupTable'
import ScoreModal from '../components/ScoreModal'
import type { Profile, Duo, Match } from '../types'

type DuoWithPlayers = Duo & {
    player1: Profile
    player2: Profile
}

export default function League2v2() {
    const { profile } = useAuth()
    const { matches, loading: matchesLoading } = useMatches('2v2')
    const [duos, setDuos] = useState<DuoWithPlayers[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)

    useEffect(() => {
        fetchDuos()
    }, [])

    async function fetchDuos() {
        const { data } = await supabase
            .from('duos')
            .select(`
        id, team_name, created_at, player1_id, player2_id,
        player1:player1_id(id, name, username, avatar_url, team_name, role, created_at),
        player2:player2_id(id, name, username, avatar_url, team_name, role, created_at)
      `)

        setDuos((data as unknown as DuoWithPlayers[]) ?? [])
        setLoading(false)
    }

    function getDuoName(duo: DuoWithPlayers) {
        const p1 = duo.player1?.username ?? duo.player1?.name ?? '?'
        const p2 = duo.player2?.username ?? duo.player2?.name ?? '?'
        return `${p1} & ${p2}`
    }

    function getDuoNameById(id: string) {
        const duo = duos.find(d => d.id === id)
        if (!duo) return 'Desconhecido'
        return getDuoName(duo)
    }

    // Converte duplas para o formato Profile para reutilizar useStandings
    const duosAsProfiles: Profile[] = duos.map(d => ({
        id: d.id,
        name: getDuoName(d),
        username: null,
        avatar_url: null,
        team_name: null,
        role: 'player',
        created_at: d.created_at,
    }))

    const standings = useStandings(duosAsProfiles, matches)

    if (loading || matchesLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-white">Carregando...</p>
            </div>
        )
    }

    if (duos.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-white/40">As duplas ainda não foram definidas.</p>
            </div>
        )
    }

    const isAdmin = profile?.role === 'admin'

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-2xl mx-auto">

                <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-gold)' }}>
                    2v2 — Pontos Corridos
                </h1>

                {/* Tabela de classificação */}
                <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden mb-6">
                    <div className="px-4 py-3 border-b border-white/10"
                        style={{ backgroundColor: 'rgba(201,153,42,0.1)' }}>
                        <h2 className="font-bold" style={{ color: 'var(--color-gold)' }}>
                            Classificação
                        </h2>
                    </div>
                    <div className="px-2 py-2">
                        <GroupTable standings={standings} qualifiers={0} />
                    </div>
                </div>

                {/* Partidas */}
                <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10"
                        style={{ backgroundColor: 'rgba(201,153,42,0.1)' }}>
                        <h2 className="font-bold" style={{ color: 'var(--color-gold)' }}>
                            Partidas
                        </h2>
                    </div>

                    <div className="px-4 py-3 flex flex-col gap-2">
                        {matches.map(match => (
                            <div
                                key={match.id}
                                className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0"
                            >
                                <span className="flex-1 text-right text-sm text-white truncate">
                                    {getDuoNameById(match.home_id)}
                                </span>

                                <div className="flex items-center gap-1 flex-shrink-0">
                                    {match.played ? (
                                        <span className="font-bold text-white px-2">
                                            {match.home_score} × {match.away_score}
                                        </span>
                                    ) : (
                                        <span className="text-white/30 px-2 text-sm">vs</span>
                                    )}
                                </div>

                                <span className="flex-1 text-left text-sm text-white truncate">
                                    {getDuoNameById(match.away_id)}
                                </span>

                                {isAdmin && (
                                    <button
                                        onClick={() => setSelectedMatch(match)}
                                        className="text-xs px-2 py-1 rounded border border-white/20 text-white/50 hover:text-white hover:border-white/40 transition flex-shrink-0"
                                    >
                                        {match.played ? '✏️' : '+ Placar'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {selectedMatch && (
                <ScoreModal
                    match={selectedMatch}
                    homeName={getDuoNameById(selectedMatch.home_id)}
                    awayName={getDuoNameById(selectedMatch.away_id)}
                    onClose={() => setSelectedMatch(null)}
                />
            )}
        </div>
    )
}
