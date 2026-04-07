import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useMatches } from '../hooks/useMatches'
import { useStandings } from '../hooks/useStandings'
import GroupTable from '../components/GroupTable'
import ScoreModal from '../components/ScoreModal'
import type { Profile, Match } from '../types'

const GROUP_NAMES = ['Grupo A', 'Grupo B', 'Grupo C', 'Grupo D']

type GroupData = {
    id: string
    name: string
    players: Profile[]
}

export default function Bracket1v1() {
    const { profile } = useAuth()
    const { matches, loading: matchesLoading } = useMatches('1v1')
    const [groups, setGroups] = useState<GroupData[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)

    useEffect(() => {
        fetchGroups()
    }, [])

    async function fetchGroups() {
        const { data: groupsData } = await supabase
            .from('groups')
            .select('id, name')
            .order('name')

        if (!groupsData || groupsData.length === 0) {
            setLoading(false)
            return
        }

        const { data: members } = await supabase
            .from('group_members')
            .select('group_id, profile:player_id(id, name, username, avatar_url, team_name, role, created_at)')

        const grouped: GroupData[] = groupsData.map(g => ({
            id: g.id,
            name: g.name,
            players: (members ?? [])
                .filter(m => m.group_id === g.id)
                .map(m => m.profile as unknown as Profile),
        }))

        setGroups(grouped)
        setLoading(false)
    }

    function getGroupMatches(groupPlayers: Profile[]) {
        const ids = groupPlayers.map(p => p.id)
        return matches.filter(
            m => m.stage === 'groups' && ids.includes(m.home_id) && ids.includes(m.away_id)
        )
    }

    function getPlayerName(id: string) {
        for (const g of groups) {
            const p = g.players.find(p => p.id === id)
            if (p) return p.username ?? p.name ?? 'Sem nome'
        }
        return 'Desconhecido'
    }

    if (loading || matchesLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-white">Carregando...</p>
            </div>
        )
    }

    if (groups.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-white/40">O sorteio dos grupos ainda não foi realizado.</p>
            </div>
        )
    }

    const isAdmin = profile?.role === 'admin'

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-2xl mx-auto">

                <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-gold)' }}>
                    1v1 — Fase de Grupos
                </h1>

                <div className="flex flex-col gap-6">
                    {groups.map((group, gi) => {
                        const groupMatches = getGroupMatches(group.players)
                        const standings = useStandings(group.players, groupMatches)

                        return (
                            <div key={group.id} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">

                                {/* Header do grupo */}
                                <div className="px-4 py-3 border-b border-white/10"
                                    style={{ backgroundColor: 'rgba(201,153,42,0.1)' }}>
                                    <h2 className="font-bold" style={{ color: 'var(--color-gold)' }}>
                                        {group.name}
                                    </h2>
                                </div>

                                {/* Tabela de classificação */}
                                <div className="px-2 py-2">
                                    <GroupTable standings={standings} qualifiers={2} />
                                </div>

                                {/* Partidas do grupo */}
                                <div className="border-t border-white/10 px-4 py-3">
                                    <p className="text-white/40 text-xs mb-3 uppercase tracking-wider">Partidas</p>
                                    <div className="flex flex-col gap-2">
                                        {groupMatches.map(match => (
                                            <div
                                                key={match.id}
                                                className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0"
                                            >
                                                <span className="flex-1 text-right text-sm text-white truncate">
                                                    {getPlayerName(match.home_id)}
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
                                                    {getPlayerName(match.away_id)}
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
                        )
                    })}
                </div>

            </div>

            {selectedMatch && (
                <ScoreModal
                    match={selectedMatch}
                    homeName={getPlayerName(selectedMatch.home_id)}
                    awayName={getPlayerName(selectedMatch.away_id)}
                    onClose={() => setSelectedMatch(null)}
                />
            )}
        </div>
    )
}
