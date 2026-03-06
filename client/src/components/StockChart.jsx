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
                // Transform the data for the chart (Area chart works better than candlestick in basic re-charts)
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
        <div className="h-[350px] flex items-center justify-center bg-white/[0.02] rounded-3xl border border-white/5 animate-pulse">
            <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 italic">Rendering Matrix...</span>
        </div>
    );

    return (
        <div className="h-[400px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                        minTickGap={30}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                        orientation="right"
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#151d27',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: 900,
                            fontStyle: 'italic',
                            color: '#fff'
                        }}
                        itemStyle={{ color: '#3b82f6' }}
                        cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#3b82f6"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StockChart;
