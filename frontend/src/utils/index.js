import toast from "react-hot-toast";

const MAX_ATTACHMENT_SIZE = 2 * 1024 * 1024;

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
    console.error("Error playing sound:", err);
  }
};

export const generateRandomNumber = (limit) => {
  return Math.floor(Math.random() * (limit + 1));
};

export const onAttachmentSelect = (e) => {
  const attachments = e.target.files;

  if (attachments.length > 6) {
    toast.error("You can not add more than 6 attachments");
    return null;
  }
  if (attachments.length > 0) {
    let temp = [];
    for (const attachment of attachments) {
      if (attachment.size <= MAX_ATTACHMENT_SIZE) {
        temp.push(attachment);
      }
    }
    return temp;
  }
  return null;
};

export const handlePaste = (e) => {
  const attachments = e.clipboardData.items;
  let temp = [];
  for (const attachment of attachments) {
    if (attachment.kind === "file") {
      const file = attachment.getAsFile();
      if (file.size <= MAX_ATTACHMENT_SIZE && file.type.startsWith("image/")) {
        temp.push(file);
      }
    }
  }

  if (temp.length > 6) {
    toast.error("You can not add more than 6 attachments");
    return null;
  }

  return temp;
};

export const handleDrop = (e) => {
  e.preventDefault();
  const attachments = e.dataTransfer.files;
  let temp = [];
  for (const attachment of attachments) {
    if (
      attachment.size <= MAX_ATTACHMENT_SIZE &&
      attachment.type.startsWith("image/")
    ) {
      temp.push(attachment);
    }
  }

  if (temp.length > 6) {
    toast.error("You can not add more than 6 attachments");
    return null;
  }
  return temp;
};
