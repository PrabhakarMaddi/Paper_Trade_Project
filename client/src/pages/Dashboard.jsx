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
            <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
            <p className="text-text-muted font-bold animate-pulse">Analyzing market positions...</p>
        </div>
    );

    const { summary, holdings } = data;

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl text-text-main uppercase">Dashboard</h1>
                    <p className="text-text-muted mt-2 font-medium">Welcome back! Here's your market performance today.</p>
                </div>
                <div className="bg-bg-card border border-border-main px-8 py-4 rounded-2xl flex items-center gap-6 shadow-sm shadow-indigo-50/10">
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-text-light tracking-[0.2em] mb-1">Net Worth</p>
                        <p className="text-3xl font-bold text-text-main">₹{summary.netWorth.toLocaleString('en-IN')}</p>
                    </div>
                    <div className={`p-4 rounded-xl shadow-inner ${summary.totalPnl >= 0 ? 'bg-accent-up/10 text-accent-up' : 'bg-accent-down/10 text-accent-down'}`}>
                        {summary.totalPnl >= 0 ? <ArrowUpRight size={28} /> : <ArrowDownRight size={28} />}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-card relative overflow-hidden group border-indigo-100">
                    <IndianRupee className="absolute -right-4 -bottom-4 text-primary/5 group-hover:text-primary/10 transition-colors" size={120} />
                    <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary/40"></span> Available Cash
                    </p>
                    <p className="text-4xl font-bold tracking-tight text-text-main">₹{summary.balance.toLocaleString('en-IN')}</p>
                </div>

                <div className="glass-card relative overflow-hidden group border-purple-100">
                    <Briefcase className="absolute -right-4 -bottom-4 text-purple-500/5 group-hover:text-purple-500/10 transition-colors" size={120} />
                    <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-400/40"></span> Portfolio Value
                    </p>
                    <p className="text-4xl font-bold tracking-tight text-text-main">₹{summary.totalCurrentValue.toLocaleString('en-IN')}</p>
                </div>

                <div className="glass-card relative overflow-hidden group border-emerald-100">
                    <Activity className="absolute -right-4 -bottom-4 text-accent-up/5 group-hover:text-accent-up/10 transition-colors" size={120} />
                    <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${summary.totalPnl >= 0 ? 'bg-accent-up' : 'bg-accent-down'}`}></span> Overall Return
                    </p>
                    <p className={`text-4xl font-bold tracking-tight ${summary.totalPnl >= 0 ? 'text-accent-up' : 'text-accent-down'}`}>
                        {summary.totalPnl >= 0 ? '+' : ''}₹{summary.totalPnl.toLocaleString('en-IN')}
                    </p>
                    <div className={`flex items-center gap-2 mt-2 font-bold text-sm ${summary.totalPnl >= 0 ? 'text-accent-up' : 'text-accent-down'}`}>
                        {summary.totalPnl >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {summary.totalPnlPercent}%
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <div className="glass-card h-full p-10">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-2xl font-bold tracking-tight text-text-main">ACTIVE HOLDINGS</h2>
                            <button className="text-xs font-bold uppercase tracking-widest text-primary hover:underline transition-all">View Full Portfolio</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-text-light text-[11px] uppercase font-bold tracking-[0.2em] border-b border-border-main">
                                        <th className="pb-5">Stock Asset</th>
                                        <th className="pb-5">Quantity</th>
                                        <th className="pb-5 text-right">Market Price</th>
                                        <th className="pb-5 text-right">Total Returns</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light">
                                    {holdings.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="py-20 text-center text-text-muted font-medium">
                                                No active positions found. Explore the markets to start trading!
                                            </td>
                                        </tr>
                                    ) : (
                                        holdings.slice(0, 5).map((h) => (
                                            <tr key={h.stockSymbol} className="group hover:bg-bg-main transition-colors">
                                                <td className="py-6">
                                                    <div className="flex flex-col">
                                                        <span className="symbol-badge w-fit mb-1.5 bg-primary-light text-primary border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">{h.stockSymbol}</span>
                                                        <span className="text-xs font-bold text-text-muted transition-colors">{h.stockName}</span>
                                                    </div>
                                                </td>
                                                <td className="py-6 font-bold text-text-main">{h.quantity}</td>
                                                <td className="py-6 text-right font-bold text-text-main text-lg">₹{h.currentPrice.toLocaleString('en-IN')}</td>
                                                <td className={`py-6 text-right font-bold text-lg ${h.pnl >= 0 ? 'text-accent-up' : 'text-accent-down'}`}>
                                                    <div className="flex items-center justify-end gap-1">
                                                        {h.pnl >= 0 ? '+' : ''}₹{h.pnl.toLocaleString('en-IN')}
                                                    </div>
                                                    <div className="text-[11px] font-bold opacity-70">({h.pnlPercent}%)</div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="glass-card bg-primary/5 border-primary/10 relative overflow-hidden p-8 shadow-indigo-50">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-3 text-text-main">
                            <Activity className="text-primary" size={20} /> MARKET INSIGHT
                        </h3>
                        <p className="text-sm text-text-muted font-medium leading-relaxed">
                            Markets are showing strong momentum in the **infrastructure** sector. Consider reviewing your positions in **Larsen & Toubro** or **NTPC**.
                        </p>
                        <button className="btn-primary w-full mt-6 py-3 text-sm">
                            Research Sector
                        </button>
                    </div>

                    <div className="glass-card border-border-main p-8">
                        <h3 className="text-lg font-bold tracking-tight mb-5 flex items-center gap-3 text-text-main uppercase">
                            <IndianRupee className="text-accent-up" size={20} /> Portfolio Health
                        </h3>
                        <div className="space-y-5">
                            <div className="h-2.5 bg-border-light rounded-full overflow-hidden">
                                <div className="h-full bg-accent-up rounded-full shadow-lg shadow-emerald-200" style={{ width: '78%' }}></div>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-text-light">Diversification Score</p>
                                <p className="text-sm font-bold text-accent-up">78%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
