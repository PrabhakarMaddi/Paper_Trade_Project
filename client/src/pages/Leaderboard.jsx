import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Trophy, Medal, Star, ArrowUpRight, Award } from 'lucide-react';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const { data } = await axios.get('/leaderboard');
            setUsers(data);
        } catch (error) {
            console.error('Error fetching leaderboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-slate-400 font-black tracking-widest animate-pulse uppercase">Auditing Performance...</p>
        </div>
    );

    return (
        <div className="space-y-10">
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-black italic tracking-tighter">Elite Traders</h1>
                <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.4em]">Ranking the top 1% of the Indian Market</p>
            </div>

            {/* Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-[1000px] mx-auto pb-10">
                {users.slice(0, 3).map((user, index) => {
                    const ranks = [
                        { pos: 1, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', icon: <Trophy size={48} />, h: 'h-64' },
                        { pos: 2, color: 'text-slate-300', bg: 'bg-slate-300/10', border: 'border-slate-300/20', icon: <Medal size={40} />, h: 'h-52' },
                        { pos: 3, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', icon: <Award size={36} />, h: 'h-40' }
                    ];
                    const rankIdx = index === 0 ? 0 : (index === 1 ? 1 : 2);
                    const r = index === 0 ? ranks[0] : (index === 1 ? ranks[1] : ranks[2]);
                    // Re-order for visual podium: 2, 1, 3
                    const order = index === 0 ? 'md:order-2' : (index === 1 ? 'md:order-1' : 'md:order-3');

                    return (
                        <div key={user.name} className={`flex flex-col items-center gap-4 ${order} group`}>
                            <div className={`p-4 rounded-full ${r.bg} ${r.color} mb-2 group-hover:scale-110 transition-transform`}>
                                {r.icon}
                            </div>
                            <div className={`${r.bg} ${r.border} border-t-4 border-t-${r.color.split('-')[1]}-${r.color.split('-')[2]} w-full rounded-tr-3xl rounded-tl-3xl p-8 flex flex-col items-center gap-2 ${r.h} justify-center transition-all group-hover:brightness-125`}>
                                <p className="font-black text-xl italic text-white truncate w-full text-center">{user.name.split(' ')[0]}</p>
                                <p className={`text-2xl font-black italic ${user.totalReturn >= 0 ? 'text-accent' : 'text-accent-down'}`}>
                                    {user.totalReturn >= 0 ? '+' : ''}{user.returnPercent}%
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="glass-card p-0 overflow-hidden border border-white/5 shadow-2xl max-w-[900px] mx-auto">
                <div className="bg-white/[0.02] px-10 py-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-black italic text-lg tracking-tight">Cumulative Rankings</h3>
                    <Star className="text-yellow-500 animate-spin-slow" size={20} />
                </div>
                <div className="divide-y divide-white/5">
                    {users.map((user, index) => (
                        <div key={user.name} className="px-10 py-6 flex items-center justify-between group hover:bg-white/[0.03] transition-all">
                            <div className="flex items-center gap-8">
                                <span className={`w-8 font-black italic text-2xl ${index < 3 ? 'text-primary' : 'text-slate-600'}`}>
                                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                                </span>
                                <div>
                                    <h4 className="font-black text-lg italic text-white tracking-wide">{user.name}</h4>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Portfolio Status: Active</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-12 text-right">
                                <div className="hidden sm:block">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 italic">Net Worth</p>
                                    <p className="font-black italic text-white">₹{user.netWorth.toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 italic">Performance</p>
                                    <div className={`flex items-center gap-2 font-black italic text-xl ${user.totalReturn >= 0 ? 'text-accent' : 'text-accent-down'}`}>
                                        {user.totalReturn >= 0 ? <ArrowUpRight size={18} /> : null}
                                        {user.returnPercent}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
