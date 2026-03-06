import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart2, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function StatCard({ icon: Icon, label, value, sub, color }) {
    return (
        <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}22` }}>
                    <Icon size={16} style={{ color }} />
                </div>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
        </div>
    );
}

export default function Dashboard() {
    const { user, updateBalance } = useAuth();
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [trending, setTrending] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pRes, tRes] = await Promise.all([
                api.get('/portfolio'),
                api.get('/stocks/trending'),
            ]);
            setPortfolio(pRes.data);
            setTrending(tRes.data);
            updateBalance(pRes.data.balance);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const chartData = portfolio?.holdings?.map((h, i) => ({
        name: h.symbol,
        value: h.currentValue,
    })) || [];

    return (
        <div className="flex min-h-screen">
            <Navbar />
            <main className="flex-1 ml-64 p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Welcome back, <span style={{ color: 'var(--accent)' }}>@{user?.username}</span></p>
                    </div>
                    <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/5"
                        style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={DollarSign} label="Cash Balance" value={fmt(portfolio?.balance ?? user?.balance ?? 0)} color="var(--accent)" />
                    <StatCard icon={PieChart} label="Invested Value" value={fmt(portfolio?.totalCurrentValue ?? 0)} color="#8b5cf6" />
                    <StatCard icon={BarChart2} label="Total Portfolio" value={fmt(portfolio?.totalPortfolioValue ?? 0)} color="#06b6d4" />
                    <StatCard
                        icon={portfolio?.totalPnl >= 0 ? TrendingUp : TrendingDown}
                        label="Total P&L"
                        value={fmt(portfolio?.totalPnl ?? 0)}
                        sub={`${portfolio?.totalPnl >= 0 ? '+' : ''}${((portfolio?.totalPnl ?? 0) / 100000 * 100).toFixed(2)}% from start`}
                        color={portfolio?.totalPnl >= 0 ? '#10b981' : '#ef4444'}
                    />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                    {/* Holdings table */}
                    <div className="glass-card p-5 xl:col-span-3">
                        <h2 className="font-semibold mb-4 flex items-center gap-2"><PieChart size={16} style={{ color: 'var(--accent)' }} /> Holdings</h2>
                        {loading ? (
                            <div className="flex flex-col gap-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-12 w-full" />)}</div>
                        ) : portfolio?.holdings?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ color: 'var(--text-secondary)' }}>
                                            {['Symbol', 'Qty', 'Avg Buy', 'Current', 'Value', 'P&L'].map(h => <th key={h} className="text-left pb-3 pr-4 font-medium">{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {portfolio.holdings.map((h, i) => (
                                            <motion.tr key={h.symbol} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                                className="border-t" style={{ borderColor: 'var(--border)' }}>
                                                <td className="py-3 pr-4">
                                                    <span className="font-bold" style={{ color: 'var(--accent)' }}>{h.symbol}</span>
                                                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{h.companyName}</p>
                                                </td>
                                                <td className="py-3 pr-4">{h.quantity}</td>
                                                <td className="py-3 pr-4">{fmt(h.avgBuyPrice)}</td>
                                                <td className="py-3 pr-4">{fmt(h.currentPrice)}</td>
                                                <td className="py-3 pr-4 font-medium">{fmt(h.currentValue)}</td>
                                                <td className={`py-3 font-semibold ${h.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                                                    {h.pnl >= 0 ? '+' : ''}{fmt(h.pnl)}<br />
                                                    <span className="text-xs">({h.pnlPercent >= 0 ? '+' : ''}{h.pnlPercent}%)</span>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
                                <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
                                <p>No holdings yet. Start trading!</p>
                            </div>
                        )}
                    </div>

                    {/* Trending stocks */}
                    <div className="glass-card p-5 xl:col-span-2">
                        <h2 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp size={16} style={{ color: 'var(--accent)' }} /> Trending</h2>
                        <div className="flex flex-col gap-3">
                            {trending.slice(0, 7).map((s) => (
                                <div key={s.symbol} className="flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-white/5">
                                    <div>
                                        <p className="font-semibold text-sm">{s.symbol}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-sm">{fmt(s.price)}</p>
                                        <p className={`text-xs font-medium ${s.change >= 0 ? 'text-profit' : 'text-loss'}`}>
                                            {s.change >= 0 ? '+' : ''}{s.changePercent?.toFixed(2)}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
