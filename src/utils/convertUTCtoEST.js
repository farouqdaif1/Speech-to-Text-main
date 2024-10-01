export function convertUTCtoEST(timeStr) {
  // Split the input time string into hours and minutes
  let [hours, minutes] = timeStr.split(':').map(Number);

  // Subtract 5 hours to convert to EST (UTC-5)
  hours -= 4;

  // Handle wrap-around if hours go below 0 (e.g., midnight)
  if (hours < 0) {
    hours += 24; // Wrap around to the previous day
  }

  // Format hours and minutes to always be two digits
  let estHours = hours < 10 ? '0' + hours : hours;
  let estMinutes = minutes < 10 ? '0' + minutes : minutes;

  // Return the formatted time string in EST
  return `${estHours}:${estMinutes}`;
}
