import React, { useState } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Calendar.css';

const Calendar = (props) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const startDay = startOfMonth.day();
  const daysInMonth = currentDate.daysInMonth();
  const dateObj = new Date(props.data);

  const today = dateObj;
  console.log(today);
  

  const generateDates = () => {
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(dayjs(currentDate).date(i));
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => prev.subtract(1, 'month'));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => prev.add(1, 'month'));
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={goToPreviousMonth}>
          <ChevronLeft size={20} />
        </button>
        <h2 className="calendar-title">{currentDate.format('MMMM YYYY')}</h2>
        <button onClick={goToNextMonth}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="calendar-days">
        {generateDates().map((date, index) => (
          <div
            key={index}
            className={`calendar-day
              ${!date ? 'invisible' : ''}
              ${date && date.isSame(today, 'day') ? 'today' : ''}`}
          >
            {date ? date.date() : ''}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
