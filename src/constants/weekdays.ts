// Single source of truth for weekday options across the app - previously
// duplicated independently in ~9 files in three different formats (full
// names, "Mon"/"Tue" abbreviations, and "MON"/"TUE" caps) with two different
// day-orders (Monday-first vs Sunday-first). Every UI that needs a weekday
// list or label should import from here instead of re-declaring one.
export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

// Sunday-first order, for the few calendar-grid UIs that lay out Sun..Sat.
export const WEEKDAYS_SUNDAY_FIRST: Weekday[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const WEEKDAY_ABBREVIATIONS: Record<Weekday, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

export const WEEKDAY_ABBREVIATIONS_CAPS: Record<Weekday, string> = {
  Monday: "MON",
  Tuesday: "TUE",
  Wednesday: "WED",
  Thursday: "THU",
  Friday: "FRI",
  Saturday: "SAT",
  Sunday: "SUN",
};

export const WEEKDAYS_ABBREVIATED = WEEKDAYS.map((day) => WEEKDAY_ABBREVIATIONS[day]);
export const WEEKDAYS_SUNDAY_FIRST_ABBREVIATED = WEEKDAYS_SUNDAY_FIRST.map((day) => WEEKDAY_ABBREVIATIONS_CAPS[day]);
