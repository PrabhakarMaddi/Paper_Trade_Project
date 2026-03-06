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
            <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
            <p className="text-text-muted font-bold tracking-widest animate-pulse uppercase">Auditing Performance...</p>
        </div>
    );

    return (
        <div className="space-y-12">
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-bold tracking-tighter text-text-main uppercase italic">Elite Traders</h1>
                <p className="text-text-muted font-bold uppercase text-xs tracking-[0.4em]">Ranking the top 1% of the Indian Market</p>
            </div>

            {/* Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-end max-w-[1100px] mx-auto pb-12">
                {users.slice(0, 3).map((user, index) => {
                    const ranks = [
                        { pos: 1, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: <Trophy size={52} />, h: 'h-72', shadow: 'shadow-yellow-100' },
                        { pos: 2, color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200', icon: <Medal size={42} />, h: 'h-60', shadow: 'shadow-slate-100' },
                        { pos: 3, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', icon: <Award size={38} />, h: 'h-48', shadow: 'shadow-orange-100' }
                    ];
                    const r = index === 0 ? ranks[0] : (index === 1 ? ranks[1] : ranks[2]);
                    const order = index === 0 ? 'md:order-2' : (index === 1 ? 'md:order-1' : 'md:order-3');

                    return (
                        <div key={user.name} className={`flex flex-col items-center gap-5 ${order} group`}>
                            <div className={`p-5 rounded-2xl ${r.bg} ${r.color} mb-2 group-hover:scale-110 transition-transform shadow-sm`}>
                                {r.icon}
                            </div>
                            <div className={`${r.bg} ${r.border} border border-t-[6px] w-full rounded-3xl p-10 flex flex-col items-center gap-3 ${r.h} justify-center transition-all group-hover:shadow-xl ${r.shadow} border-t-current`}>
                                <p className="font-bold text-2xl text-text-main truncate w-full text-center uppercase tracking-tight">{user.name.split(' ')[0]}</p>
                                <p className={`text-3xl font-bold tracking-tighter ${user.totalReturn >= 0 ? 'text-accent-up' : 'text-accent-down'}`}>
                                    {user.totalReturn >= 0 ? '+' : ''}{user.returnPercent}%
                                </p>
                                <div className="text-[10px] font-bold text-text-light uppercase tracking-widest mt-1">ROI ARCHIEVED</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="glass-card p-0 overflow-hidden border border-border-main shadow-2xl max-w-[950px] mx-auto">
                <div className="bg-bg-main px-10 py-6 border-b border-border-main flex items-center justify-between">
                    <h3 className="font-bold text-lg tracking-tight text-text-main uppercase">Cumulative Rankings</h3>
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                        <Star className="text-yellow-500 fill-yellow-500" size={18} /> Market Leaders
                    </div>
                </div>
                <div className="divide-y divide-border-light">
                    {users.map((user, index) => (
                        <div key={user.name} className="px-10 py-7 flex items-center justify-between group hover:bg-bg-main transition-all">
                            <div className="flex items-center gap-10">
                                <span className={`w-10 font-bold text-3xl tracking-tighter ${index < 3 ? 'text-primary' : 'text-text-light'}`}>
                                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                                </span>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-border-light flex items-center justify-center font-bold text-primary border border-border-main uppercase">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl text-text-main tracking-tight uppercase">{user.name}</h4>
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-text-light mt-0.5 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-accent-up animate-pulse"></span> Portfolio Status: High Growth
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-16 text-right">
                                <div className="hidden lg:block">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-light mb-1">Valuation</p>
                                    <p className="font-bold text-text-main text-lg">₹{user.netWorth.toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-light mb-1">Performance</p>
                                    <div className={`flex items-center gap-2 font-bold text-2xl tracking-tighter ${user.totalReturn >= 0 ? 'text-accent-up' : 'text-accent-down'}`}>
                                        {user.totalReturn >= 0 ? <ArrowUpRight size={22} className="text-accent-up" /> : null}
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
