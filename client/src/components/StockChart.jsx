import {
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { useState, useEffect } from 'react';
import axios from '../api/axios';

const StockChart = ({ symbol }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`/stock/intraday/${symbol}`);
                setData(data);
            } catch (error) {
                console.error('Error fetching chart data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [symbol]);

    if (loading) return <div className="h-64 flex items-center justify-center">Loading chart...</div>;

    // Custom Candle stick rendering
    const Candle = (props) => {
        const { x, y, width, height, low, high, open, close } = props;
        const isUp = close >= open;
        const color = isUp ? '#10b981' : '#f43f5e';

        // Scale high/low to coordinate system is tricky with Recharts Bar
        // We'll use a simplified version or just use area chart for consistency
        return null;
    };

    return (
        <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="timestamp"
                        hide={true}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        orientation="right"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{ background: '#151d27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="close" radius={[2, 2, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={index > 0 && data[index].close >= data[index - 1].close ? '#10b981' : '#f43f5e'}
                            />
                        ))}
                    </Bar>
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StockChart;
