import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../api/axios';
import { Search, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, IndianRupee, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import StockChart from '../components/StockChart';
import { isMarketOpen } from '../utils/market';

const Trade = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);
    const [quote, setQuote] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();

    const [watchlistData, setWatchlistData] = useState([]);
    const [isInWatchlist, setIsInWatchlist] = useState(false);

    // New state for top movers
    const [topMovers, setTopMovers] = useState({ gainers: [], losers: [] });
    const [moverTab, setMoverTab] = useState('gainers');
    const [moversLoading, setMoversLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
        fetchTopMovers();
        const interval = setInterval(fetchTopMovers, 60000); // 1 min refresh for movers
        return () => clearInterval(interval);
    }, []);

    const fetchTopMovers = async () => {
        try {
            const { data } = await axios.get('/stock/top-movers');
            setTopMovers(data);
        } catch (error) {
            console.error('Error fetching top movers', error);
        } finally {
            setMoversLoading(false);
        }
    };

    const fetchUserData = async () => {
        try {
            const { data } = await axios.get('/user/watchlist');
            setWatchlistData(data);
        } catch (error) {
            console.error('Error fetching user data', error);
        }
    };

    useEffect(() => {
        if (selectedStock) {
            setIsInWatchlist(watchlistData.some(w => w.symbol === selectedStock));
        }
    }, [selectedStock, watchlistData]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const symbolParam = params.get('symbol');
        if (symbolParam && symbolParam !== selectedStock && !isLoading) {
            handleSelect(symbolParam);
        }
    }, [location.search]);

    const toggleWatchlist = async () => {
        if (!selectedStock) return;
        try {
            if (isInWatchlist) {
                await axios.delete(`/user/watchlist/${selectedStock}`);
            } else {
                await axios.post('/user/watchlist', { symbol: selectedStock });
            }
            await fetchUserData(); // Refresh to update button state
            toast.success(isInWatchlist ? 'Removed from watchlist' : 'Added to watchlist');
        } catch (error) {
            toast.error('Could not update watchlist');
        }
    };

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

    const fetchQuote = async (symbol) => {
        try {
            const { data } = await axios.get(`/stock/quote/${symbol}`);
            setQuote(data);
        } catch (error) {
            console.error('Error fetching quote');
        }
    };

    const handleSelect = async (symbol) => {
        setQuery('');
        setResults([]);
        setIsLoading(true);
        try {
            await fetchQuote(symbol);
            setSelectedStock(symbol);
        } catch (error) {
            toast.error('Could not fetch stock data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let interval;
        if (selectedStock && !isLoading) {
            interval = setInterval(() => {
                fetchQuote(selectedStock);
            }, 10000); // 10 seconds
        }
        return () => clearInterval(interval);
    }, [selectedStock, isLoading]);

    const executeTrade = async (type) => {
        if (quantity < 1) return toast.error('Quantity must be at least 1');
        setIsLoading(true);
        try {
            const endpoint = type === 'BUY' ? '/trade/buy' : '/trade/sell';
            const { data } = await axios.post(endpoint, {
                symbol: selectedStock,
                quantity: parseInt(quantity)
            });
            toast.success(data.message);
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Trade failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 md:y-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-text-main uppercase">Market Execution</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    {/* Search Box */}
                    <div className="bg-bg-card border-2 border-primary/20 rounded-2xl shadow-lg shadow-indigo-100/10 overflow-hidden focus-within:border-primary transition-all">
                        <div className="flex items-center p-6 gap-5">
                            <Search className="text-primary" size={28} />
                            <input
                                type="text"
                                placeholder="Search NIFTY 50 Stocks..."
                                className="bg-transparent border-none outline-none text-lg md:text-xl font-bold w-full text-text-main placeholder:text-text-light"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        {results.length > 0 && (
                            <div className="border-t border-border-main divide-y divide-border-light bg-bg-main/50">
                                {results.map((r) => (
                                    <div
                                        key={r.symbol}
                                        className="p-6 hover:bg-bg-card cursor-pointer flex justify-between items-center group transition-all"
                                        onClick={() => handleSelect(r.symbol)}
                                    >
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-xl text-primary group-hover:underline tracking-tight">{r.symbol}</span>
                                                {r.exchange && r.exchange !== 'Unknown' && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-border-light text-text-muted border border-border-main group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30 transition-colors">
                                                        {r.exchange}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1 opacity-80">{r.name}</p>
                                        </div>
                                        <div className="text-right flex items-center gap-3">
                                            <span className="font-bold text-lg text-text-main">
                                                {r.price > 0 ? `₹${r.price.toLocaleString('en-IN')}` : 'N/A'}
                                            </span>
                                            <ArrowUpRight className="text-primary opacity-0 group-hover:opacity-100 transition-all" size={20} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Asset Visualization */}
                    {selectedStock && quote ? (
                        <div className="glass-card p-10 animate-in fade-in slide-in-from-left-4 duration-500 shadow-indigo-50 border-indigo-100">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8 border-b border-border-main pb-8 md:pb-10 mb-8 md:mb-10">
                                <div>
                                    <div className="mb-2 md:mb-3">
                                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-main uppercase">{quote.name}</h2>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                        <span className="symbol-badge bg-primary-light text-primary border-primary/20 uppercase py-1 px-2 md:py-1.5 md:px-3 text-[10px] md:text-xs">{quote.symbol}</span>
                                        <button
                                            onClick={toggleWatchlist}
                                            className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[9px] md:text-[11px] font-bold uppercase tracking-widest transition-all border ${isInWatchlist
                                                ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 hover:bg-primary/90'
                                                : 'bg-bg-card hover:bg-primary/10 text-primary border-primary/30'
                                                }`}
                                        >
                                            {isInWatchlist ? '✓ IN WATCHLIST' : '+ WATCHLIST'}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4 md:gap-6 mt-4 md:mt-6">
                                        <span className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-text-main">₹{quote.price.toLocaleString('en-IN')}</span>
                                        <div className={`flex items-center gap-1 md:gap-2 font-bold text-lg md:text-xl ${quote.change >= 0 ? 'text-accent-up' : 'text-accent-down'}`}>
                                            {quote.change >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                            {quote.change.toFixed(2)} ({quote.changePercent})
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-x-6 md:gap-x-12 gap-y-3 text-right max-md:text-left bg-bg-main p-4 md:p-6 rounded-2xl border border-border-main w-full md:w-auto">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-light">Prev Close</p>
                                        <p className="font-bold text-text-main">₹{quote.previousClose.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-light">Volume</p>
                                        <p className="font-bold text-text-main">{(quote.volume / 100000).toFixed(2)}L</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-light">Day High</p>
                                        <p className="font-bold text-accent-up">₹{quote.high.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-light">Day Low</p>
                                        <p className="font-bold text-accent-down">₹{quote.low.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>
                            <StockChart symbol={selectedStock} />
                        </div>
                    ) : (
                        <div className="glass-card bg-bg-main/50 border-primary/10 shadow-none p-10 min-h-[450px]">
                            <div className="w-full">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-text-main uppercase flex items-center gap-3">
                                        <Activity className="text-primary" size={24} /> Market Movers
                                    </h3>

                                    <div className="flex bg-bg-card border border-border-main rounded-xl p-1 shadow-sm">
                                        <button
                                            onClick={() => setMoverTab('gainers')}
                                            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${moverTab === 'gainers'
                                                ? 'bg-accent-up/10 text-accent-up shadow-sm'
                                                : 'text-text-muted hover:text-text-main'
                                                }`}
                                        >
                                            Top Gainers
                                        </button>
                                        <button
                                            onClick={() => setMoverTab('losers')}
                                            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${moverTab === 'losers'
                                                ? 'bg-accent-down/10 text-accent-down shadow-sm'
                                                : 'text-text-muted hover:text-text-main'
                                                }`}
                                        >
                                            Top Losers
                                        </button>
                                    </div>
                                </div>

                                {moversLoading ? (
                                    <div className="py-20 flex justify-center">
                                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-left text-text-light text-[10px] md:text-[11px] uppercase font-bold tracking-[0.2em] border-b border-border-main">
                                                    <th className="pb-4">Stock Asset</th>
                                                    <th className="pb-4 text-right">Market Price</th>
                                                    <th className="pb-4 text-right hidden sm:table-cell">Change</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border-light">
                                                {topMovers[moverTab].map((m) => (
                                                    <tr
                                                        key={m.symbol}
                                                        className="group hover:bg-bg-card transition-colors cursor-pointer"
                                                        onClick={() => handleSelect(m.symbol)}
                                                    >
                                                        <td className="py-4">
                                                            <div className="flex flex-col">
                                                                <span className="symbol-badge w-fit mb-1 bg-primary-light text-primary border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">{m.symbol}</span>
                                                                <span className="text-xs font-bold text-text-muted line-clamp-1 opacity-80">{m.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 text-right font-bold text-text-main">
                                                            ₹{m.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className={`py-4 text-right font-bold ${moverTab === 'gainers' ? 'text-accent-up' : 'text-accent-down'} hidden sm:table-cell`}>
                                                            <div className="flex items-center justify-end gap-1">
                                                                {moverTab === 'gainers' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                                {moverTab === 'gainers' ? '+' : ''}{m.change.toFixed(2)}
                                                            </div>
                                                            <div className="text-[11px] font-bold opacity-70">({m.changePercent})</div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Panel */}
                <div className="space-y-8">
                    {selectedStock && quote ? (
                        <div className="glass-card sticky top-24 border-primary/20 animate-in fade-in slide-in-from-right-4 duration-500 p-6 md:p-8">
                            <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-6 md:mb-8 text-text-main uppercase">Execute Order</h3>
                            <div className="space-y-8">
                                <div className="flex justify-between items-center bg-bg-main p-4 rounded-xl border border-border-main">
                                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Market Price</span>
                                    <span className="text-2xl font-bold text-primary">₹{quote.price.toLocaleString('en-IN')}</span>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-text-light ml-1">Order Quantity</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            className="form-input text-2xl md:text-3xl font-bold py-4 md:py-6 bg-bg-card border-2 border-border-main focus:border-primary h-16 md:h-24 text-center rounded-2xl"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex justify-between px-1">
                                        {[1, 5, 10, 50, 100].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => setQuantity(val)}
                                                className="px-3 py-1.5 bg-bg-main hover:bg-primary-light hover:text-primary rounded-lg text-xs font-bold text-text-muted transition-all"
                                            >
                                                {val}x
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-primary-light/30 rounded-2xl p-6 border border-primary/10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold uppercase tracking-widest text-primary/70">Margin Required</span>
                                        <span className="text-2xl font-bold text-primary tracking-tighter">₹{(quote.price * quantity).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 pt-2">
                                    {!isMarketOpen() && (
                                        <div className="bg-accent-down/10 text-accent-down font-bold text-sm p-4 text-center rounded-xl border border-accent-down/20 mb-2">
                                            Market is closed. Trading hours are 9:15 AM to 3:30 PM (IST), Mon-Fri.
                                        </div>
                                    )}
                                    <button
                                        onClick={() => executeTrade('BUY')}
                                        className="btn-primary py-5 text-xl font-bold uppercase tracking-tight flex items-center justify-center gap-3 shadow-emerald-200/20 bg-emerald-500 hover:bg-emerald-600 border-emerald-400 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isLoading || !isMarketOpen()}
                                    >
                                        <TrendingUp size={24} />
                                        Buy Asset
                                    </button>
                                    <button
                                        onClick={() => executeTrade('SELL')}
                                        className="btn-outline py-5 text-xl font-bold uppercase tracking-tight flex items-center justify-center gap-3 border-accent-down text-accent-down hover:bg-accent-down/5 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isLoading || !isMarketOpen()}
                                    >
                                        <TrendingDown size={24} />
                                        Sell Asset
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card bg-bg-main/50 border-primary/10 p-10 shadow-none">
                            <div className="flex flex-col items-center text-center gap-6">
                                <div className="p-4 bg-primary/10 rounded-2xl">
                                    <IndianRupee className="text-primary" size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-text-main mb-3">Capital Strategy</h3>
                                    <p className="text-sm text-text-muted font-medium leading-relaxed">
                                        Use your **₹10,00,000** virtual capital to build a high-performing portfolio. Monitor market signals and execute trades with precision.
                                    </p>
                                </div>
                                <div className="w-full pt-4 space-y-3">
                                    <div className="flex justify-between text-xs font-bold text-text-light uppercase tracking-widest">
                                        <span>Risk Profile</span>
                                        <span className="text-primary">Balanced</span>
                                    </div>
                                    <div className="h-1.5 bg-border-main rounded-full">
                                        <div className="h-full bg-primary rounded-full w-[60%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Trade;
