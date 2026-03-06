import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const rankIcon = (rank) => {
    if (rank === 1) return <Crown size={18} style={{ color: '#f59e0b' }} />;
    if (rank === 2) return <Medal size={18} style={{ color: '#94a3b8' }} />;
    if (rank === 3) return <Medal size={18} style={{ color: '#cd7f32' }} />;
    return <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>#{rank}</span>;
};

export default function Leaderboard() {
    const { user } = useAuth();
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/leaderboard')
            .then(({ data }) => setLeaders(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex min-h-screen">
            <Navbar />
            <main className="flex-1 ml-64 p-8">
                <h1 className="text-2xl font-bold mb-2">Leaderboard</h1>
                <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Top traders ranked by total portfolio value</p>

                {/* Top 3 podium */}
                {!loading && leaders.length >= 3 && (
                    <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl">
                        {[1, 0, 2].map((i) => {
                            const l = leaders[i];
                            const heights = ['h-28', 'h-36', 'h-24'];
                            const podiumH = i === 0 ? heights[1] : i === 2 ? heights[2] : heights[0];
                            return (
                                <motion.div key={l.rank} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                    className={`glass-card flex flex-col items-center justify-end p-4 ${podiumH}`}
                                    style={{ border: l.rank === 1 ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--border)' }}>
                                    {rankIcon(l.rank)}
                                    <p className="font-bold text-sm mt-2">{l.username}</p>
                                    <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--accent)' }}>{fmt(l.totalValue)}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                <div className="glass-card p-6">
                    {loading ? (
                        <div className="flex flex-col gap-3">{[...Array(8)].map((_, i) => <div key={i} className="skeleton h-14 w-full" />)}</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ color: 'var(--text-secondary)' }}>
                                    {['Rank', 'Trader', 'Cash', 'Stocks', 'Total Value'].map(h => (
                                        <th key={h} className="text-left pb-4 pr-4 font-medium">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {leaders.map((l, i) => {
                                    const isMe = l.username === user?.username;
                                    return (
                                        <motion.tr key={l.username} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                            className="border-t" style={{ borderColor: 'var(--border)', background: isMe ? 'var(--bg-card-hover)' : 'transparent' }}>
                                            <td className="py-3.5 pr-4 w-12">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-lg"
                                                    style={{ background: l.rank <= 3 ? 'rgba(245,158,11,0.1)' : 'transparent' }}>
                                                    {rankIcon(l.rank)}
                                                </div>
                                            </td>
                                            <td className="py-3.5 pr-4 font-semibold">
                                                {l.username}
                                                {isMe && <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border)', color: 'var(--accent)' }}>You</span>}
                                            </td>
                                            <td className="py-3.5 pr-4" style={{ color: 'var(--text-secondary)' }}>{fmt(l.balance)}</td>
                                            <td className="py-3.5 pr-4" style={{ color: 'var(--text-secondary)' }}>{fmt(l.stockValue)}</td>
                                            <td className="py-3.5 font-bold" style={{ color: l.totalValue >= 100000 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                                {fmt(l.totalValue)}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
}
