
import { WEEKDAYS } from '../types';

interface WeekdaySelectorProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
}

export default function WeekdaySelector({
  selectedDays,
  onChange,
}: WeekdaySelectorProps) {
  function toggleDay(day: number) {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day].sort((a, b) => a - b));
    }
  }

  return (
    <div className="weekday-selector">
      {WEEKDAYS.map(({ label, value }) => (
        <button
          key={value}
          type="button"
          aria-pressed={selectedDays.includes(value)}
          onClick={() => toggleDay(value)}
          className={
            selectedDays.includes(value)
              ? 'weekday-button selected'
              : 'weekday-button'
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}

