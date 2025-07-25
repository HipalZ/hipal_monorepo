function adjustTimestampTo4AM(timestamp:number) {
  const date = new Date(timestamp);
  
  // Set the time to 4:00 AM
  date.setHours(4, 0, 0, 0);
  
  return date.getTime(); // Return the adjusted timestamp in milliseconds
}

function adjustFromToTimestamps(from:number, to:number) {
  const adjustedFrom = adjustTimestampTo4AM(from);
  
  // For `to`, add 4 hours to the original timestamp and then set the time to 4 AM.
  const adjustedTo = adjustTimestampTo4AM(to + 4 * 60 * 60 * 1000); // Add 4 hours to `to`
  
  return { adjustedFrom, adjustedTo };
}

export default adjustFromToTimestamps