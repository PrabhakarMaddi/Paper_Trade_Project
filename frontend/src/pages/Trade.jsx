import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, ShoppingCart, MinusCircle, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Trade() {
    const { user, updateBalance } = useAuth();
    const [symbol, setSymbol] = useState('');
    const [quote, setQuote] = useState(null);
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [searchResults, setSearchResults] = useState([]);

    const fetchQuote = async () => {
        if (!symbol.trim()) return;
        setSearchLoading(true);
        setMessage(null);
        setSearchResults([]);
        try {
            const { data } = await api.get(`/stocks/quote?symbol=${symbol.trim().toUpperCase()}`);
            setQuote(data);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Stock not found' });
            setQuote(null);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearch = async (q) => {
        setSymbol(q);
        if (q.length < 1) return setSearchResults([]);
        try {
            const { data } = await api.get(`/stocks/search?q=${q}`);
            setSearchResults(data.slice(0, 5));
        } catch { setSearchResults([]); }
    };

    const trade = async (type) => {
        if (!quote || qty < 1) return;
        setLoading(true);
        setMessage(null);
        try {
            const { data } = await api.post(`/trade/${type}`, { symbol: quote.symbol, quantity: qty });
            updateBalance(data.newBalance);
            setMessage({ type: 'success', text: data.message });
            setQty(1);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Trade failed' });
        } finally {
            setLoading(false);
        }
    };

    const total = quote ? (quote.price * qty).toFixed(2) : 0;
    const canAfford = user?.balance >= total;

    return (
        <div className="flex min-h-screen">
            <Navbar />
            <main className="flex-1 ml-64 p-8">
                <h1 className="text-2xl font-bold mb-2">Trade</h1>
                <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Search a stock and place buy or sell orders</p>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Search Panel */}
                    <div className="glass-card p-6">
                        <h2 className="font-semibold mb-4">Stock Lookup</h2>
                        <div className="flex gap-2 relative">
                            <div className="flex-1 relative">
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input className="input-dark" style={{ paddingLeft: '2.5rem' }} placeholder="Ticker symbol (e.g. AAPL)"
                                    value={symbol} onChange={e => handleSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && fetchQuote()} />
                                {searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 rounded-xl z-10 overflow-hidden"
                                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                        {searchResults.map(s => (
                                            <button key={s.symbol} className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                                                onClick={() => { setSymbol(s.symbol); setSearchResults([]); }}>
                                                <span className="font-semibold" style={{ color: 'var(--accent)' }}>{s.symbol}</span>
                                                <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>{s.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button className="btn-primary px-5" onClick={fetchQuote} disabled={searchLoading}>
                                {searchLoading ? '...' : 'Get Quote'}
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {quote && (
                                <motion.div key={quote.symbol} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="mt-5 p-4 rounded-xl" style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border)' }}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xl font-bold">{quote.symbol}</p>
                                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{quote.name}</p>
                                            {quote.isMock && <span className="text-xs px-2 py-0.5 rounded mt-1 inline-block" style={{ background: 'rgba(234,179,8,0.1)', color: '#eab308', border: '1px solid rgba(234,179,8,0.3)' }}>Mock Data</span>}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-bold">{fmt(quote.price)}</p>
                                            <p className={`font-semibold ${quote.change >= 0 ? 'text-profit' : 'text-loss'}`}>
                                                {quote.change >= 0 ? '+' : ''}{fmt(quote.change)} ({quote.changePercent?.toFixed(2)}%)
                                            </p>
                                        </div>
                                    </div>
                                    {quote.high && (
                                        <div className="grid grid-cols-3 gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                                            {[['Open', quote.open], ['High', quote.high], ['Low', quote.low]].map(([l, v]) => (
                                                <div key={l}>
                                                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-secondary)' }}>{l}</p>
                                                    <p className="text-sm font-medium">{fmt(v)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Order Panel */}
                    <div className="glass-card p-6">
                        <h2 className="font-semibold mb-4">Place Order</h2>

                        {message && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-3 rounded-lg text-sm flex items-center gap-2"
                                style={{
                                    background: message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                    border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                    color: message.type === 'success' ? '#10b981' : '#ef4444'
                                }}>
                                <AlertCircle size={14} />
                                {message.text}
                            </motion.div>
                        )}

                        <div className="mb-4">
                            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>Quantity</label>
                            <input className="input-dark" type="number" min={1} value={qty}
                                onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} />
                        </div>

                        {quote && (
                            <div className="p-4 rounded-xl mb-5" style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid var(--border)' }}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span style={{ color: 'var(--text-secondary)' }}>Price per share</span>
                                    <span className="font-medium">{fmt(quote.price)}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span style={{ color: 'var(--text-secondary)' }}>Quantity</span>
                                    <span className="font-medium">{qty}</span>
                                </div>
                                <div className="flex justify-between font-bold pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                                    <span>Total</span>
                                    <span style={{ color: canAfford ? 'var(--accent-green)' : 'var(--accent-red)' }}>{fmt(total)}</span>
                                </div>
                                {!canAfford && (
                                    <p className="text-xs mt-2 text-loss">Insufficient balance (have {fmt(user?.balance)})</p>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button className="btn-green flex-1 flex items-center justify-center gap-2" onClick={() => trade('buy')}
                                disabled={!quote || loading || !canAfford}>
                                <ShoppingCart size={16} /> {loading ? '...' : 'Buy'}
                            </button>
                            <button className="btn-red flex-1 flex items-center justify-center gap-2" onClick={() => trade('sell')}
                                disabled={!quote || loading}>
                                <MinusCircle size={16} /> {loading ? '...' : 'Sell'}
                            </button>
                        </div>

                        {!quote && (
                            <p className="text-center text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
                                Search for a stock to place an order
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
