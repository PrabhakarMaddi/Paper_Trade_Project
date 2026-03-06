import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Layout = () => {
    const { dark, toggleTheme } = useTheme();

    return (
        <div className="flex min-h-screen bg-bg-dark">
            <Sidebar />
            <main className="flex-1 ml-[260px] flex flex-col max-lg:ml-[80px]">
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-bg-dark/80 backdrop-blur-md sticky top-0 z-[90]">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:inline">Market Status</span>
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                        <span className="text-xs font-medium text-accent uppercase">Live</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
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
