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
                    <h1 className="text-4xl font-black tracking-tighter sm:text-5xl italic">Execution Audit</h1>
                    <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-[0.3em]">Temporal Ledger of Trades</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                    <Download size={16} /> Export CSV
                </button>
            </div>

            <div className="glass-card p-2 flex flex-wrap items-center justify-between gap-4 border border-white/5 bg-white/[0.01]">
                <div className="flex gap-2 p-1">
                    {[
                        { label: 'Comprehensive', value: '', color: 'primary' },
                        { label: 'Purchase Assets', value: 'BUY', color: 'accent' },
                        { label: 'Divest Assets', value: 'SELL', color: 'accent-down' }
                    ].map(btn => (
                        <button
                            key={btn.value}
                            onClick={() => { setType(btn.value); setPage(1); }}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 
                ${type === btn.value
                                    ? `bg-${btn.color === 'primary' ? 'blue-500' : (btn.color === 'accent' ? 'accent' : 'red-500')} text-white shadow-lg`
                                    : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

                <div className="px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                    Found <span className="text-white">{pagination.total || 0}</span> Recorded Events
                </div>
            </div>

            <div className="glass-card p-0 overflow-hidden border border-white/5 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5 bg-white/[0.01]">
                                <th className="px-8 py-5">Timestamp</th>
                                <th className="px-8 py-5">Classification</th>
                                <th className="px-8 py-5">Asset Descriptor</th>
                                <th className="px-8 py-5">Quantity</th>
                                <th className="px-8 py-5 text-right">LTP Value</th>
                                <th className="px-8 py-5 text-right">Gross Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="6" className="px-8 py-16 text-center animate-pulse font-black italic text-slate-500">Retrieving archival data...</td></tr>
                            ) : trades.length === 0 ? (
                                <tr><td colSpan="6" className="px-8 py-20 text-center text-slate-500 font-bold italic">No records found for this sector.</td></tr>
                            ) : (
                                trades.map((t) => (
                                    <tr key={t._id} className="group hover:bg-white/[0.03] transition-all">
                                        <td className="px-8 py-6 font-medium">
                                            <div className="text-white font-black italic">{new Date(t.timestamp).toLocaleDateString()}</div>
                                            <div className="text-[10px] font-black uppercase text-slate-500 mt-1">{new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-2 rounded-lg text-[9px] font-black tracking-[0.2em] uppercase 
                        ${t.type === 'BUY' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-accent-down/10 text-accent-down border border-accent-down/20'}`}>
                                                {t.type === 'BUY' ? 'Invest' : 'Divest'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-black text-lg italic text-white group-hover:text-primary transition-colors">{t.stockSymbol}</span>
                                            <p className="text-[9px] font-black uppercase text-slate-500 truncate max-w-[150px] italic">{t.stockName}</p>
                                        </td>
                                        <td className="px-8 py-6 font-black italic text-slate-300">{t.quantity}</td>
                                        <td className="px-8 py-6 text-right font-black italic">₹{t.price.toLocaleString('en-IN')}</td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="font-black italic text-lg text-white">₹{t.total.toLocaleString('en-IN')}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.pages > 1 && (
                    <div className="flex justify-center items-center gap-8 p-8 border-t border-white/5 bg-white/[0.01]">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-primary hover:text-white transition-all disabled:opacity-20 disabled:pointer-events-none group"
                        >
                            <ChevronLeft size={20} className="group-active:-translate-x-1 transition-transform" />
                        </button>
                        <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 italic">
                            Sequence <span className="text-white">{page}</span> / {pagination.pages}
                        </span>
                        <button
                            disabled={page === pagination.pages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-primary hover:text-white transition-all disabled:opacity-20 disabled:pointer-events-none group"
                        >
                            <ChevronRight size={20} className="group-active:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
