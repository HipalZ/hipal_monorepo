const FOUR_HOURS_IN_MS = 4 * 60 * 60 * 1000;
const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30

const isTodayIST = (timestamp: number) => {
  // Convert to IST by adding UTC offset difference
  const nowIST = Date.now() + IST_OFFSET;
  const inputIST = timestamp + IST_OFFSET;

  // Compare dates in IST
  return new Date(nowIST).toDateString() === new Date(inputIST).toDateString();
};

export function adjustFromToTimestamps(from: number, to: number) {
  const adjustedFrom = from;
  let adjustedTo = to;

  if (isTodayIST(from) && isTodayIST(to)) {
    console.log("to", adjustedTo);
    adjustedTo = to + 14400000;
  }

  console.log("from", adjustedFrom);
  console.log("to", adjustedTo);

  return { adjustedFrom, adjustedTo };
}
