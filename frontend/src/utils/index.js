export const formatTimeStamp = (timestamp) => {
  const date = new Date(timestamp);
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();

  const currentTime = new Date();
  const currentHour = currentTime.getUTCHours();
  const currentMinute = currentTime.getUTCMinutes();
  const currentMonth = currentTime.getUTCMonth();
  const currentDay = currentTime.getUTCDate();
  const currentYear = currentTime.getUTCFullYear();
  const hourDifference = currentHour - hours;
  const minutesDifference = currentMinute - minutes;
  const monthDifference = currentMonth - month;
  const dayDifference = currentDay - day;
  const yearDifference = currentYear - year;

  if (yearDifference > 0) {
    return `${yearDifference} ${yearDifference === 1 ? "year" : "years"} ago`;
  } else if (monthDifference > 0) {
    return `${monthDifference} ${
      monthDifference === 1 ? "month" : "months"
    } ago`;
  } else if (dayDifference > 0) {
    return `${dayDifference} ${dayDifference === 1 ? "day" : "days"} ago`;
  } else if (hourDifference > 0) {
    return `${hourDifference}h`;
  } else {
    return minutesDifference === 0 ? "Just now" : `${minutesDifference}m ago`;
  }
};
