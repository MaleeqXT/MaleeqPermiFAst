export const displayDate = (date) => {
  const parts = String(date || "").slice(0, 10).split("-");
  return parts.length === 3 ? parts.reverse().join("/") : "—";
};

export const FORMATION_DURATIONS = [
  { minutes: 45, label: "45 minutes" },
  { minutes: 60, label: "1 heure" },
  { minutes: 75, label: "1h 15min" },
  { minutes: 90, label: "1h 30min" },
  { minutes: 105, label: "1h 45min" },
  { minutes: 120, label: "2 heures" },
  { minutes: 150, label: "2h 30min" },
  { minutes: 180, label: "3 heures" },
  { minutes: 210, label: "3h 30min" },
  { minutes: 240, label: "4 heures" },
  { minutes: 270, label: "4h 30min" },
  { minutes: 300, label: "5 heures" },
];

export const formatDuration = (minutes) => {
  const numericMinutes = Number(minutes);
  return FORMATION_DURATIONS.find((duration) => duration.minutes === numericMinutes)?.label
    ?? (numericMinutes % 60 === 0 ? `${numericMinutes / 60} heure${numericMinutes === 60 ? "" : "s"}` : `${numericMinutes} minutes`);
};