'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { DAY_LABELS, HOURS_IN_DAY } from '../types';
import { formatHourLabel } from '../week';

const HOUR_HEIGHT_PX = 48;
const FIRST_VISIBLE_HOUR = 8;

const HOURS = Array.from({ length: HOURS_IN_DAY }, (_, hour) => hour);

export default function WeekGrid() {
  const scrollRef = useRef<HTMLElement>(null);

  // All 24 hours are rendered, but open the grid scrolled to the morning.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = FIRST_VISIBLE_HOUR * HOUR_HEIGHT_PX;
    }
  }, []);

  return (
    <section
      ref={scrollRef}
      className="week-grid"
      aria-label="Week calendar"
      style={{ '--hour-height': `${HOUR_HEIGHT_PX}px` } as CSSProperties}
    >
      <div className="week-grid-header">
        <div className="week-grid-gutter" aria-hidden="true" />

        <ol className="week-grid-days" aria-label="Days of the week">
          {DAY_LABELS.map((day) => (
            <li key={day}>{day}</li>
          ))}
        </ol>
      </div>

      <div className="week-grid-body">
        <ol className="week-grid-hours" aria-label="Hours">
          {HOURS.map((hour) => (
            <li key={hour}>{formatHourLabel(hour)}</li>
          ))}
        </ol>

        <div className="week-grid-columns">
          {DAY_LABELS.map((day) => (
            <div key={day} className="week-grid-column" data-day={day} />
          ))}
        </div>
      </div>
    </section>
  );
}
