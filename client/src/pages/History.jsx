import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react';

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
        <div className="space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl text-text-main uppercase">Execution Audit</h1>
                    <p className="text-text-muted mt-2 font-bold uppercase text-[11px] tracking-[0.3em]">Temporal Ledger of Trades</p>
                </div>
                <button className="flex items-center gap-3 px-8 py-4 rounded-xl bg-bg-card border border-border-main text-xs font-bold uppercase tracking-widest text-text-muted hover:text-primary hover:border-primary transition-all shadow-sm">
                    <Download size={18} /> Export Audit
                </button>
            </div>

            <div className="glass-card p-3 flex flex-wrap items-center justify-between gap-6 border border-border-main bg-bg-card shadow-sm shadow-indigo-50/10">
                <div className="flex gap-3 px-2">
                    {[
                        { label: 'Comprehensive', value: '', color: 'primary' },
                        { label: 'Purchase Assets', value: 'BUY', color: 'accent' },
                        { label: 'Divest Assets', value: 'SELL', color: 'accent-down' }
                    ].map(btn => (
                        <button
                            key={btn.value}
                            onClick={() => { setType(btn.value); setPage(1); }}
                            className={`px-8 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 shadow-sm
                ${type === btn.value
                                    ? `bg-primary text-white shadow-indigo-200`
                                    : 'text-text-light hover:text-primary hover:bg-primary-light'}`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

                <div className="px-8 text-[11px] font-bold uppercase tracking-[0.2em] text-text-light border-l border-border-main">
                    Found <span className="text-text-main font-bold">{pagination.total || 0}</span> Recorded Events
                </div>
            </div>

            <div className="glass-card p-0 overflow-hidden border border-border-main shadow-xl shadow-indigo-50/50">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-text-light text-[11px] uppercase font-bold tracking-[0.2em] border-b border-border-main bg-bg-main/50">
                                <th className="px-8 py-6">Timestamp</th>
                                <th className="px-8 py-6">Classification</th>
                                <th className="px-8 py-6">Asset Descriptor</th>
                                <th className="px-8 py-6">Quantity</th>
                                <th className="px-8 py-6 text-right">LTP Value</th>
                                <th className="px-8 py-6 text-right">Gross Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light">
                            {loading ? (
                                <tr><td colSpan="6" className="px-8 py-24 text-center animate-pulse font-bold  text-text-muted uppercase tracking-widest">Retrieving archival data...</td></tr>
                            ) : trades.length === 0 ? (
                                <tr><td colSpan="6" className="px-8 py-32 text-center text-text-muted font-bold tracking-tight">No records found for this sector.</td></tr>
                            ) : (
                                trades.map((t) => (
                                    <tr key={t._id} className="group hover:bg-bg-main transition-all">
                                        <td className="px-8 py-7 font-medium">
                                            <div className="text-text-main font-bold ">{new Date(t.timestamp).toLocaleDateString()}</div>
                                            <div className="text-[10px] font-bold uppercase text-text-light mt-1.5">{new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <span className={`px-4 py-2 rounded-lg text-[10px] font-bold tracking-[0.1em] uppercase 
                        ${t.type === 'BUY' ? 'bg-accent-up/10 text-accent-up border border-accent-up/20' : 'bg-accent-down/10 text-accent-down border border-accent-down/20'}`}>
                                                {t.type === 'BUY' ? 'Invest' : 'Divest'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-7">
                                            <span className="font-bold text-xl  text-text-main group-hover:text-primary transition-colors">{t.stockSymbol}</span>
                                            <p className="text-[10px] font-bold uppercase text-text-light truncate max-w-[150px]  mt-1">{t.stockName}</p>
                                        </td>
                                        <td className="px-8 py-7 font-bold  text-text-muted">{t.quantity}</td>
                                        <td className="px-8 py-7 text-right font-bold  text-text-main">₹{t.price.toLocaleString('en-IN')}</td>
                                        <td className="px-8 py-7 text-right">
                                            <span className="font-bold  text-lg text-text-main">₹{t.total.toLocaleString('en-IN')}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.pages > 1 && (
                    <div className="flex justify-center items-center gap-10 p-10 border-t border-border-main bg-bg-main/30">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-5 rounded-2xl bg-bg-card border border-border-main hover:bg-primary-light hover:text-primary transition-all disabled:opacity-20 disabled:pointer-events-none group shadow-sm"
                        >
                            <ChevronLeft size={24} className="group-active:-translate-x-1 transition-transform" />
                        </button>
                        <span className="text-xs font-bold uppercase tracking-[0.4em] text-text-light italic">
                            ARCHIVE PAGE <span className="text-text-main font-bold">{page}</span> / {pagination.pages}
                        </span>
                        <button
                            disabled={page === pagination.pages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-5 rounded-2xl bg-bg-card border border-border-main hover:bg-primary-light hover:text-primary transition-all disabled:opacity-20 disabled:pointer-events-none group shadow-sm"
                        >
                            <ChevronRight size={24} className="group-active:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
