export const NOTE_COLORS = {
  yellow: {
    value: "#fffa75",
    label: "노랑",
  },
  green: {
    value: "#d6ffd6",
    label: "초록",
  },
  pink: {
    value: "#ffd6f0",
    label: "핑크",
  },
  purple: {
    value: "#e6d6ff",
    label: "보라",
  },
  blue: {
    value: "#d6e6ff",
    label: "파랑",
  },
};

export const NOTE_COLOR_OPTIONS = Object.entries(NOTE_COLORS).map(
  ([key, {value, label}]) => ({
    name: key,
    value,
    label,
  })
);
