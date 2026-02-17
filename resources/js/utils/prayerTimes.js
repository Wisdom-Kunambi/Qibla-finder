import {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  Madhab,
} from "adhan";

/**
 * Calculate prayer times for a given location and date
 * @param latitude - User's latitude
 * @param longitude - User's longitude
 * @param date - Date to calculate prayer times for (defaults to today)
 * @param calculationMethod - Calculation method (defaults to Muslim World League)
 * @returns Daily prayer times
 */
export function calculatePrayerTimes(
  latitude,
  longitude,
  date = new Date(),
  calculationMethod = CalculationMethod.MuslimWorldLeague()
) {
  const coordinates = new Coordinates(latitude, longitude);
  const params = calculationMethod;
  params.madhab = Madhab.Shafi; // You can make this configurable

  const prayerTimes = new PrayerTimes(coordinates, date, params);

  // Format time as HH:MM AM/PM
  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get Hijri date (simplified - you might want a proper Hijri calendar library)
  const getHijriDate = (date) => {
    // This is a simplified version - consider using a proper Hijri calendar library
    const hijriYear = 1447; // You'd calculate this properly
    const hijriMonth = Math.floor((date.getMonth() + 9) % 12) + 1;
    const hijriDay = date.getDate();

    const monthNames = [
      "Muharram",
      "Safar",
      "Rabi al-Awwal",
      "Rabi al-Thani",
      "Jumada al-Awwal",
      "Jumada al-Thani",
      "Rajab",
      "Shaban",
      "Ramadan",
      "Shawwal",
      "Dhul Qadah",
      "Dhul Hijjah",
    ];

    return `${hijriDay} ${monthNames[hijriMonth - 1]}, ${hijriYear}`;
  };

  const prayers = {
    fajr: {
      name: "Fajr",
      time: prayerTimes.fajr,
      displayTime: formatTime(prayerTimes.fajr),
    },
    sunrise: {
      name: "Sunrise",
      time: prayerTimes.sunrise,
      displayTime: formatTime(prayerTimes.sunrise),
    },
    dhuhr: {
      name: "Dhuhr",
      time: prayerTimes.dhuhr,
      displayTime: formatTime(prayerTimes.dhuhr),
    },
    asr: {
      name: "Asr",
      time: prayerTimes.asr,
      displayTime: formatTime(prayerTimes.asr),
    },
    maghrib: {
      name: "Maghrib",
      time: prayerTimes.maghrib,
      displayTime: formatTime(prayerTimes.maghrib),
    },
    isha: {
      name: "Isha",
      time: prayerTimes.isha,
      displayTime: formatTime(prayerTimes.isha),
    },
  };

  // Find next prayer
  const now = new Date();
  const nextPrayer = prayerTimes.nextPrayer(now);

  let nextPrayerInfo = null;
  if (nextPrayer) {
    const nextPrayerTime = prayerTimes.timeForPrayer(nextPrayer);
    if (nextPrayerTime) {
      const timeDiff = nextPrayerTime.getTime() - now.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor(
        (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
      );

      nextPrayerInfo = {
        name: nextPrayer,
        time: nextPrayerTime,
        timeRemaining: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      };
    }
  }

  return {
    date,
    hijriDate: getHijriDate(date),
    prayers,
    nextPrayer: nextPrayerInfo,
  };
}

/**
 * Get month prayer times for calendar view
 */
export function getMonthPrayerTimes(latitude, longitude, year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const times = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    times.push(calculatePrayerTimes(latitude, longitude, date));
  }

  return times;
}
