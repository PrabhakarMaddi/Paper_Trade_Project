import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { TrendingUp, TrendingDown, IndianRupee, Briefcase, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const { data } = await axios.get('/portfolio');
            setData(data);
        } catch (error) {
            console.error('Error fetching dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium animate-pulse">Fetching your market data...</p>
        </div>
    );

    const { summary, holdings } = data;

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter sm:text-5xl">Dashboard</h1>
                    <p className="text-slate-400 mt-2 font-medium">Welcome back! Here's your market performance today.</p>
                </div>
                <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4 backdrop-blur-sm">
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">Net Worth</p>
                        <p className="text-2xl font-black text-white">₹{summary.netWorth.toLocaleString('en-IN')}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${summary.totalPnl >= 0 ? 'bg-accent/20 text-accent' : 'bg-accent-down/20 text-accent-down'}`}>
                        {summary.totalPnl >= 0 ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card relative overflow-hidden group">
                    <IndianRupee className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-white/10 transition-colors" size={120} />
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> Available Cash
                    </p>
                    <p className="text-4xl font-black tracking-tight italic">₹{summary.balance.toLocaleString('en-IN')}</p>
                </div>

                <div className="glass-card relative overflow-hidden group">
                    <Briefcase className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-white/10 transition-colors" size={120} />
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span> Portfolio Value
                    </p>
                    <p className="text-4xl font-black tracking-tight italic">₹{summary.totalCurrentValue.toLocaleString('en-IN')}</p>
                </div>

                <div className="glass-card relative overflow-hidden group">
                    <Activity className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-white/10 transition-colors" size={120} />
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${summary.totalPnl >= 0 ? 'bg-accent' : 'bg-accent-down'}`}></span> Overall Return
                    </p>
                    <p className={`text-4xl font-black tracking-tight italic ${summary.totalPnl >= 0 ? 'text-accent' : 'text-accent-down'}`}>
                        {summary.totalPnl >= 0 ? '+' : ''}₹{summary.totalPnl.toLocaleString('en-IN')}
                    </p>
                    <div className={`flex items-center gap-2 mt-2 font-black text-sm ${summary.totalPnl >= 0 ? 'text-accent' : 'text-accent-down'}`}>
                        {summary.totalPnl >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {summary.totalPnlPercent}%
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="glass-card h-full">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black tracking-tight italic">Active Holdings</h2>
                            <button className="text-xs font-black uppercase tracking-widest text-primary hover:text-white transition-colors">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5">
                                        <th className="pb-4">Stock Asset</th>
                                        <th className="pb-4">Qty</th>
                                        <th className="pb-4 text-right">Market Price</th>
                                        <th className="pb-4 text-right">Total Returns</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {holdings.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="py-12 text-center text-slate-500 font-bold italic">
                                                No active positions. The market is waiting for you!
                                            </td>
                                        </tr>
                                    ) : (
                                        holdings.slice(0, 5).map((h) => (
                                            <tr key={h.stockSymbol} className="group hover:bg-white/[0.02] transition-colors">
                                                <td className="py-5">
                                                    <div className="flex flex-col">
                                                        <span className="symbol-badge w-fit mb-1 bg-primary/10 text-primary border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">{h.stockSymbol}</span>
                                                        <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">{h.stockName}</span>
                                                    </div>
                                                </td>
                                                <td className="py-5 font-black text-white">{h.quantity}</td>
                                                <td className="py-5 text-right font-black italic text-white text-lg">₹{h.currentPrice.toLocaleString('en-IN')}</td>
                                                <td className={`py-5 text-right font-black italic text-lg ${h.pnl >= 0 ? 'text-accent' : 'text-accent-down'}`}>
                                                    {h.pnl >= 0 ? '+' : ''}₹{h.pnl.toLocaleString('en-IN')}
                                                    <div className="text-[10px] font-black opacity-60">({h.pnlPercent}%)</div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card bg-primary/10 border-primary/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2">
                            <TrendingUp className="text-primary" size={20} /> Market Insight
                        </h3>
                        <p className="text-sm text-slate-300 font-medium leading-relaxed">
                            Markets are showing strong momentum in the **infrastructure** sector. Consider reviewing your positions in **Larsen & Toubro** or **NTPC**.
                        </p>
                        <button className="mt-6 w-full py-3 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all">
                            Research Sector
                        </button>
                    </div>

                    <div className="glass-card border-accent/10">
                        <h3 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2 text-accent">
                            <IndianRupee size={20} /> Portfolio Health
                        </h3>
                        <div className="space-y-4">
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-accent rounded-full w-[70%]"></div>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Diversification Score: 78%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
