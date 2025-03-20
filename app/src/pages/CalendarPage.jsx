import React from 'react';
import BackgroundImage from '../assets/calendar-background.jpg';
import Calendar from 'react-calendar';
import '../styles/Calendar.css';

function CalendarPage() {
  return (
    <div className='calendar' style={{ backgroundImage: `url(${BackgroundImage})`}}>
        <div className='headerContainer'>
            <h1>Calendar</h1>
        </div>
        <div className='calendarContainer'>
            <Calendar calendarType='gregory'/>
        </div>
    </div>
  )
}

export default CalendarPage