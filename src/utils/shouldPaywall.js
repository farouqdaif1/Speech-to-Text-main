export default function shouldPaywall(created_date, period_end_ts) {
  // Parse the date string
  const parts = created_date.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JavaScript months are zero-indexed
  const day = parseInt(parts[2], 10);
  const hour = parseInt(parts[3], 10);
  const minute = parseInt(parts[4], 10);
  const second = parseInt(parts[5], 10);

  // Create a date object from parts
  const date = new Date(year, month, day, hour, minute, second);

  // Get the date 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Initially check if the date is older than 30 days
  let trialExpired = date < thirtyDaysAgo;
  let subscriptionExpired = true;
  // If period_end_ts is defined and not null, also check the current time against it
  if (period_end_ts != null) {
    const currentTime = new Date().getTime(); // Get current time in milliseconds
    const periodEndMs = period_end_ts * 1000; // Convert period_end_ts from seconds to milliseconds
    subscriptionExpired = currentTime > periodEndMs;
  }

  return trialExpired && subscriptionExpired;
}
