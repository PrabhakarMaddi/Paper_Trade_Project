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

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`/stock/intraday/${symbol}`);
                setData(data.map(item => ({
                    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    price: item.close
                })));
            } catch (error) {
                console.error('Error fetching intraday data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [symbol]);

    if (loading) return (
        <div className="h-[350px] flex items-center justify-center bg-slate-50 rounded-3xl border border-slate-100 animate-pulse">
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-text-light italic">Rendering Analysis...</span>
        </div>
    );

    return (
        <div className="h-[400px] w-full pt-4">
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
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                        minTickGap={40}
                        dy={10}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                        orientation="right"
                        dx={10}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.08)',
                            padding: '12px'
                        }}
                        itemStyle={{ color: '#4f46e5' }}
                        cursor={{ stroke: '#4f46e5', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                        animationDuration={1000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StockChart;
