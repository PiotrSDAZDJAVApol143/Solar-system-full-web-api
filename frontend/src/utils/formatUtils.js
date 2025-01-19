// src/utils/formatUtils.js

/**
 * Funkcja do formatowania godzin na dni, godziny, minuty, sekundy
 * @param {number} hours - liczba godzin (np. 24.6229 godziny dla Marsa)
 * @returns {string} sformatowany czas w dniach, godzinach, minutach i sekundach
 */
export function formatHoursToTime(hours) {
    if (hours < 24) {
        const totalSeconds = Math.round(hours * 3600);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        let result = '';
        if (h > 0) result += `${h} godz. `;
        if (m > 0) result += `${m} min `;
        if (s > 0) result += `${s} sek `;

        return result.trim();
    } else {
        const days = Math.floor(hours / 24);
        const remainingHours = Math.floor(hours % 24);
        const minutes = Math.floor((hours % 1) * 60);

        let result = '';
        if (days > 0) result += `${days} ${days === 1 ? 'dzień' : 'dni'} `;
        if (remainingHours > 0) result += `${remainingHours} godz. `;
        if (minutes > 0) result += `${minutes} min `;

        return result.trim();
    }
}

/**
 * Funkcja do formatowania dni na dni, godziny, minuty
 * @param {number} days - liczba dni (np. 1.25 dnia)
 * @returns {string} sformatowany czas w dniach, godzinach i minutach
 */
export function formatDaysToTime(days) {
    const totalHours = Math.floor(days * 24);
    const d = Math.floor(totalHours / 24);
    const h = totalHours % 24;
    const m = Math.floor((days * 24 * 60) % 60);

    let result = '';
    if (d > 0) result += `${d} ${d === 1 ? 'dzień' : 'dni'} `;
    if (h > 0) result += `${h} godz. `;
    if (m > 0) result += `${m} min `;

    return result.trim() || 'mniej niż minuta';
}