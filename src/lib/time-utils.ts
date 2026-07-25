import { formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { tr } from 'date-fns/locale';

/**
 * Returns a localized relative time string (e.g. "5 dakika önce")
 * 
 * @param dateString ISO date string or valid date format
 * @returns Localized relative time string or fallback
 */
export const getTimeAgo = (dateString: string): string => {
  if (!dateString) return "Geçmiş bir zaman";

  try {
    // If it's already a relative format from the old hardcoded store, return as is
    if (dateString.includes("önce") || dateString.includes("sonra") || dateString === "Dün") {
      return dateString;
    }

    const date = parseISO(dateString);
    if (!isValid(date)) {
      // Trying normal Date parsing as fallback
      const fallbackDate = new Date(dateString);
      if (isValid(fallbackDate)) {
        return formatDistanceToNow(fallbackDate, { addSuffix: true, locale: tr });
      }
      return "Geçmiş bir zaman"; // fallback
    }

    return formatDistanceToNow(date, { addSuffix: true, locale: tr });
  } catch (error) {
    console.error("getTimeAgo parsing error:", error);
    return "Geçmiş bir zaman";
  }
};
