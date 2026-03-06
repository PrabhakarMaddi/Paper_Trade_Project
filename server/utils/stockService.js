const axios = require('axios');

// Simulated stock data for fallback
const SIMULATED_STOCKS = {
    RELIANCE: { name: 'Reliance Industries Ltd.', basePrice: 2950.50 },
    TCS: { name: 'Tata Consultancy Services', basePrice: 4120.80 },
    HDFCBANK: { name: 'HDFC Bank Ltd.', basePrice: 1450.20 },
    INFY: { name: 'Infosys Ltd.', basePrice: 1620.60 },
    ICICIBANK: { name: 'ICICI Bank Ltd.', basePrice: 1085.30 },
    BHARTIARTL: { name: 'Bharti Airtel Ltd.', basePrice: 1215.75 },
    SBIN: { name: 'State Bank of India', basePrice: 775.40 },
    LICI: { name: 'Life Insurance Corp.', basePrice: 955.10 },
    ITC: { name: 'ITC Ltd.', basePrice: 435.60 },
    HINDUNILVR: { name: 'Hindustan Unilever Ltd.', basePrice: 2420.30 },
    LT: { name: 'Larsen & Toubro Ltd.', basePrice: 3565.20 },
    BAJFINANCE: { name: 'Bajaj Finance Ltd.', basePrice: 6650.20 },
    M_M: { name: 'Mahindra & Mahindra', basePrice: 1950.40 },
    MARUTI: { name: 'Maruti Suzuki India', basePrice: 11520.40 },
    SUNPHARMA: { name: 'Sun Pharmaceutical', basePrice: 1560.30 },
    KOTAKBANK: { name: 'Kotak Mahindra Bank', basePrice: 1720.50 },
    AXISBANK: { name: 'Axis Bank Ltd.', basePrice: 1085.90 },
    ADANIENT: { name: 'Adani Enterprises Ltd.', basePrice: 3215.20 },
    TATAMOTORS: { name: 'Tata Motors Ltd.', basePrice: 980.10 },
    WIPRO: { name: 'Wipro Ltd.', basePrice: 512.40 },
    ASIANPAINT: { name: 'Asian Paints Ltd.', basePrice: 2850.30 },
    TITAN: { name: 'Titan Company Ltd.', basePrice: 3625.60 },
    HCLTECH: { name: 'HCL Technologies Ltd.', basePrice: 1512.80 },
    ONGC: { name: 'ONGC Ltd.', basePrice: 275.30 },
    NTPC: { name: 'NTPC Ltd.', basePrice: 345.10 },
    JSWSTEEL: { name: 'JSW Steel Ltd.', basePrice: 825.80 },
    POWERGRID: { name: 'Power Grid Corp.', basePrice: 285.60 },
    ADANIPORTS: { name: 'Adani Ports & SEZ', basePrice: 1285.30 },
    GRASIM: { name: 'Grasim Industries Ltd.', basePrice: 2212.70 },
    ULTRACEMCO: { name: 'UltraTech Cement Ltd.', basePrice: 9850.30 }
};

// Generate a realistic random price fluctuation
function fluctuate(basePrice) {
    const change = (Math.random() - 0.49) * basePrice * 0.02; // Slightly less volatile for Indian markets
    return Math.round((basePrice + change) * 100) / 100;
}

// Generate simulated intraday data (candlestick)
function generateIntradayData(symbol) {
    const stock = SIMULATED_STOCKS[symbol.toUpperCase()];
    if (!stock) return null;

    const data = [];
    let price = stock.basePrice;
    const now = new Date();

    // Generate 75 five-minute candles (6.25 hours trading day - Indian Market 9:15 to 3:30)
    for (let i = 74; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 5 * 60 * 1000);
        const open = price;
        const close = fluctuate(price);
        const high = Math.max(open, close) * (1 + Math.random() * 0.003);
        const low = Math.min(open, close) * (1 - Math.random() * 0.003);
        const volume = Math.floor(Math.random() * 300000) + 10000;

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

// Simulated fallback for Indian stocks (Alpha Vantage has limited support for NSE/BSE)
async function getQuote(symbol) {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    let upperSymbol = symbol.toUpperCase();

    // Handle common NSE symbols if passed without suffix
    const nseSymbol = upperSymbol.endsWith('.BSE') || upperSymbol.endsWith('.NSE') ? upperSymbol : `${upperSymbol}.NSE`;

    // Try Alpha Vantage if key is present
    if (apiKey && apiKey !== 'your_alpha_vantage_api_key_here') {
        try {
            const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${nseSymbol}&apikey=${apiKey}`;
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
        } catch (err) { }
    }

    // Simulated fallback
    const stock = SIMULATED_STOCKS[upperSymbol] || SIMULATED_STOCKS[upperSymbol.replace('.NSE', '')];
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
        high: Math.round(Math.max(price, prevClose) * 1.004 * 100) / 100,
        low: Math.round(Math.min(price, prevClose) * 0.996 * 100) / 100,
        volume: Math.floor(Math.random() * 5000000) + 500000,
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
