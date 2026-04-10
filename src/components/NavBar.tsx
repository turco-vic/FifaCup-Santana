import { Link } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Navbar() {
  return (
    <nav
      className="w-full border-b border-white/10 px-4 py-3 flex items-center justify-between"
      style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
    >
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo.png" alt="FifaCup Santana" className="h-10 w-10 object-contain" />
        <span className="font-bold text-sm hidden sm:inline" style={{ color: 'var(--color-gold)' }}>
          FifaCup <span className="text-white">Santana</span>
        </span>
      </Link>

      <Sidebar />
    </nav>
  )
}
