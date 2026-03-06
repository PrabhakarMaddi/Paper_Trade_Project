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
            <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
            <p className="text-text-muted font-bold tracking-widest animate-pulse">EVALUATING PORTFOLIO...</p>
        </div>
    );

    const { holdings, summary } = data;

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-2">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl text-text-main uppercase">Holdings Portfolio</h1>
                    <p className="text-text-muted mt-2 font-bold uppercase text-[11px] tracking-[0.3em]">Institutional Grade Assets</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light mb-1">Portfolio Valuation</p>
                    <p className="text-5xl font-bold text-primary tracking-tighter italic">₹{summary.netWorth.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Total Capital Invested', value: summary.totalInvested, icon: <Briefcase size={18} />, color: 'primary' },
                    { label: 'Current Market Value', value: summary.totalCurrentValue, icon: <IndianRupee size={18} />, color: 'purple-500' },
                    { label: 'Realized/Unrealized P&L', value: summary.totalPnl, icon: <TrendingUp size={18} />, status: true },
                    { label: 'Cumulative Yield %', value: summary.totalPnlPercent, icon: <PieChartIcon size={18} />, status: true, isPercent: true }
                ].map((stat, i) => (
                    <div key={i} className="glass-card group overflow-hidden relative border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rotate-12 -mr-10 -mt-10 transition-all group-hover:bg-primary-light/50"></div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-3 flex items-center gap-2">
                            {stat.icon} {stat.label}
                        </p>
                        <p className={`text-3xl font-bold tracking-tighter ${stat.status ? (stat.value >= 0 ? 'text-accent-up' : 'text-accent-down') : 'text-text-main'}`}>
                            {stat.status && stat.value >= 0 ? '+' : ''}
                            {stat.isPercent ? `${stat.value}%` : `₹${stat.value.toLocaleString('en-IN')}`}
                        </p>
                    </div>
                ))}
            </div>

            <div className="glass-card p-0 overflow-hidden border border-border-main shadow-lg shadow-indigo-50/50">
                <div className="bg-slate-50 px-8 py-5 border-b border-border-main flex items-center justify-between">
                    <h3 className="font-bold text-text-main uppercase tracking-tight">Active Positions</h3>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted px-3 py-1 bg-white rounded-full border border-border-main">{holdings.length} Positions</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-text-light text-[11px] uppercase font-bold tracking-[0.2em] border-b border-border-main bg-slate-50/30">
                                <th className="px-8 py-5">Asset Identification</th>
                                <th className="px-8 py-5">Position Size</th>
                                <th className="px-8 py-5 text-right">Acquisition</th>
                                <th className="px-8 py-5 text-right">Current LTP</th>
                                <th className="px-8 py-5 text-right">Mark-to-Market (MTM)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light">
                            {holdings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-24 text-center text-text-muted font-bold">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
                                                <TrendingUp size={42} className="text-slate-200" />
                                            </div>
                                            <div>
                                                <p className="text-2xl text-text-main tracking-tight">Zero Exposure Detected</p>
                                                <p className="text-sm font-medium mt-1 uppercase tracking-widest text-text-light">Initiate trades to populate your matrix</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                holdings.map((h) => (
                                    <tr key={h.stockSymbol} className="group hover:bg-slate-50 transition-all">
                                        <td className="px-8 py-7">
                                            <div className="flex flex-col">
                                                <span className="symbol-badge w-fit mb-2 bg-primary-light text-primary border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                    {h.stockSymbol}.NSE
                                                </span>
                                                <span className="text-[11px] font-bold uppercase text-text-muted tracking-widest line-clamp-1">{h.stockName}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <span className="font-bold text-xl text-text-main italic">{h.quantity}</span>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-text-light mt-0.5">Quantity Held</p>
                                        </td>
                                        <td className="px-8 py-7 text-right">
                                            <span className="font-bold text-text-muted italic">₹{h.avgPrice.toLocaleString('en-IN')}</span>
                                        </td>
                                        <td className="px-8 py-7 text-right">
                                            <span className="font-bold text-text-main text-xl italic">₹{h.currentPrice.toLocaleString('en-IN')}</span>
                                        </td>
                                        <td className="px-8 py-7 text-right">
                                            <div className={`font-bold italic text-2xl ${h.pnl >= 0 ? 'text-accent-up' : 'text-accent-down'}`}>
                                                {h.pnl >= 0 ? '+' : ''}₹{h.pnl.toLocaleString('en-IN')}
                                            </div>
                                            <div className={`text-[11px] font-bold mt-0.5 ${h.pnl >= 0 ? 'text-accent-up' : 'text-accent-down'} opacity-70`}>
                                                {h.pnlPercent}% Portfolio Return
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
