export function formatDate(dateValue) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
}

export function confidencePercent(value = 0) {
  return `${Math.round(value * 100)}%`;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

