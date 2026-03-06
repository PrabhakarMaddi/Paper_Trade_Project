import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    TrendingUp,
    Wallet,
    History,
    Trophy,
    LogOut,
    TrendingDown,
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
        <div className="sidebar">
            <div className="logo-container">
                <LineChart className="text-accent" size={32} />
                <span className="logo-text">Paper Bull</span>
            </div>

            <nav className="nav-list">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="user-section">
                <div className="user-info">
                    <p className="user-name">{user?.name}</p>
                    <p className="user-balance">${user?.balance?.toLocaleString()}</p>
                </div>
                <button onClick={logout} className="logout-btn">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
