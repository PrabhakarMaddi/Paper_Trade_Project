import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, LayoutDashboard, ArrowLeftRight, Clock, Trophy, LogOut, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/trade', icon: ArrowLeftRight, label: 'Trade' },
    { to: '/history', icon: Clock, label: 'History' },
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <motion.aside initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="fixed left-0 top-0 h-screen w-64 flex flex-col z-40"
            style={{ background: 'rgba(10,14,26,0.95)', borderRight: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}>

            {/* Logo */}
            <div className="p-6 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    <TrendingUp size={18} color="white" />
                </div>
                <div>
                    <p className="font-bold text-base gradient-text">Paper Bull</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Paper Trading</p>
                </div>
            </div>

            {/* Balance chip */}
            <div className="mx-4 mt-4 p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div className="flex items-center gap-2 mb-1">
                    <DollarSign size={14} style={{ color: 'var(--accent)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Cash Balance</span>
                </div>
                <p className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                    ${user?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>@{user?.username}</p>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink key={to} to={to} className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                            ? 'text-white'
                            : 'hover:bg-white/5'
                        }`
                    } style={({ isActive }) => isActive ? { background: 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.2))', color: 'white', border: '1px solid rgba(99,102,241,0.3)' } : { color: 'var(--text-secondary)', border: '1px solid transparent' }}>
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-red-500/10"
                    style={{ color: '#ef4444' }}>
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </motion.aside>
    );
}
