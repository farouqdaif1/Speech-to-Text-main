export function formatTimeStamp(date) {
  // Function to pad single-digit numbers with a leading zero
  const pad = (n) => (n < 10 ? '0' + n : n);

  // Define the EST time zone
  const timeZone = 'UTC';

  // Convert the date to EST
  const options = {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(date);

  // Extract the components
  const year = parts.find((part) => part.type === 'year').value;
  const month = parts.find((part) => part.type === 'month').value;
  const day = parts.find((part) => part.type === 'day').value;
  const hours = parts.find((part) => part.type === 'hour').value;
  const minutes = parts.find((part) => part.type === 'minute').value;
  const seconds = parts.find((part) => part.type === 'second').value;

  // Format the date components into the desired format
  return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}
