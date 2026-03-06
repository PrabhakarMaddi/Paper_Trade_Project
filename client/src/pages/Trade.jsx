import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Search, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
            window.location.reload();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Trade failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <h1 className="text-3xl font-bold mb-8">Execute Trade</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card p-0 overflow-hidden">
                        <div className="flex items-center p-4 gap-4 bg-hover">
                            <Search className="text-secondary" size={20} />
                            <input
                                type="text"
                                placeholder="Search stocks by symbol or name..."
                                className="bg-transparent border-none outline-none text-lg w-full"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        {results.length > 0 && (
                            <div className="border-t border-border">
                                {results.map((r) => (
                                    <div
                                        key={r.symbol}
                                        className="p-4 hover:bg-hover cursor-pointer flex justify-between items-center"
                                        onClick={() => handleSelect(r.symbol)}
                                    >
                                        <div>
                                            <span className="font-bold text-accent mr-2">{r.symbol}</span>
                                            <span className="text-secondary">{r.name}</span>
                                        </div>
                                        <span className="font-semibold">${r.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedStock && quote && (
                        <div className="glass-card">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-bold">{quote.name}</h2>
                                        <span className="symbol-badge">{quote.symbol}</span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-4xl font-bold">${quote.price.toFixed(2)}</span>
                                        <div className={`flex items-center font-bold ${quote.change >= 0 ? 'text-accent' : 'text-accent-down'}`}>
                                            {quote.change >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                            {quote.change.toFixed(2)} ({quote.changePercent})
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right text-secondary text-sm">
                                    <p>Prev Close: ${quote.previousClose.toFixed(2)}</p>
                                    <p>Day High: ${quote.high.toFixed(2)}</p>
                                    <p>Day Low: ${quote.low.toFixed(2)}</p>
                                </div>
                            </div>
                            <StockChart symbol={selectedStock} />
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {selectedStock ? (
                        <div className="glass-card sticky top-24">
                            <h3 className="text-xl font-bold mb-6">Order Details</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-secondary">
                                    <span>Current Price</span>
                                    <span className="text-primary font-bold">${quote.price.toFixed(2)}</span>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="form-input"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                    />
                                </div>

                                <div className="border-t border-border pt-4 mt-4">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Estimated Total</span>
                                        <span>${(quote.price * quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <button onClick={() => executeTrade('BUY')} className="btn-accent py-3 flex items-center justify-center gap-2" disabled={isLoading}>
                                        <ArrowUpRight size={20} /> Buy
                                    </button>
                                    <button onClick={() => executeTrade('SELL')} className="btn-down py-3 flex items-center justify-center gap-2" disabled={isLoading}>
                                        <ArrowDownRight size={20} /> Sell
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card text-center py-12 text-secondary">
                            <TrendingUp size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Search and select a stock to start trading</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Trade;
