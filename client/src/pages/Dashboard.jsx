import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Activity } from 'lucide-react';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const { data } = await axios.get('/portfolio');
            setData(data);
        } catch (error) {
            console.error('Error fetching dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading dashboard...</div>;

    const { summary, holdings } = data;

    return (
        <div className="fade-in">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            <div className="stats-grid">
                <div className="glass-card">
                    <p className="stat-label flex items-center gap-2">
                        <DollarSign size={16} /> Virtual Balance
                    </p>
                    <p className="stat-value">${summary.balance.toLocaleString()}</p>
                </div>

                <div className="glass-card">
                    <p className="stat-label flex items-center gap-2">
                        <Briefcase size={16} /> Portfolio Value
                    </p>
                    <p className="stat-value">${summary.totalCurrentValue.toLocaleString()}</p>
                </div>

                <div className="glass-card">
                    <p className="stat-label flex items-center gap-2">
                        <Activity size={16} /> Total P&L
                    </p>
                    <p className={`stat-value ${summary.totalPnl >= 0 ? 'pnl-up' : 'pnl-down'}`}>
                        {summary.totalPnl >= 0 ? '+' : ''}${summary.totalPnl.toLocaleString()}
                    </p>
                    <div className={`stat-pnl ${summary.totalPnl >= 0 ? 'pnl-up' : 'pnl-down'}`}>
                        {summary.totalPnl >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {summary.totalPnlPercent}%
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <h2 className="text-xl font-bold mb-6">Top Holdings</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Stock</th>
                                <th>Quantity</th>
                                <th>Avg. Cost</th>
                                <th>Current Price</th>
                                <th>P&L</th>
                            </tr>
                        </thead>
                        <tbody>
                            {holdings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-secondary">
                                        No holdings yet. Go to the Trade page to start trading!
                                    </td>
                                </tr>
                            ) : (
                                holdings.slice(0, 5).map((h) => (
                                    <tr key={h.stockSymbol}>
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="symbol-badge w-fit mb-1">{h.stockSymbol}</span>
                                                <span className="text-sm text-secondary">{h.stockName}</span>
                                            </div>
                                        </td>
                                        <td>{h.quantity}</td>
                                        <td>${h.avgPrice.toFixed(2)}</td>
                                        <td>${h.currentPrice.toFixed(2)}</td>
                                        <td className={h.pnl >= 0 ? 'pnl-up' : 'pnl-down'}>
                                            {h.pnl >= 0 ? '+' : ''}{h.pnl.toFixed(2)} ({h.pnlPercent}%)
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
