const axios = require('axios');

// Simulated stock data for fallback
const SIMULATED_STOCKS = {
    AAPL: { name: 'Apple Inc.', basePrice: 178.50 },
    GOOGL: { name: 'Alphabet Inc.', basePrice: 141.80 },
    MSFT: { name: 'Microsoft Corp.', basePrice: 415.20 },
    AMZN: { name: 'Amazon.com Inc.', basePrice: 185.60 },
    TSLA: { name: 'Tesla Inc.', basePrice: 245.30 },
    META: { name: 'Meta Platforms Inc.', basePrice: 505.75 },
    NVDA: { name: 'NVIDIA Corp.', basePrice: 875.40 },
    JPM: { name: 'JPMorgan Chase & Co.', basePrice: 198.10 },
    V: { name: 'Visa Inc.', basePrice: 282.60 },
    JNJ: { name: 'Johnson & Johnson', basePrice: 156.30 },
    WMT: { name: 'Walmart Inc.', basePrice: 172.45 },
    PG: { name: 'Procter & Gamble Co.', basePrice: 162.80 },
    UNH: { name: 'UnitedHealth Group', basePrice: 527.90 },
    HD: { name: 'Home Depot Inc.', basePrice: 365.20 },
    DIS: { name: 'Walt Disney Co.', basePrice: 112.40 },
    NFLX: { name: 'Netflix Inc.', basePrice: 628.50 },
    PYPL: { name: 'PayPal Holdings', basePrice: 65.30 },
    INTC: { name: 'Intel Corp.', basePrice: 31.20 },
    AMD: { name: 'Advanced Micro Devices', basePrice: 172.80 },
    CRM: { name: 'Salesforce Inc.', basePrice: 298.40 },
    BA: { name: 'Boeing Co.', basePrice: 205.10 },
    UBER: { name: 'Uber Technologies', basePrice: 78.60 },
    SPOT: { name: 'Spotify Technology', basePrice: 295.30 },
    SQ: { name: 'Block Inc.', basePrice: 82.40 },
    SNAP: { name: 'Snap Inc.', basePrice: 11.50 },
    COIN: { name: 'Coinbase Global', basePrice: 225.80 },
    PLTR: { name: 'Palantir Technologies', basePrice: 24.60 },
    ROKU: { name: 'Roku Inc.', basePrice: 68.90 },
    ZM: { name: 'Zoom Video', basePrice: 65.70 },
    SHOP: { name: 'Shopify Inc.', basePrice: 78.30 }
};

// Generate a realistic random price fluctuation
function fluctuate(basePrice) {
    const change = (Math.random() - 0.48) * basePrice * 0.03;
    return Math.round((basePrice + change) * 100) / 100;
}

// Generate simulated intraday data (candlestick)
function generateIntradayData(symbol) {
    const stock = SIMULATED_STOCKS[symbol.toUpperCase()];
    if (!stock) return null;

    const data = [];
    let price = stock.basePrice;
    const now = new Date();

    // Generate 78 five-minute candles (6.5 hours trading day)
    for (let i = 77; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 5 * 60 * 1000);
        const open = price;
        const close = fluctuate(price);
        const high = Math.max(open, close) * (1 + Math.random() * 0.005);
        const low = Math.min(open, close) * (1 - Math.random() * 0.005);
        const volume = Math.floor(Math.random() * 500000) + 50000;

        data.push({
            timestamp: time.toISOString(),
            open: Math.round(open * 100) / 100,
            high: Math.round(high * 100) / 100,
            low: Math.round(low * 100) / 100,
            close: Math.round(close * 100) / 100,
            volume
        });
        price = close;
    }
    return data;
}

// Try Alpha Vantage, fall back to simulated
async function getQuote(symbol) {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    const upperSymbol = symbol.toUpperCase();

    // Try Alpha Vantage if key is present
    if (apiKey && apiKey !== 'your_alpha_vantage_api_key_here') {
        try {
            const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${upperSymbol}&apikey=${apiKey}`;
            const { data } = await axios.get(url, { timeout: 5000 });
            const quote = data['Global Quote'];
            if (quote && quote['05. price']) {
                return {
                    symbol: upperSymbol,
                    name: SIMULATED_STOCKS[upperSymbol]?.name || upperSymbol,
                    price: parseFloat(quote['05. price']),
                    change: parseFloat(quote['09. change']),
                    changePercent: quote['10. change percent'],
                    high: parseFloat(quote['03. high']),
                    low: parseFloat(quote['04. low']),
                    volume: parseInt(quote['06. volume']),
                    previousClose: parseFloat(quote['08. previous close']),
                    simulated: false
                };
            }
        } catch (err) {
            // Fall through to simulated
        }
    }

    // Simulated fallback
    const stock = SIMULATED_STOCKS[upperSymbol];
    if (!stock) return null;

    const price = fluctuate(stock.basePrice);
    const prevClose = fluctuate(stock.basePrice);
    const change = Math.round((price - prevClose) * 100) / 100;
    const changePercent = ((change / prevClose) * 100).toFixed(2) + '%';

    return {
        symbol: upperSymbol,
        name: stock.name,
        price,
        change,
        changePercent,
        high: Math.round(Math.max(price, prevClose) * 1.005 * 100) / 100,
        low: Math.round(Math.min(price, prevClose) * 0.995 * 100) / 100,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        previousClose: prevClose,
        simulated: true
    };
}

// Search stocks by query
function searchStocks(query) {
    const q = query.toUpperCase();
    return Object.entries(SIMULATED_STOCKS)
        .filter(([sym, data]) =>
            sym.includes(q) || data.name.toUpperCase().includes(q)
        )
        .map(([sym, data]) => ({
            symbol: sym,
            name: data.name,
            price: fluctuate(data.basePrice)
        }))
        .slice(0, 10);
}

// Get intraday data – try Alpha Vantage first
async function getIntraday(symbol) {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    const upperSymbol = symbol.toUpperCase();

    if (apiKey && apiKey !== 'your_alpha_vantage_api_key_here') {
        try {
            const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${upperSymbol}&interval=5min&apikey=${apiKey}`;
            const { data } = await axios.get(url, { timeout: 8000 });
            const timeSeries = data['Time Series (5min)'];
            if (timeSeries) {
                return Object.entries(timeSeries)
                    .slice(0, 78)
                    .reverse()
                    .map(([ts, vals]) => ({
                        timestamp: ts,
                        open: parseFloat(vals['1. open']),
                        high: parseFloat(vals['2. high']),
                        low: parseFloat(vals['3. low']),
                        close: parseFloat(vals['4. close']),
                        volume: parseInt(vals['5. volume'])
                    }));
            }
        } catch (err) {
            // Fall through
        }
    }

    return generateIntradayData(upperSymbol);
}

module.exports = { getQuote, searchStocks, getIntraday, SIMULATED_STOCKS };
