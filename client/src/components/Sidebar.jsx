import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    TrendingUp,
    Wallet,
    History,
    Trophy,
    LogOut,
    LineChart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Trade', path: '/trade', icon: <TrendingUp size={20} /> },
        { name: 'Portfolio', path: '/portfolio', icon: <Wallet size={20} /> },
        { name: 'History', path: '/history', icon: <History size={20} /> },
        { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={20} /> },
    ];

    return (
        <div className="sidebar w-[260px] bg-bg-sidebar border-r border-white/5 flex flex-col fixed h-screen z-[100] transition-all duration-300 max-lg:w-[80px]">
            <div className="logo-container p-8 flex items-center gap-3 max-lg:justify-center">
                <LineChart className="text-accent" size={32} />
                <span className="logo-text text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent max-lg:hidden">Paper Bull</span>
            </div>

            <nav className="nav-list flex-1 px-4 flex flex-col gap-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
              ${isActive
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'}
              max-lg:justify-center
            `}
                    >
                        {item.icon}
                        <span className="max-lg:hidden">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="user-section p-6 border-t border-white/5">
                <div className="user-info mb-4 px-2 max-lg:hidden">
                    <p className="user-name font-semibold text-sm text-slate-300 truncate">{user?.name}</p>
                    <p className="user-balance text-accent font-bold text-lg">₹{user?.balance?.toLocaleString('en-IN')}</p>
                </div>
                <button
                    onClick={logout}
                    className="logout-btn w-full flex items-center gap-3 px-4 py-3 text-accent-down font-bold rounded-xl transition-all hover:bg-red-500/10 max-lg:justify-center"
                >
                    <LogOut size={20} />
                    <span className="max-lg:hidden">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
