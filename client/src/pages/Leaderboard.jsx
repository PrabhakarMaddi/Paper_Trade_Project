import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Award, TrendingUp, User } from 'lucide-react';

const Leaderboard = () => {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const { data } = await axios.get('/leaderboard');
            setRankings(data);
        } catch (error) {
            console.error('Error fetching leaderboard');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <h1 className="text-3xl font-bold mb-8">Leaderboard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Top 3 Featured */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass-card">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Award className="text-accent" /> Wall Street Elite
                        </h2>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Trader</th>
                                        <th>Net Worth</th>
                                        <th>Total Return</th>
                                        <th>Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="5" className="text-center py-8">Loading rankings...</td></tr>
                                    ) : rankings.map((r) => (
                                        <tr key={r.rank} className={r.rank <= 3 ? 'bg-accent/5' : ''}>
                                            <td>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${r.rank === 1 ? 'bg-yellow-500 text-white' :
                                                        r.rank === 2 ? 'bg-slate-300 text-slate-800' :
                                                            r.rank === 3 ? 'bg-amber-600 text-white' : 'bg-glass text-secondary'
                                                    }`}>
                                                    {r.rank}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                                        <User size={16} className="text-primary" />
                                                    </div>
                                                    <span className="font-semibold">{r.name}</span>
                                                </div>
                                            </td>
                                            <td className="font-bold">${r.netWorth.toLocaleString()}</td>
                                            <td className={r.returnPercent >= 0 ? 'pnl-up' : 'pnl-down'}>
                                                {r.returnPercent >= 0 ? '+' : ''}{r.returnPercent}%
                                            </td>
                                            <td className="text-sm text-secondary">
                                                {new Date(r.joinedAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <div className="glass-card bg-primary/10 border-primary/20">
                        <h3 className="font-bold mb-2">How it works?</h3>
                        <p className="text-sm text-secondary leading-relaxed">
                            Rankings are calculated based on your current **Net Worth** (Cash + Market Value of Portfolio).
                            Returns are measured relative to the starting balance of **$100,000**.
                        </p>
                    </div>
                    <div className="glass-card">
                        <TrendingUp size={40} className="text-accent mb-4 opacity-50" />
                        <p className="text-sm text-secondary">
                            Keep trading and maximizing your gains to climb the leaderboard and join the elite traders!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
