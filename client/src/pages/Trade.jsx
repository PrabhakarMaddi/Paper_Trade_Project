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
            // Refresh to update balance - real implementation might use a context refresh
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Trade failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-10">
            <h1 className="text-4xl font-black tracking-tighter sm:text-5xl italic">Market Execution</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Search Box */}
                    <div className="glass-card p-0 overflow-hidden border-2 border-primary/10">
                        <div className="flex items-center p-6 gap-4 bg-white/[0.02]">
                            <Search className="text-primary animate-pulse" size={24} />
                            <input
                                type="text"
                                placeholder="Search NIFTY 50 Stocks (e.g. RELIANCE, TCS, INFY)..."
                                className="bg-transparent border-none outline-none text-xl font-bold w-full text-white placeholder:text-slate-600"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        {results.length > 0 && (
                            <div className="border-t border-white/5 divide-y divide-white/5">
                                {results.map((r) => (
                                    <div
                                        key={r.symbol}
                                        className="p-5 hover:bg-white/[0.05] cursor-pointer flex justify-between items-center group transition-all"
                                        onClick={() => handleSelect(r.symbol)}
                                    >
                                        <div>
                                            <span className="font-black text-xl text-primary group-hover:text-white transition-colors tracking-tight">{r.symbol}</span>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{r.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-black text-lg italic">₹{r.price.toLocaleString('en-IN')}</span>
                                            <ArrowUpRight className="inline-block ml-2 text-accent opacity-0 group-hover:opacity-100 transition-all" size={20} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Asset Visualization */}
                    {selectedStock && quote ? (
                        <div className="glass-card animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-white/5 pb-8 mb-8">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-3xl font-black italic tracking-tight">{quote.name}</h2>
                                        <span className="symbol-badge bg-primary text-white border-none">{quote.symbol}</span>
                                    </div>
                                    <div className="flex items-center gap-6 mt-4">
                                        <span className="text-5xl font-black tracking-tighter italic">₹{quote.price.toLocaleString('en-IN')}</span>
                                        <div className={`flex items-center gap-1 font-black text-xl italic ${quote.change >= 0 ? 'text-accent' : 'text-accent-down'}`}>
                                            {quote.change >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                                            {quote.change.toFixed(2)} ({quote.changePercent})
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-right max-md:text-left">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Prev Close</p>
                                        <p className="font-bold">₹{quote.previousClose.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Volume</p>
                                        <p className="font-bold">{(quote.volume / 100000).toFixed(2)}L</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Day High</p>
                                        <p className="font-bold text-accent">₹{quote.high.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Day Low</p>
                                        <p className="font-bold text-accent-down">₹{quote.low.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>
                            <StockChart symbol={selectedStock} />
                        </div>
                    ) : (
                        <div className="glass-card h-[400px] flex flex-col items-center justify-center text-center opacity-40">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                <TrendingUp size={48} className="text-slate-500" />
                            </div>
                            <p className="text-xl font-black italic tracking-tight">Select an asset to analyze</p>
                            <p className="text-sm font-bold text-slate-500 uppercase mt-2 tracking-widest">Awaiting Command...</p>
                        </div>
                    )}
                </div>

                {/* Action Panel */}
                <div className="space-y-6">
                    {selectedStock && quote ? (
                        <div className="glass-card sticky top-24 border-2 border-primary/10 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-2xl font-black italic tracking-tight mb-8">Execute Order</h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Market Value</span>
                                    <span className="text-2xl font-black italic text-primary">₹{quote.price.toLocaleString('en-IN')}</span>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 italic">Order Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="form-input text-2xl font-black italic py-4 bg-white/[0.02] border-2 border-white/5 focus:border-primary/40 h-20 text-center"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                    />
                                    <div className="flex justify-between px-2">
                                        {[1, 5, 10, 50].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => setQuantity(val)}
                                                className="text-[10px] font-black text-slate-500 hover:text-white transition-colors"
                                            >
                                                {val}x
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 italic">Margin Required</span>
                                        <span className="text-2xl font-black italic text-white tracking-tighter">₹{(quote.price * quantity).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 pt-4">
                                    <button
                                        onClick={() => executeTrade('BUY')}
                                        className="btn-accent py-5 text-xl font-black uppercase italic tracking-tighter flex items-center justify-center gap-3 group"
                                        disabled={isLoading}
                                    >
                                        <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={24} />
                                        Confirm Purchase
                                    </button>
                                    <button
                                        onClick={() => executeTrade('SELL')}
                                        className="btn-down py-5 text-xl font-black uppercase italic tracking-tighter flex items-center justify-center gap-3 group"
                                        disabled={isLoading}
                                    >
                                        <ArrowDownRight className="group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" size={24} />
                                        Exit Position
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card bg-primary/5 border-primary/10 p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary/20 rounded-lg">
                                    <IndianRupee className="text-primary" size={20} />
                                </div>
                                <h3 className="font-black italic">Capital Efficiency</h3>
                            </div>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                Utilize your **₹10,00,000** virtual capital to build a diversified portfolio. High-liquidity stocks like **Reliance** and **TCS** offer steady growth.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Trade;
