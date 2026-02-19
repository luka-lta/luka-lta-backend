import {CommonApiParams} from "@/api/analytics/endpoints/types.ts";

export function buildApiParams(): CommonApiParams {

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const format = (date: Date) => date.toISOString().split("T")[0];
    return {
        startDate: format(today),
        endDate: format(thirtyDaysAgo),
        timeZone: 'Europe/Berlin',
    };
}

export function truncateString(str: string, n = 50) {
    return str.length > n ? str.substring(0, n) + "..." : str;
}

export const getCountryName = (countryCode: string) => {
    try {
        return regionNamesInEnglish.of(countryCode.toUpperCase()) || countryCode;
    } catch (error) {
        return countryCode;
    }
};

export const getLanguageName = (languageCode: string) => {
    try {
        // Handle codes like "en-US" that have both language and region
        if (languageCode.includes("-")) {
            const [language, region] = languageCode.split("-");
            const languageName = languageNamesInEnglish.of(language);
            const regionName = regionNamesInEnglish.of(region);
            return `${languageName} (${regionName})`;
        }
        // Just a language code
        return languageNamesInEnglish.of(languageCode);
    } catch (error) {
        return languageCode;
    }
};

const regionNamesInEnglish = new Intl.DisplayNames(["en"], { type: "region" });
const languageNamesInEnglish = new Intl.DisplayNames(["en"], {
    type: "language",
});