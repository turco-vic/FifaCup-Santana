import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Match } from '../types'

export function useMatches(mode: '1v1' | '2v2') {
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMatches()

        const channel = supabase
            .channel(`matches-${mode}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'matches' },
                () => fetchMatches()
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [mode])

    async function fetchMatches() {
        const { data } = await supabase
            .from('matches')
            .select('*')
            .eq('mode', mode)
            .order('match_order')

        setMatches(data ?? [])
        setLoading(false)
    }

    return { matches, loading }
}
