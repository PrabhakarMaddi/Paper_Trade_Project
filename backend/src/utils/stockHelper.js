const axios = require('axios');

// A comprehensive mock dataset so app works without a Finnhub API key
const MOCK_STOCKS = {
    RELIANCE: { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', price: 2950.4, change: 15.2, changePercent: 0.51 },
    TCS: { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4120.5, change: -12.1, changePercent: -0.29 },
    HDFCBANK: { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 1450.8, change: 8.5, changePercent: 0.58 },
    INFY: { symbol: 'INFY', name: 'Infosys Ltd.', price: 1680.2, change: 25.4, changePercent: 1.53 },
    ICICIBANK: { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', price: 1089.6, change: 5.2, changePercent: 0.47 },
    SBIN: { symbol: 'SBIN', name: 'State Bank of India', price: 765.4, change: -3.8, changePercent: -0.49 },
    BHARTIARTL: { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', price: 1215.3, change: 18.7, changePercent: 1.56 },
    ITC: { symbol: 'ITC', name: 'ITC Ltd.', price: 425.6, change: 1.2, changePercent: 0.28 },
    LNT: { symbol: 'LNT', name: 'Larsen & Toubro Ltd.', price: 3750.8, change: 45.3, changePercent: 1.22 },
    BAJFINANCE: { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', price: 7120.5, change: -55.4, changePercent: -0.77 },
    WIPRO: { symbol: 'WIPRO', name: 'Wipro Ltd.', price: 530.2, change: 4.8, changePercent: 0.91 },
    TATAMOTORS: { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', price: 1012.5, change: 15.6, changePercent: 1.56 },
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
