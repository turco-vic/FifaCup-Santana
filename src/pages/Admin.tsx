import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Admin() {
  const { profile, loading, signIn, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleLogin() {
    setError('')
    setSubmitting(true)
    const { error } = await signIn(email, password)
    if (error) setError('Email ou senha incorretos.')
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Carregando...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">

          <div className="flex flex-col items-center mb-8">
            <img src="/favicon.svg" alt="Logo" className="w-16 h-16 mb-4" />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-gold)' }}>
              FifaCup San Tanã
            </h1>
            <p className="text-white/60 text-sm mt-1">Painel Administrativo</p>
          </div>

          <div className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:border-yellow-500"
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:border-yellow-500"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleLogin}
              disabled={submitting}
              className="w-full py-3 rounded-lg font-bold text-white transition"
              style={{ backgroundColor: 'var(--color-gold)' }}
            >
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

        </div>
      </div>
    )
  }

  if (profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Acesso restrito ao administrador.</p>
          <button
            onClick={signOut}
            className="mt-4 px-6 py-2 rounded-lg text-white border border-white/30 hover:bg-white/10 transition"
          >
            Sair
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-gold)' }}>
            Painel Admin
          </h1>
          <button
            onClick={signOut}
            className="px-4 py-2 rounded-lg text-white border border-white/30 hover:bg-white/10 transition text-sm"
          >
            Sair
          </button>
        </div>

        <p className="text-white/60">Bem-vindo, admin! Em breve as funcionalidades aparecerão aqui.</p>

      </div>
    </div>
  )
}
