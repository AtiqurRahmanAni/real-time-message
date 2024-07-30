export const formatTimeStamp = (timestamp) => {
  const prevDate = new Date(timestamp);
  const currDate = new Date();

  const prevDateUTC = Date.UTC(
    prevDate.getUTCFullYear(),
    prevDate.getUTCMonth(),
    prevDate.getUTCDate(),
    prevDate.getUTCHours(),
    prevDate.getUTCMinutes(),
    prevDate.getUTCSeconds()
  );
  const currDateUTC = Date.UTC(
    currDate.getUTCFullYear(),
    currDate.getUTCMonth(),
    currDate.getUTCDate(),
    currDate.getUTCHours(),
    currDate.getUTCMinutes(),
    currDate.getUTCSeconds()
  );

  const diffMillis = currDateUTC - prevDateUTC;

  // if the difference is greater than a year
  if (diffMillis >= 31556952000) {
    const year = Math.round(diffMillis / 31556952000);
    return `${year} ${year > 1 ? "years" : "year"} ago`;
  } else if (diffMillis >= 2629746000) {
    const month = Math.round(diffMillis / 2629746000);
    return `${month} ${month > 1 ? "months" : "month"} ago`;
  } else if (diffMillis >= 86400000) {
    const day = Math.round(diffMillis / 86400000);
    return `${day} ${day > 1 ? "days" : "day"} ago`;
  } else if (diffMillis >= 3600000) {
    const hour = Math.round(diffMillis / 3600000);
    return `${hour} ${hour > 1 ? "hours" : "hour"} ago`;
  } else if (diffMillis >= 60000) {
    const minute = Math.round(diffMillis / 60000);
    return `${minute} ${minute > 1 ? "mins" : "min"} ago`;
  } else {
    return "Just Now";
  }
};

export const playNotification = (sound) => {
  try {
    if (typeof Audio !== "undefined") {
      const audio = new Audio(sound);
      audio.play().catch((error) => {
        console.error("Error playing sound:", error);
      });
    } else {
      console.error("Audio API is not supported in this browser.");
    }
  } catch (err) {
    console.error("Error playing sound:", error);
  }
};

export const generateRandomNumber = (limit) => {
  return Math.floor(Math.random() * (limit + 1));
};
