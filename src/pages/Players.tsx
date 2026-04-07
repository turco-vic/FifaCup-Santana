import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export default function Players() {
    const [players, setPlayers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchPlayers() {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'player')
                .order('name')

            setPlayers(data ?? [])
            setLoading(false)
        }

        fetchPlayers()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-white">Carregando...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-2xl mx-auto">

                <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-gold)' }}>
                    Participantes
                </h1>

                <div className="flex flex-col gap-3">
                    {players.map(player => (
                        <Link
                            key={player.id}
                            to={`/player/${player.id}`}
                            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                        >
                            {/* Avatar */}
                            <div
                                className="w-12 h-12 rounded-full overflow-hidden bg-white/10 border-2 flex-shrink-0"
                                style={{ borderColor: 'var(--color-gold)' }}
                            >
                                {player.avatar_url ? (
                                    <img src={player.avatar_url} alt={player.name ?? ''} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/30 font-bold text-lg">
                                        {player.name?.charAt(0) ?? '?'}
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-bold truncate">{player.name ?? 'Sem nome'}</p>
                                {player.username && (
                                    <p className="text-white/40 text-sm">@{player.username}</p>
                                )}
                            </div>

                            {/* Time */}
                            {player.team_name && (
                                <div
                                    className="text-xs font-bold px-3 py-1 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-green)' }}
                                >
                                    {player.team_name}
                                </div>
                            )}
                        </Link>
                    ))}
                </div>

                <p className="text-white/30 text-sm text-center mt-6">
                    {players.length} participante{players.length !== 1 ? 's' : ''} cadastrado{players.length !== 1 ? 's' : ''}
                </p>

            </div>
        </div>
    )
}
