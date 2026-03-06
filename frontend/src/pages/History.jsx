import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function History() {
    const [data, setData] = useState({ transactions: [], page: 1, totalPages: 1, total: 0 });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async (p = 1) => {
        setLoading(true);
        try {
            const { data: res } = await api.get(`/transactions?page=${p}&limit=15`);
            setData(res);
            setPage(p);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    return (
        <div className="flex min-h-screen">
            <Navbar />
            <main className="flex-1 ml-64 p-8">
                <h1 className="text-2xl font-bold mb-2">Transaction History</h1>
                <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>All your past trades ({data.total} total)</p>

                <div className="glass-card p-6">
                    {loading ? (
                        <div className="flex flex-col gap-3">{[...Array(8)].map((_, i) => <div key={i} className="skeleton h-14 w-full" />)}</div>
                    ) : data.transactions.length === 0 ? (
                        <div className="text-center py-16" style={{ color: 'var(--text-secondary)' }}>
                            <Clock size={48} className="mx-auto mb-3 opacity-30" />
                            <p>No transactions yet. Start trading!</p>
                        </div>
                    ) : (
                        <>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr style={{ color: 'var(--text-secondary)' }}>
                                        {['Type', 'Symbol', 'Qty', 'Price', 'Total', 'Date'].map(h => (
                                            <th key={h} className="text-left pb-4 pr-4 font-medium">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.transactions.map((tx, i) => (
                                        <motion.tr key={tx._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                            className="border-t" style={{ borderColor: 'var(--border)' }}>
                                            <td className="py-3.5 pr-4">
                                                <span className={tx.type === 'buy' ? 'badge-buy' : 'badge-sell'}>
                                                    {tx.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-3.5 pr-4 font-bold" style={{ color: 'var(--accent)' }}>{tx.symbol}</td>
                                            <td className="py-3.5 pr-4">{tx.quantity}</td>
                                            <td className="py-3.5 pr-4">{fmt(tx.price)}</td>
                                            <td className="py-3.5 pr-4 font-semibold">{fmt(tx.total)}</td>
                                            <td className="py-3.5" style={{ color: 'var(--text-secondary)' }}>
                                                {new Date(tx.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {data.totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        Page {page} of {data.totalPages}
                                    </p>
                                    <div className="flex gap-2">
                                        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all hover:bg-white/5"
                                            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                                            onClick={() => fetchHistory(page - 1)} disabled={page === 1}>
                                            <ChevronLeft size={14} /> Prev
                                        </button>
                                        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all hover:bg-white/5"
                                            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                                            onClick={() => fetchHistory(page + 1)} disabled={page === data.totalPages}>
                                            Next <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
