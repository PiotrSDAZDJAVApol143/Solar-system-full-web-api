// src/utils/formatUtils.js

/**
 * Funkcja do formatowania godzin na dni, godziny, minuty
 * @param {number} hours - liczba godzin (np. 1.25 godziny)
 * @returns {string} sformatowany czas w dniach, godzinach i minutach
 */
export function formatHoursToTime(hours) {
    const hoursInDay = 24;

    if (hours < hoursInDay) {
        // Przelicz godziny na minuty i sekundy
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
        // Zamiana godzin na dni, a następnie przekazanie do formatowania dni
        return formatDaysToTime(hours / hoursInDay);
    }
}

/**
 * Funkcja do formatowania dni na lata, dni, godziny, minuty
 * @param {number} days - liczba dni (np. 400 dni)
 * @returns {string} sformatowany czas w latach, dniach, godzinach i minutach
 */
export function formatDaysToTime(days) {
    const daysInYear = 365;
    const years = Math.floor(days / daysInYear);
    const remainingDays = Math.floor(days % daysInYear);
    const totalHours = Math.floor((days % 1) * 24);
    const minutes = Math.floor(((days * 24) % 1) * 60);

    let result = '';

    const getYearLabel = (years) => {
        if (years === 1) return 'rok';
        if (years >= 2 && years <= 4) return 'lata';
        return 'lat';
    };

    if (years > 0) result += `${years} ${getYearLabel(years)} `;
    if (remainingDays > 0) result += `${remainingDays} ${remainingDays === 1 ? 'dzień' : 'dni'} `;
    if (totalHours > 0) result += `${totalHours} godz. `;
    if (minutes > 0) result += `${minutes} min `;

    return result.trim() || 'mniej niż minuta';
}