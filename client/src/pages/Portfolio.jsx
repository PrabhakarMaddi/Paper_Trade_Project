import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { TrendingUp, TrendingDown, Info, Briefcase, IndianRupee, PieChart as PieChartIcon } from 'lucide-react';

const Portfolio = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            const { data } = await axios.get('/portfolio');
            setData(data);
        } catch (error) {
            console.error('Error fetching portfolio');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium tracking-widest animate-pulse">VALUATING PORTFOLIO...</p>
        </div>
    );

    const { holdings, summary } = data;

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-2">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter sm:text-5xl italic">Holdings Portfolio</h1>
                    <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-[0.3em]">Institutional Grade Assets</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Portfolio Valuation</p>
                    <p className="text-5xl font-black text-primary tracking-tighter italic italic">₹{summary.netWorth.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Capital Invested', value: summary.totalInvested, icon: <Briefcase size={16} /> },
                    { label: 'Current Market Value', value: summary.totalCurrentValue, icon: <IndianRupee size={16} /> },
                    { label: 'Realized/Unrealized P&L', value: summary.totalPnl, icon: <TrendingUp size={16} />, status: true },
                    { label: 'Cumulative Yield %', value: summary.totalPnlPercent, icon: <PieChartIcon size={16} />, status: true, isPercent: true }
                ].map((stat, i) => (
                    <div key={i} className="glass-card group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/[0.02] rotate-12 -mr-10 -mt-10 transition-all group-hover:bg-primary/10"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 flex items-center gap-2">
                            {stat.icon} {stat.label}
                        </p>
                        <p className={`text-3xl font-black tracking-tighter italic ${stat.status ? (stat.value >= 0 ? 'text-accent' : 'text-accent-down') : 'text-white'
                            }`}>
                            {stat.status && stat.value >= 0 ? '+' : ''}
                            {stat.isPercent ? `${stat.value}%` : `₹${stat.value.toLocaleString('en-IN')}`}
                        </p>
                    </div>
                ))}
            </div>

            <div className="glass-card p-0 overflow-hidden border border-white/5">
                <div className="bg-white/[0.02] px-8 py-5 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-black italic tracking-tight">Active Positions</h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{holdings.length} Positions</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5 bg-white/[0.01]">
                                <th className="px-8 py-4">Asset Identification</th>
                                <th className="px-8 py-4">Position Size</th>
                                <th className="px-8 py-4 text-right">Acquisition</th>
                                <th className="px-8 py-4 text-right">Current LTP</th>
                                <th className="px-8 py-4 text-right">Mark-to-Market (MTM)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {holdings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-slate-500 font-bold italic">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <TrendingUp size={64} />
                                            <div>
                                                <p className="text-xl">Zero Exposure Detected</p>
                                                <p className="text-sm mt-1">Initiate trades to populate your matrix</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                holdings.map((h) => (
                                    <tr key={h.stockSymbol} className="group hover:bg-white/[0.03] transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="symbol-badge w-fit mb-1 bg-white/5 text-white border-white/10 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                                                    {h.stockSymbol}.NSE
                                                </span>
                                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest line-clamp-1">{h.stockName}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-black text-lg italic text-white">{h.quantity}</span>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">Shares</p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="font-black italic text-slate-300">₹{h.avgPrice.toLocaleString('en-IN')}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="font-black italic text-white text-lg">₹{h.currentPrice.toLocaleString('en-IN')}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className={`font-black italic text-xl ${h.pnl >= 0 ? 'text-accent' : 'text-accent-down'}`}>
                                                {h.pnl >= 0 ? '+' : ''}₹{h.pnl.toLocaleString('en-IN')}
                                            </div>
                                            <div className={`text-[10px] font-black ${h.pnl >= 0 ? 'text-accent/60' : 'text-accent-down/60'}`}>
                                                {h.pnlPercent}% Return
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Portfolio;
