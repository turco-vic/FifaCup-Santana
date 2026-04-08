import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Home, Users, Swords, Handshake, Shuffle, Settings, User } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/players', label: 'Jogadores', icon: Users },
  { path: '/1v1', label: '1v1', icon: Swords },
  { path: '/2v2', label: '2v2', icon: Handshake },
  { path: '/draw', label: 'Sorteio', icon: Shuffle },
]

export default function Navbar() {
  const { profile } = useAuth()
  const location = useLocation()

  return (
    <nav
      className="w-full border-b border-white/10 px-4 py-3 flex items-center justify-between"
      style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo.png" alt="FifaCup Santana" className="h-10 w-10 object-contain" />
        <span className="font-bold text-sm" style={{ color: 'var(--color-gold)' }}>
          FifaCup <span className="text-white">Santana</span>
        </span>
      </Link>

      {/* Links — só no desktop */}
      <div className="hidden sm:flex items-center gap-1 ml-auto mr-3">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${location.pathname === path
              ? ''
              : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
            style={
              location.pathname === path
                ? { backgroundColor: 'var(--color-gold)', color: 'var(--color-green)' }
                : {}
            }
          >
            <Icon size={14} />
            {label}
          </Link>
        ))}
      </div>

      {/* Usuário logado */}
      {profile && (
        <Link
          to={profile.role === 'admin' ? '/admin' : '/profile'}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${['/admin', '/profile'].includes(location.pathname)
            ? ''
            : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
          style={
            ['/admin', '/profile'].includes(location.pathname)
              ? { backgroundColor: 'var(--color-gold)', color: 'var(--color-green)' }
              : {}
          }
        >
          {profile.role === 'admin' ? <Settings size={14} /> : <User size={14} />}
          <span>
            {profile.role === 'admin'
              ? 'Admin'
              : `@${profile.username ?? profile.name?.split(' ')[0]}`
            }
          </span>
        </Link>
      )}
    </nav>
  )
}
