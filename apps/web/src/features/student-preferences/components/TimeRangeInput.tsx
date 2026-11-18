
interface TimeRangeInputProps {
  startTime: string;
  endTime: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
}

export default function TimeRangeInput({
  startTime,
  endTime,
  onStartChange,
  onEndChange,
}: TimeRangeInputProps) {
  return (
    <div className="time-range">
      <input
        type="time"
        aria-label="Start time"
        value={startTime}
        onChange={(e) => onStartChange(e.target.value)}
      />

      <span aria-hidden="true">—</span>

      <input
        type="time"
        aria-label="End time"
        value={endTime}
        onChange={(e) => onEndChange(e.target.value)}
      />
    </div>
  );
}

