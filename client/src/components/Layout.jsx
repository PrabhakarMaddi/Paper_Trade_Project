import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Layout = () => {
    const { dark, toggleTheme } = useTheme();

    return (
        <div className="layout-container">
            <Sidebar />
            <main className="main-content">
                <header className="top-header">
                    <div className="header-search">
                        {/* Placeholder for global search or page title */}
                    </div>
                    <button onClick={toggleTheme} className="theme-toggle">
                        {dark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </header>
                <div className="page-wrapper">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
