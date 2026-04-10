import type { Match, Profile, Standing } from '../types'

export function useStandings(players: Profile[], matches: Match[]): Standing[] {
    const standings: Record<string, Standing> = {}

    // Inicializa todos os jogadores
    players.forEach(p => {
        standings[p.id] = {
            id: p.id,
            name: p.username ?? p.name ?? 'Sem nome',
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goals_for: 0,
            goals_against: 0,
            goal_diff: 0,
            points: 0,
        }
    })

    // Processa partidas jogadas
    matches
        .filter(m => m.played && m.home_score !== null && m.away_score !== null)
        .forEach(m => {
            const home = standings[m.home_id]
            const away = standings[m.away_id]
            if (!home || !away) return

            const hs = m.home_score!
            const as_ = m.away_score!

            home.played++
            away.played++
            home.goals_for += hs
            home.goals_against += as_
            away.goals_for += as_
            away.goals_against += hs

            if (hs > as_) {
                home.wins++; home.points += 3
                away.losses++
            } else if (hs < as_) {
                away.wins++; away.points += 3
                home.losses++
            } else {
                home.draws++; home.points++
                away.draws++; away.points++
            }
        })

    // Calcula saldo e ordena
    return Object.values(standings) 
        .map(s => ({ ...s, goal_diff: s.goals_for - s.goals_against }))
        .sort((a, b) =>
            b.points - a.points ||
            b.goal_diff - a.goal_diff ||
            b.goals_for - a.goals_for
        )
}
