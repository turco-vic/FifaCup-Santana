import type { Standing } from '../types'

type Props = {
    standings: Standing[]
    qualifiers?: number // quantos avançam (padrão 2)
}

export default function GroupTable({ standings, qualifiers = 2 }: Props) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-white/40 text-xs">
                        <th className="text-left py-2 pl-2">#</th>
                        <th className="text-left py-2">Jogador</th>
                        <th className="text-center py-2">J</th>
                        <th className="text-center py-2">V</th>
                        <th className="text-center py-2">E</th>
                        <th className="text-center py-2">D</th>
                        <th className="text-center py-2">GS</th>
                        <th className="text-center py-2">GC</th>
                        <th className="text-center py-2">SG</th>
                        <th className="text-center py-2 pr-2">Pts</th>
                    </tr>
                </thead>
                <tbody>
                    {standings.map((s, i) => (
                        <tr
                            key={s.id}
                            className={`border-t border-white/5 ${i < qualifiers ? 'bg-green-500/5' : ''}`}
                        >
                            <td className="py-2 pl-2 text-white/40">{i + 1}</td>
                            <td className="py-2">
                                <span className={`font-medium ${i < qualifiers ? 'text-white' : 'text-white/60'}`}>
                                    {s.name}
                                </span>
                                {i < qualifiers && (
                                    <span className="ml-2 text-xs text-green-400">↑</span>
                                )}
                            </td>
                            <td className="text-center py-2 text-white/60">{s.played}</td>
                            <td className="text-center py-2 text-green-400">{s.wins}</td>
                            <td className="text-center py-2 text-white/60">{s.draws}</td>
                            <td className="text-center py-2 text-red-400">{s.losses}</td>
                            <td className="text-center py-2 text-white/60">{s.goals_for}</td>
                            <td className="text-center py-2 text-white/60">{s.goals_against}</td>
                            <td className="text-center py-2 text-white/60">{s.goal_diff > 0 ? `+${s.goal_diff}` : s.goal_diff}</td>
                            <td className="text-center py-2 pr-2 font-bold" style={{ color: 'var(--color-gold)' }}>
                                {s.points}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
