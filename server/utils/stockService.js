const YahooFinanceClass = require('yahoo-finance2').default;
const yahooFinance = new YahooFinanceClass();

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

// Generate a realistic random price fluctuation for fallback
function fluctuate(basePrice) {
    const change = (Math.random() - 0.49) * basePrice * 0.02;
    return Math.round((basePrice + change) * 100) / 100;
}

// Generate simulated intraday data (candlestick) for fallback
function generateIntradayData(symbol) {
    const stock = SIMULATED_STOCKS[symbol.toUpperCase()] || { name: symbol, basePrice: 1000 };

    const data = [];
    let price = stock.basePrice;
    const now = new Date();

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

/**
 * Get real-time quote for a symbol.
 */
async function getQuote(symbol) {
    const upperSymbol = symbol.toUpperCase();
    const searchSymbol = upperSymbol.includes('.') ? upperSymbol : `${upperSymbol}.NS`;

    try {
        const quote = await yahooFinance.quote(searchSymbol);
        if (quote) {
            return {
                symbol: upperSymbol,
                name: quote.longName || quote.shortName || upperSymbol,
                price: quote.regularMarketPrice,
                change: quote.regularMarketChange,
                changePercent: (quote.regularMarketChangePercent?.toFixed(2) || '0.00') + '%',
                high: quote.regularMarketDayHigh,
                low: quote.regularMarketDayLow,
                volume: quote.regularMarketVolume,
                previousClose: quote.regularMarketPreviousClose,
                simulated: false
            };
        }
    } catch (err) {
        console.error(`Yahoo Finance Quote Error [${upperSymbol}]:`, err.message);
    }

    // Fallback to simulated data
    const stock = SIMULATED_STOCKS[upperSymbol] || SIMULATED_STOCKS[upperSymbol.split('.')[0]];
    if (!stock) return null;

    const price = fluctuate(stock.basePrice);
    const prevClose = stock.basePrice;
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

/**
 * Search for stocks by query.
 */
async function searchStocks(query) {
    if (!query) return [];

    try {
        const results = await yahooFinance.search(query, {
            quotesCount: 10,
            newsCount: 0
        });

        // Map and clean search results
        const rawQuotes = results.quotes || [];
        const filteredResults = rawQuotes
            .filter(q => q.symbol && (q.isYahooFinance || q.quoteType || q.typeDisp))
            .map(q => ({
                symbol: q.symbol,
                name: q.longname || q.longName || q.shortname || q.shortName || q.symbol,
                price: q.prevClose || q.regularMarketPreviousClose || 0,
                exchange: q.exchDisp || q.exchange || 'Unknown'
            }));

        if (filteredResults.length > 0) return filteredResults;
    } catch (err) {
        console.error(`Yahoo Finance Search Error [${query}]:`, err.message);
    }

    // Fallback search
    const q = query.toUpperCase();
    return Object.entries(SIMULATED_STOCKS)
        .filter(([sym, data]) =>
            sym.includes(q) || data.name.toUpperCase().includes(q)
        )
        .map(([sym, data]) => ({
            symbol: sym,
            name: data.name,
            price: fluctuate(data.basePrice),
            exchange: 'NSE'
        }))
        .slice(0, 10);
}

/**
 * Get intraday chart data.
 */
async function getIntraday(symbol) {
    const upperSymbol = symbol.toUpperCase();
    const searchSymbol = upperSymbol.includes('.') ? upperSymbol : `${upperSymbol}.NS`;

    try {
        // Fetch 1 day of 5-minute intervals
        const period1 = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const result = await yahooFinance.chart(searchSymbol, { period1, interval: '5m' });

        if (result && result.quotes && result.quotes.length > 0) {
            return result.quotes
                .filter(q => q.close !== null)
                .map(q => ({
                    timestamp: q.date.toISOString(),
                    open: q.open,
                    high: q.high,
                    low: q.low,
                    close: q.close,
                    volume: q.volume
                }));
        }
    } catch (err) {
        console.error(`Yahoo Finance Chart Error [${upperSymbol}]:`, err.message);
    }

    return generateIntradayData(upperSymbol);
}

module.exports = { getQuote, searchStocks, getIntraday, SIMULATED_STOCKS };
