import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function Register() {
    const { signUp } = useAuth()
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [done, setDone] = useState(false)

    async function handleRegister() {
        setError('')

        if (!name.trim()) {
            setError('Nome completo obrigatório.')
            return
        }
        if (!email.trim()) {
            setError('Email obrigatório.')
            return
        }
        if (password.length < 6) {
            setError('Senha deve ter pelo menos 6 caracteres.')
            return
        }
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.')
            return
        }

        setSubmitting(true)
        const { error } = await signUp(email, password, name.trim())

        if (error) {
            setError(error.message ?? 'Erro ao criar conta.')
            setSubmitting(false)
            return
        }

        setDone(true)
    }

    if (done) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="w-full max-w-sm text-center flex flex-col items-center gap-5">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(201,153,42,0.15)' }}
                    >
                        <CheckCircle size={32} style={{ color: 'var(--color-gold)' }} />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-xl mb-2">Conta criada!</h2>
                        <p className="text-white/50 text-sm leading-relaxed">
                            Seu cadastro foi enviado para aprovação.{' '}
                            Aguarde o <span className="text-white font-medium">AdminSupremo</span> liberar seu acesso.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 rounded-lg font-bold transition hover:opacity-90"
                        style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-green)' }}
                    >
                        Voltar ao login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm">

                <div className="flex flex-col items-center mb-10">
                    <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain mb-4" />
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-gold)' }}>
                        Criar conta
                    </h1>
                    <p className="text-white/40 text-sm mt-1 text-center">
                        Sua conta será aprovada pelo AdminSupremo
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Nome completo"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:border-yellow-500"
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:border-yellow-500"
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Senha (mín. 6 caracteres)"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:border-yellow-500 pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirmar senha"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleRegister()}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:border-yellow-500"
                    />

                    {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    )}

                    <button
                        onClick={handleRegister}
                        disabled={submitting}
                        className="w-full py-3 rounded-lg font-bold transition hover:opacity-90"
                        style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-green)' }}
                    >
                        {submitting ? 'Criando conta...' : 'Criar conta'}
                    </button>

                    <p className="text-white/40 text-xs text-center">
                        Já tem conta?{' '}
                        <Link
                            to="/login"
                            className="font-bold hover:text-white transition"
                            style={{ color: 'var(--color-gold)' }}
                        >
                            Fazer login
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    )
}
