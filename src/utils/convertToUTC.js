export function convertToUTC(dateString) {
  // Split the date string into its components
  const [year, month, day, hour, minute, second] = dateString
    .split('-')
    .map(Number);

  // Create a Date object from the components (local time assumed)
  const localDate = new Date(year, month - 1, day, hour, minute, second);

  // Convert to UTC components
  const yearUTC = localDate.getUTCFullYear();
  const monthUTC = String(localDate.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-indexed in JS
  const dayUTC = String(localDate.getUTCDate()).padStart(2, '0');
  const hourUTC = String(localDate.getUTCHours()).padStart(2, '0');
  const minuteUTC = String(localDate.getUTCMinutes()).padStart(2, '0');
  const secondUTC = String(localDate.getUTCSeconds()).padStart(2, '0');

  // Return the UTC date string in the same format
  return `${yearUTC}-${monthUTC}-${dayUTC}-${hourUTC}-${minuteUTC}-${secondUTC}`;
}
