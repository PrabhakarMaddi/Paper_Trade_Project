import { useState, useEffect } from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from 'recharts';
import axios from '../api/axios';

const StockChart = ({ symbol }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('1D');

    const ranges = [
        { label: '1D', value: '1D' },
        { label: '1M', value: '1M' },
        { label: '3M', value: '3M' },
        { label: '6M', value: '6M' },
        { label: '1Y', value: '1Y' },
        { label: '3Y', value: '3Y' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let items = [];
                if (range === '1D') {
                    const { data } = await axios.get(`/stock/intraday/${symbol}`);
                    items = data.map(item => ({
                        time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        price: item.close
                    }));
                } else {
                    const { data } = await axios.get(`/stock/historical/${symbol}?range=${range}`);
                    items = data.map(item => ({
                        time: new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: range.includes('Y') ? '2-digit' : undefined }),
                        price: item.close
                    }));
                }
                setData(items);
            } catch (error) {
                console.error(`Error fetching ${range} data`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Only interval refresh for 1D data
        let interval;
        if (range === '1D') {
            interval = setInterval(fetchData, 60000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [symbol, range]);

    if (loading) return (
        <div className="h-[350px] flex items-center justify-center bg-slate-50 rounded-3xl border border-slate-100 animate-pulse">
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-text-light ">Rendering Analysis...</span>
        </div>
    );

    return (
        <div className="w-full">
            <div className="flex justify-center mb-6 space-x-2">
                {ranges.map((r) => (
                    <button
                        key={r.value}
                        onClick={() => setRange(r.value)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${range === r.value
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
                                : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-slate-100'
                            }`}
                    >
                        {r.label}
                    </button>
                ))}
            </div>

            {(!data || data.length === 0) ? (
                <div className="h-[350px] flex flex-col items-center justify-center bg-bg-main/50 rounded-3xl border border-border-main">
                    <div className="w-10 h-10 mb-3 bg-bg-card rounded-full flex items-center justify-center border border-border-light shadow-inner">
                        <span className="text-text-muted">📊</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">No Chart Data Available</span>
                </div>
            ) : (
                <div className="h-[350px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis
                                dataKey="time"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                minTickGap={30}
                                dy={10}
                            />
                            <YAxis
                                domain={['auto', 'auto']}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                orientation="right"
                                dx={10}
                                tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.08)',
                                    padding: '12px'
                                }}
                                formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Price']}
                                itemStyle={{ color: '#4f46e5' }}
                                cursor={{ stroke: '#4f46e5', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke="#4f46e5"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorPrice)"
                                animationDuration={1000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default StockChart;
