import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { TrendingUp, TrendingDown, IndianRupee, Briefcase, Activity, ArrowUpRight, ArrowDownRight, Trash2, Search, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [watchlistData, setWatchlistData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search state
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Insight state
    const [insight, setInsight] = useState({ text: 'Analyzing market trends...', symbol: null });
    const [insightLoading, setInsightLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
        const interval = setInterval(fetchDashboard, 10000); // 10 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (query.length > 1) {
            const timer = setTimeout(searchStocks, 300);
            return () => clearTimeout(timer);
        } else {
            setResults([]);
        }
    }, [query]);

    const searchStocks = async () => {
        try {
            const { data } = await axios.get(`/stock/search/${query}`);
            setResults(data);
        } catch (error) { }
    };

    const addToWatchlist = async (symbol) => {
        try {
            setIsSearching(true);
            await axios.post('/user/watchlist', { symbol });
            toast.success(`${symbol} added to watchlist`);
            setQuery('');
            setResults([]);
            fetchDashboard(); // Refresh
        } catch (error) {
            toast.error('Could not add to watchlist');
        } finally {
            setIsSearching(false);
        }
    };

    const fetchDashboard = async () => {
        try {
            const [portfolioRes, watchlistRes, moversRes] = await Promise.all([
                axios.get('/portfolio'),
                axios.get('/user/watchlist'),
                axios.get('/stock/top-movers').catch(() => ({ data: { gainers: [], losers: [] } }))
            ]);
            setData(portfolioRes.data || {});

            // Ensure watchlist is always an array to prevent .map crashes
            setWatchlistData(
                watchlistRes.data?.watchlist ||
                watchlistRes.data ||
                []
            );

            // Generate Insight
            generateInsight(moversRes.data);

        } catch (error) {
            console.error('Error fetching dashboard', error);
            setData(null);
            setWatchlistData([]);
        } finally {
            setLoading(false);
            setInsightLoading(false);
        }
    };

    const generateInsight = (movers) => {
        if (!movers || (!movers.gainers?.length && !movers.losers?.length)) {
            setInsight({ text: 'Market is currently flat. Hold positions and monitor.', symbol: null });
            return;
        }

        const topGainer = movers.gainers[0];
        const topLoser = movers.losers[0];

        if (topGainer && topGainer.rawChangePercent > 2) {
             setInsight({ 
                 text: `Markets are showing strong momentum. Consider reviewing **${topGainer.name}** (${topGainer.symbol}) which is up by ${topGainer.changePercent}.`,
                 symbol: topGainer.symbol
             });
        } else if (topLoser && topLoser.rawChangePercent < -2) {
             setInsight({
                 text: `Market is facing downward pressure. **${topLoser.name}** (${topLoser.symbol}) has dropped by ${topLoser.changePercent}. Keep an eye on value opportunities.`,
                 symbol: topLoser.symbol
             });
        } else if (topGainer) {
             setInsight({
                 text: `Market volatility is low. **${topGainer.name}** (${topGainer.symbol}) is currently leading with modest gains of ${topGainer.changePercent}.`,
                 symbol: topGainer.symbol
             });
        } else {
             setInsight({ text: 'Keep monitoring your watchlist for sudden breakouts or breakdowns.', symbol: null });
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
            <p className="text-text-muted font-bold animate-pulse">Analyzing market positions...</p>
        </div>
    );

    const removeFromWatchlist = async (symbol) => {
        try {
            const { data } = await axios.delete(`/user/watchlist/${symbol}`);
            toast.success(`${symbol} removed from watchlist`);
            fetchDashboard(); // Refresh to get the latest quotes
        } catch (error) {
            console.error('Error removing from watchlist');
            toast.error('Could not remove from watchlist');
        }
    };

    const { summary } = data;

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
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
                            <h2 className="text-2xl font-bold tracking-tight text-text-main">YOUR WATCHLIST</h2>

                            {/* Advanced Search Bar */}
                            <div className="relative w-full sm:w-80 z-20">
                                <div className="flex items-center bg-bg-main border-2 border-primary/20 rounded-xl px-4 py-3 focus-within:border-primary transition-all shadow-sm">
                                    <Search className="text-primary mr-3" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search NIFTY 50 Stocks..."
                                        className="bg-transparent border-none outline-none text-sm w-full font-bold text-text-main placeholder:text-text-light"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                </div>

                                {/* Search Results Dropdown */}
                                {(results?.length || 0) > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-3 bg-bg-card border border-border-main rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
                                        <div className="divide-y divide-border-light">
                                            {results.map((r) => {
                                                const inWatchlist = watchlistData?.some(w => w.symbol === r.symbol);
                                                return (
                                                    <div
                                                        key={r.symbol}
                                                        className="p-4 hover:bg-bg-main flex justify-between items-center transition-colors group cursor-pointer"
                                                        onClick={() => !inWatchlist && addToWatchlist(r.symbol)}
                                                    >
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-sm font-bold text-primary group-hover:underline tracking-tight">{r.symbol}</span>
                                                                {r.exchange && r.exchange !== 'Unknown' && (
                                                                    <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-border-light text-text-muted border border-border-main">
                                                                        {r.exchange}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider opacity-80 truncate max-w-[140px]">{r.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-bold text-sm text-text-main">
                                                                {r.price > 0 ? `₹${r.price.toLocaleString('en-IN')}` : ''}
                                                            </span>
                                                            <button
                                                                disabled={inWatchlist || isSearching}
                                                                className={`p-2 rounded-lg transition-all ${inWatchlist ? 'bg-primary/10 text-primary cursor-default' : 'bg-primary text-white hover:bg-primary/90 opacity-0 md:group-hover:opacity-100 shadow-md'}`}
                                                            >
                                                                {inWatchlist ? <TrendingUp size={14} /> : <Plus size={14} />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-text-light text-[11px] uppercase font-bold tracking-[0.2em] border-b border-border-main">
                                        <th className="pb-5">Stock Asset</th>
                                        <th className="pb-5 text-right">Market Price</th>
                                        <th className="pb-5 text-right">Day Change</th>
                                        <th className="pb-5 text-right w-16">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light">
                                    {watchlistData.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="py-20 text-center text-text-muted font-medium">
                                                Your watchlist is empty. Add stocks from the Trade page.
                                            </td>
                                        </tr>
                                    ) : (
                                        watchlistData.map((w) => (
                                            <tr
                                                key={w.symbol}
                                                onClick={() => navigate(`/trade?symbol=${w.symbol}`)}
                                                className="group hover:bg-bg-card transition-colors cursor-pointer"
                                            >
                                                <td className="py-6">
                                                    <div className="flex flex-col">
                                                        <span className="symbol-badge w-fit mb-1.5 bg-primary-light text-primary border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">{w.symbol}</span>
                                                        <span className="text-xs font-bold text-text-muted transition-colors line-clamp-1">{w.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-6 text-right font-bold text-text-main text-lg">
                                                    ₹{w.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className={`py-6 text-right font-bold text-lg ${w.change >= 0 ? 'text-accent-up' : 'text-accent-down'}`}>
                                                    <div className="flex items-center justify-end gap-1">
                                                        {w.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                        {w.change >= 0 ? '+' : ''}{w.change.toFixed(2)}
                                                    </div>
                                                    <div className="text-[11px] font-bold opacity-70">({w.changePercent})</div>
                                                </td>
                                                <td className="py-6 text-right">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeFromWatchlist(w.symbol);
                                                        }}
                                                        className="p-2 text-text-light hover:text-accent-down hover:bg-accent-down/10 rounded-xl transition-all"
                                                        title="Remove from watchlist"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
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
                        {insightLoading ? (
                            <div className="flex justify-center items-center h-20">
                                <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-text-muted font-medium leading-relaxed">
                                    {insight.text.split('**').map((part, i) => 
                                        i % 2 === 1 ? <strong key={i} className="text-text-main">{part}</strong> : part
                                    )}
                                </p>
                                <button 
                                    className="btn-primary w-full mt-6 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!insight.symbol}
                                    onClick={() => insight.symbol && navigate(`/trade?symbol=${insight.symbol}`)}
                                >
                                    {insight.symbol ? `Trade ${insight.symbol}` : 'Market Flat'}
                                </button>
                            </>
                        )}
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
