// Generator proponowanych terminów oglądania — iteracja 9.
// Prototyp miał 3 twarde daty ("Środa, 14 maja..."), które starzeją się
// natychmiast. Tu liczymy realne najbliższe terminy względem dzisiaj:
// 2 nadchodzące dni robocze (wieczorem) + najbliższa sobota (rano).

const WEEKDAY_NAMES = [
  "Niedziela",
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
];

const MONTH_NAMES = [
  "stycznia",
  "lutego",
  "marca",
  "kwietnia",
  "maja",
  "czerwca",
  "lipca",
  "sierpnia",
  "września",
  "października",
  "listopada",
  "grudnia",
];

function formatSlot(date: Date, time: string): string {
  return `${WEEKDAY_NAMES[date.getDay()]}, ${date.getDate()} ${MONTH_NAMES[date.getMonth()]} · ${time}`;
}

export function generateViewingSlots(): string[] {
  const slots: string[] = [];
  const eveningTimes = ["17:00", "18:30"];

  let cursor = new Date();
  let weekdaysFound = 0;
  while (weekdaysFound < 2) {
    cursor = new Date(cursor.getTime() + 86_400_000);
    const day = cursor.getDay();
    if (day >= 1 && day <= 5) {
      slots.push(formatSlot(cursor, eveningTimes[weekdaysFound]));
      weekdaysFound++;
    }
  }

  let saturday = new Date();
  do {
    saturday = new Date(saturday.getTime() + 86_400_000);
  } while (saturday.getDay() !== 6);
  slots.push(formatSlot(saturday, "11:00"));

  return slots;
}
