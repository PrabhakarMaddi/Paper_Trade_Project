import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const History = () => {
    const [trades, setTrades] = useState([]);
    const [pagination, setPagination] = useState({});
    const [page, setPage] = useState(1);
    const [type, setType] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, [page, type]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/trade/history?page=${page}&type=${type}`);
            setTrades(data.trades);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching history');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <h1 className="text-3xl font-bold mb-8">Transaction History</h1>

            <div className="glass-card mb-8 p-4">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setType(''); setPage(1); }}
                            className={`px-4 py-2 rounded-lg font-medium transition ${type === '' ? 'bg-primary text-white' : 'bg-glass text-secondary hover:text-primary'}`}
                        >
                            All Trades
                        </button>
                        <button
                            onClick={() => { setType('BUY'); setPage(1); }}
                            className={`px-4 py-2 rounded-lg font-medium transition ${type === 'BUY' ? 'bg-accent text-white' : 'bg-glass text-secondary hover:text-accent'}`}
                        >
                            Buys
                        </button>
                        <button
                            onClick={() => { setType('SELL'); setPage(1); }}
                            className={`px-4 py-2 rounded-lg font-medium transition ${type === 'SELL' ? 'bg-accent-down text-white' : 'bg-glass text-secondary hover:text-accent-down'}`}
                        >
                            Sells
                        </button>
                    </div>

                    <div className="text-sm text-secondary">
                        Showing {trades.length} of {pagination.total || 0} transactions
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Stock</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-8">Loading history...</td></tr>
                            ) : trades.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-8 text-secondary">No transactions found</td></tr>
                            ) : (
                                trades.map((t) => (
                                    <tr key={t._id}>
                                        <td className="text-sm text-secondary">
                                            {new Date(t.timestamp).toLocaleDateString()} <br />
                                            {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === 'BUY' ? 'bg-accent/10 text-accent' : 'bg-accent-down/10 text-accent-down'}`}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="font-bold">{t.stockSymbol}</span>
                                            <p className="text-xs text-secondary truncate max-w-[150px]">{t.stockName}</p>
                                        </td>
                                        <td>{t.quantity}</td>
                                        <td>${t.price.toFixed(2)}</td>
                                        <td className="font-semibold">${t.total.toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.pages > 1 && (
                    <div className="flex justify-center items-center gap-4 p-6 border-t border-border">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 rounded-full bg-glass hover:bg-hover disabled:opacity-30"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-medium">Page {page} of {pagination.pages}</span>
                        <button
                            disabled={page === pagination.pages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 rounded-full bg-glass hover:bg-hover disabled:opacity-30"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
