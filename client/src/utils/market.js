/**
 * Checks if the Indian stock market is currently open.
 * Market hours: 9:15 AM to 3:30 PM (15:30) IST, Monday to Friday.
 */
export function isMarketOpen() {
    const now = new Date();

    // Format the current date/time to IST
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    });

    const parts = formatter.formatToParts(now);
    const timeData = {};
    for (const part of parts) {
        timeData[part.type] = part.value;
    }

    const day = timeData.weekday;
    let hour = parseInt(timeData.hour, 10);
    if (hour === 24) hour = 0;
    const minute = parseInt(timeData.minute, 10);

    // Check weekend
    if (day === 'Saturday' || day === 'Sunday') {
        return false;
    }

    const currentMinutes = hour * 60 + minute;

    // 9:15 AM = 555 mins
    // 3:30 PM = 930 mins
    const openTime = 9 * 60 + 15;
    const closeTime = 15 * 60 + 30;

    if (currentMinutes >= openTime && currentMinutes <= closeTime) {
        return true;
    }

    return false;
}
