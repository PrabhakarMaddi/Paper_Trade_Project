const YahooFinanceClass = require('yahoo-finance2').default;
const yahooFinance = new YahooFinanceClass();

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

    return null;
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

        // Fetch accurate prices for items missing prevClose
        const enhancedResults = await Promise.all(
            rawQuotes.filter(q => q.symbol && (q.isYahooFinance || q.quoteType || q.typeDisp)).map(async (q) => {
                let price = q.prevClose || q.regularMarketPreviousClose || 0;

                // If price is 0, try to get a quick quote to find the real price
                if (price === 0) {
                    try {
                        const quickQuote = await yahooFinance.quote(q.symbol);
                        price = quickQuote?.regularMarketPrice || quickQuote?.regularMarketPreviousClose || 0;
                    } catch (e) {
                        // silently handle
                    }
                }

                return {
                    symbol: q.symbol,
                    name: q.longname || q.longName || q.shortname || q.shortName || q.symbol,
                    price: price,
                    exchange: q.exchDisp || q.exchange || 'Unknown'
                };
            })
        );

        return enhancedResults;
    } catch (err) {
        console.error(`Yahoo Finance Search Error [${query}]:`, err.message);
        return [];
    }
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

    return [];
}

module.exports = { getQuote, searchStocks, getIntraday };
