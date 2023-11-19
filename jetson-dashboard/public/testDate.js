const timestamp = 1668847200; // Replace with your timestamp if needed

function formatDate(timestamp, locale) {
  const date = new Date(timestamp * 1000);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  return (
    date.toLocaleDateString(locale, options) +
    " " +
    date.toLocaleTimeString(locale, options)
  );
}

console.log("Default Locale:", formatDate(timestamp));
console.log("US Locale:     ", formatDate(timestamp, "en-US"));
console.log("UK Locale:     ", formatDate(timestamp, "en-GB"));
console.log("Japanese Locale:", formatDate(timestamp, "ja-JP"));
console.log("ISO String:    ", new Date(timestamp * 1000).toISOString());
