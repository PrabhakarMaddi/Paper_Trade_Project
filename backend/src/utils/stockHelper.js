const axios = require('axios');

// A comprehensive mock dataset so app works without a Finnhub API key
const MOCK_STOCKS = {
    AAPL: { symbol: 'AAPL', name: 'Apple Inc.', price: 178.5, change: 1.2, changePercent: 0.68 },
    MSFT: { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.2, change: 3.1, changePercent: 0.75 },
    GOOGL: { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 175.8, change: -0.8, changePercent: -0.45 },
    AMZN: { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 185.6, change: 2.5, changePercent: 1.37 },
    TSLA: { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.0, change: -5.2, changePercent: -2.08 },
    META: { symbol: 'META', name: 'Meta Platforms Inc.', price: 505.3, change: 7.8, changePercent: 1.57 },
    NVDA: { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 878.4, change: 15.3, changePercent: 1.77 },
    NFLX: { symbol: 'NFLX', name: 'Netflix Inc.', price: 628.9, change: 4.1, changePercent: 0.66 },
    AMD: { symbol: 'AMD', name: 'Advanced Micro Devices', price: 178.2, change: 2.8, changePercent: 1.60 },
    DIS: { symbol: 'DIS', name: 'Walt Disney Co.', price: 112.4, change: -1.3, changePercent: -1.15 },
    BABA: { symbol: 'BABA', name: 'Alibaba Group', price: 73.5, change: 0.9, changePercent: 1.24 },
    JPM: { symbol: 'JPM', name: 'JPMorgan Chase', price: 198.7, change: 1.6, changePercent: 0.81 },
};

/**
 * Fetch a real-time stock quote.
 * Falls back to mock data if no API key is set or request fails.
 */
const getStockQuote = async (symbol) => {
    const apiKey = process.env.FINNHUB_API_KEY;
    const upperSymbol = symbol.toUpperCase();

    if (apiKey && apiKey !== 'your_finnhub_api_key_here') {
        try {
            const [quoteRes, profileRes] = await Promise.all([
                axios.get(`https://finnhub.io/api/v1/quote?symbol=${upperSymbol}&token=${apiKey}`),
                axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${upperSymbol}&token=${apiKey}`),
            ]);
            const q = quoteRes.data;
            const p = profileRes.data;
            if (!q.c || q.c === 0) return null;
            return {
                symbol: upperSymbol,
                name: p.name || upperSymbol,
                price: q.c,
                change: q.d,
                changePercent: q.dp,
                high: q.h,
                low: q.l,
                open: q.o,
                previousClose: q.pc,
            };
        } catch {
            // fall through to mock
        }
    }

    // Mock fallback
    if (MOCK_STOCKS[upperSymbol]) {
        return {
            ...MOCK_STOCKS[upperSymbol],
            high: MOCK_STOCKS[upperSymbol].price * 1.02,
            low: MOCK_STOCKS[upperSymbol].price * 0.98,
            open: MOCK_STOCKS[upperSymbol].price - MOCK_STOCKS[upperSymbol].change,
            previousClose: MOCK_STOCKS[upperSymbol].price - MOCK_STOCKS[upperSymbol].change,
            isMock: true,
        };
    }

    return null;
};

/**
 * Search for stocks by keyword.
 */
const searchStocks = async (query) => {
    const apiKey = process.env.FINNHUB_API_KEY;
    const q = query.toUpperCase();

    if (apiKey && apiKey !== 'your_finnhub_api_key_here') {
        try {
            const res = await axios.get(
                `https://finnhub.io/api/v1/search?q=${query}&token=${apiKey}`
            );
            return (res.data.result || []).slice(0, 10).map((s) => ({
                symbol: s.symbol,
                name: s.description,
            }));
        } catch {
            // fall through to mock
        }
    }

    // Mock search
    return Object.values(MOCK_STOCKS)
        .filter((s) => s.symbol.includes(q) || s.name.toUpperCase().includes(q))
        .slice(0, 8)
        .map((s) => ({ symbol: s.symbol, name: s.name }));
};

module.exports = { getStockQuote, searchStocks, MOCK_STOCKS };
