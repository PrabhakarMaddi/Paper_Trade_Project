import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

const Layout = () => {
    const { dark, toggleTheme } = useTheme();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex min-h-screen bg-bg-main">
            <Sidebar />
            <main className="flex-1 ml-[260px] flex flex-col max-lg:ml-[80px]">
                <header className="h-16 border-b border-border-main flex items-center justify-between px-8 bg-bg-white/80 backdrop-blur-md sticky top-0 z-[90]">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-widest hidden sm:inline">Market Status</span>
                        <div className="w-2 h-2 rounded-full bg-accent-up animate-pulse"></div>
                        <span className="text-xs font-medium text-accent-up uppercase">Live</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-main border border-border-main text-text-muted text-sm font-medium">
                            <Clock size={16} />
                            {currentTime.toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true
                            }).toUpperCase()}
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-bg-main border border-border-main text-text-muted hover:text-primary hover:bg-primary-light transition-all"
                        >
                            {dark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </header>
                <div className="p-8 max-w-[1400px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
