import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Search, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, IndianRupee } from 'lucide-react';
import { toast } from 'react-hot-toast';
import StockChart from '../components/StockChart';

const Trade = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);
    const [quote, setQuote] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

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

    const handleSelect = async (symbol) => {
        setQuery('');
        setResults([]);
        setIsLoading(true);
        try {
            const { data } = await axios.get(`/stock/quote/${symbol}`);
            setQuote(data);
            setSelectedStock(symbol);
        } catch (error) {
            toast.error('Could not fetch stock data');
        } finally {
            setIsLoading(false);
        }
    };

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
        <div className="space-y-10">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl text-text-main uppercase">Market Execution</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    {/* Search Box */}
                    <div className="bg-white border-2 border-primary/20 rounded-2xl shadow-lg shadow-indigo-100/50 overflow-hidden focus-within:border-primary transition-all">
                        <div className="flex items-center p-6 gap-5">
                            <Search className="text-primary" size={28} />
                            <input
                                type="text"
                                placeholder="Search NIFTY 50 Stocks (e.g. RELIANCE, TCS, INFY)..."
                                className="bg-transparent border-none outline-none text-xl font-bold w-full text-text-main placeholder:text-text-light"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        {results.length > 0 && (
                            <div className="border-t border-border-main divide-y divide-border-light bg-slate-50/50">
                                {results.map((r) => (
                                    <div
                                        key={r.symbol}
                                        className="p-6 hover:bg-white cursor-pointer flex justify-between items-center group transition-all"
                                        onClick={() => handleSelect(r.symbol)}
                                    >
                                        <div>
                                            <span className="font-bold text-xl text-primary group-hover:underline tracking-tight">{r.symbol}</span>
                                            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-0.5">{r.name}</p>
                                        </div>
                                        <div className="text-right flex items-center gap-3">
                                            <span className="font-bold text-lg text-text-main">₹{r.price.toLocaleString('en-IN')}</span>
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
                            <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-border-main pb-10 mb-10">
                                <div>
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-3xl font-bold tracking-tight text-text-main uppercase">{quote.name}</h2>
                                        <span className="symbol-badge bg-primary-light text-primary border-primary/20 uppercase">{quote.symbol}</span>
                                    </div>
                                    <div className="flex items-center gap-6 mt-6">
                                        <span className="text-5xl font-bold tracking-tighter text-text-main">₹{quote.price.toLocaleString('en-IN')}</span>
                                        <div className={`flex items-center gap-2 font-bold text-xl ${quote.change >= 0 ? 'text-accent-up' : 'text-accent-down'}`}>
                                            {quote.change >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                                            {quote.change.toFixed(2)} ({quote.changePercent})
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-right max-md:text-left bg-slate-50 p-6 rounded-2xl border border-border-main">
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
                        <div className="glass-card h-[450px] flex flex-col items-center justify-center text-center bg-slate-50/50 border-dashed border-2 border-slate-200 shadow-none">
                            <div className="w-24 h-24 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                                <Activity size={48} className="text-primary/30" />
                            </div>
                            <p className="text-2xl font-bold tracking-tight text-text-muted">Select an asset to analyze</p>
                            <p className="text-sm font-bold text-text-light uppercase mt-3 tracking-widest">Awaiting Command from Terminal...</p>
                        </div>
                    )}
                </div>

                {/* Action Panel */}
                <div className="space-y-8">
                    {selectedStock && quote ? (
                        <div className="glass-card sticky top-24 border-primary/20 animate-in fade-in slide-in-from-right-4 duration-500 p-8 shadow-indigo-100">
                            <h3 className="text-2xl font-bold tracking-tight mb-8 text-text-main uppercase">Execute Order</h3>
                            <div className="space-y-8">
                                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-border-main">
                                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Market Price</span>
                                    <span className="text-2xl font-bold text-primary">₹{quote.price.toLocaleString('en-IN')}</span>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-text-light ml-1">Order Quantity</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            className="form-input text-3xl font-bold py-6 bg-white border-2 border-border-main focus:border-primary h-24 text-center rounded-2xl"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex justify-between px-1">
                                        {[1, 5, 10, 50, 100].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => setQuantity(val)}
                                                className="px-3 py-1.5 bg-slate-100 hover:bg-primary-light hover:text-primary rounded-lg text-xs font-bold text-text-muted transition-all"
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
                                    <button
                                        onClick={() => executeTrade('BUY')}
                                        className="btn-primary py-5 text-xl font-bold uppercase tracking-tight flex items-center justify-center gap-3 shadow-indigo-200"
                                        disabled={isLoading}
                                    >
                                        <TrendingUp size={24} />
                                        Buy Asset
                                    </button>
                                    <button
                                        onClick={() => executeTrade('SELL')}
                                        className="btn-outline py-5 text-xl font-bold uppercase tracking-tight flex items-center justify-center gap-3 border-accent-down text-accent-down hover:bg-accent-down/5"
                                        disabled={isLoading}
                                    >
                                        <TrendingDown size={24} />
                                        Sell Asset
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card bg-indigo-50/50 border-primary/10 p-10 shadow-none">
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
                                    <div className="h-1.5 bg-slate-200 rounded-full">
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
