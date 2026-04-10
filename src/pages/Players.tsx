import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Profile } from '../types'
import { Skeleton, SkeletonCard } from '../components/Skeleton'

export default function Players() {
    const { isSupreme } = useAuth()
    const [players, setPlayers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchPlayers() {
            let query = supabase
                .from('profiles')
                .select('*')
                .order('name')

            if (!isSupreme) {
                // Jogadores normais veem só ativos e não-supreme
                query = query.eq('status', 'active').neq('role', 'supreme')
            }

            const { data } = await query
            setPlayers(data ?? [])
            setLoading(false)
        }

        fetchPlayers()
    }, [isSupreme])

    if (loading) {
        return (
            <div className="min-h-screen p-6">
                <div className="max-w-2xl mx-auto">
                    <Skeleton className="h-8 w-40 mb-6" />
                    <div className="flex flex-col gap-3">
                        {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-2xl mx-auto">

                <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-gold)' }}>
                    {isSupreme ? 'Todos os usuários' : 'Participantes'}
                </h1>

                <div className="flex flex-col gap-3">
                    {players.map(player => (
                        <Link
                            key={player.id}
                            to={`/player/${player.id}`}
                            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                        >
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

                            <div className="flex-1 min-w-0">
                                <p className="text-white font-bold truncate">{player.name ?? 'Sem nome'}</p>
                                <div className="flex items-center gap-2">
                                    {player.username && (
                                        <p className="text-white/40 text-sm">@{player.username}</p>
                                    )}
                                    {isSupreme && (
                                        <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${player.status === 'pending' ? 'bg-yellow-400/20 text-yellow-400' :
                                                player.status === 'blocked' ? 'bg-red-500/20 text-red-400' :
                                                    player.role === 'supreme' ? 'bg-purple-500/20 text-purple-400' :
                                                        'bg-green-500/20 text-green-400'
                                            }`}>
                                            {player.role === 'supreme' ? 'Supreme' :
                                                player.status === 'pending' ? 'Pendente' :
                                                    player.status === 'blocked' ? 'Bloqueado' : 'Ativo'}
                                        </span>
                                    )}
                                </div>
                            </div>

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
                    {players.length} usuário{players.length !== 1 ? 's' : ''}
                </p>

            </div>
        </div>
    )
}
