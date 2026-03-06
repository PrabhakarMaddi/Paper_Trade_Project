import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';

const Portfolio = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            const { data } = await axios.get('/portfolio');
            setData(data);
        } catch (error) {
            console.error('Error fetching portfolio');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading portfolio...</div>;

    const { holdings, summary } = data;

    return (
        <div className="fade-in">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold">My Portfolio</h1>
                    <p className="text-secondary mt-2">Manage your active holdings and track performance</p>
                </div>
                <div className="text-right">
                    <p className="text-secondary text-sm mb-1">Net Worth</p>
                    <p className="text-3xl font-bold text-primary">${summary.netWorth.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="glass-card">
                    <p className="stat-label">Total Invested</p>
                    <p className="stat-value text-xl">${summary.totalInvested.toLocaleString()}</p>
                </div>
                <div className="glass-card">
                    <p className="stat-label">Market Value</p>
                    <p className="stat-value text-xl">${summary.totalCurrentValue.toLocaleString()}</p>
                </div>
                <div className="glass-card">
                    <p className="stat-label">Unrealized P&L</p>
                    <p className={`stat-value text-xl ${summary.totalPnl >= 0 ? 'pnl-up' : 'pnl-down'}`}>
                        ${summary.totalPnl.toLocaleString()}
                    </p>
                </div>
                <div className="glass-card">
                    <p className="stat-label">Return %</p>
                    <p className={`stat-value text-xl ${summary.totalPnlPercent >= 0 ? 'pnl-up' : 'pnl-down'}`}>
                        {summary.totalPnlPercent}%
                    </p>
                </div>
            </div>

            <div className="glass-card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Stock</th>
                                <th>Quantity</th>
                                <th>Avg. Cost</th>
                                <th>Market Price</th>
                                <th>Cost Basis</th>
                                <th>Market Value</th>
                                <th>Total P&L</th>
                            </tr>
                        </thead>
                        <tbody>
                            {holdings.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-secondary">
                                        <div className="flex flex-col items-center gap-3">
                                            <Info size={40} className="opacity-20" />
                                            <p>Your portfolio is empty. Time to make your first trade!</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                holdings.map((h) => (
                                    <tr key={h.stockSymbol}>
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="symbol-badge w-fit mb-1">{h.stockSymbol}</span>
                                                <span className="text-sm text-secondary line-clamp-1">{h.stockName}</span>
                                            </div>
                                        </td>
                                        <td className="font-semibold">{h.quantity}</td>
                                        <td>${h.avgPrice.toFixed(2)}</td>
                                        <td>${h.currentPrice.toFixed(2)}</td>
                                        <td>${h.investedValue.toLocaleString()}</td>
                                        <td>${h.currentValue.toLocaleString()}</td>
                                        <td>
                                            <div className={`font-bold ${h.pnl >= 0 ? 'pnl-up' : 'pnl-down'}`}>
                                                {h.pnl >= 0 ? '+' : ''}{h.pnl.toFixed(2)}
                                            </div>
                                            <div className={`text-xs ${h.pnl >= 0 ? 'pnl-up' : 'pnl-down'}`}>
                                                {h.pnlPercent}%
                                            </div>
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

export default Portfolio;
