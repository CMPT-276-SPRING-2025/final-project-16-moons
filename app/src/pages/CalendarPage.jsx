import React, { useState } from 'react';
import BackgroundImage from '../assets/calendar-background.jpg';
import Calendar from 'react-calendar';
import '../styles/Calendar.css';

function CalendarPage() {

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [eventDetails, setEventDetails] = useState({ name: '', description: '', color: '#ff0000' });
    const [events, setEvents] = useState([]);

    const handleDateSelection = (date) => {
        if (!startDate) {
            setStartDate(date);
        } else if (!endDate) {
            // swap dates if second selection date is earlier
            if (date < startDate) {
                setEndDate(startDate);
                setStartDate(date);
            } else {
                setEndDate(date);
            }
        }
    };

    const handleEventSubmit = (e) => {
        e.preventDefault();
        if (startDate && endDate) {
            const newEvent = { ...eventDetails, startDate, endDate };
            setEvents([...events, newEvent]);
            setStartDate(null);
            setEndDate(null);
            setEventDetails({ name: '', description: '', color: '#2196F3' });
        }
    };

    return (
        <div className='calendar' style={{ backgroundImage: `url(${BackgroundImage})` }}>
            <div className='headerContainer'>
                <h1>Calendar</h1>
            </div>
            <div className='calendarBody'>
                <div className='calendarContainer'>
                    <Calendar
                        calendarType='gregory'
                        showNeighboringMonth={false}
                        onClickDay={handleDateSelection}
                        tileClassName={({ date }) =>
                            (startDate && date.toDateString() === startDate.toDateString()) ||
                                (endDate && date.toDateString() === endDate.toDateString())
                                ? 'selectedDate'
                                : ''
                        }
                    />
                </div>

                {startDate && endDate && (
                    /* date forms*/
                    <form className='eventForm' onSubmit={handleEventSubmit}>
                        <input
                            type='text'
                            placeholder='Event Name'
                            value={eventDetails.name}
                            onChange={(e) => setEventDetails({ ...eventDetails, name: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder='Event Description'
                            value={eventDetails.description}
                            onChange={(e) => setEventDetails({ ...eventDetails, description: e.target.value })}
                        />
                        <div className='colorPickerContainer'>
                            <label htmlFor='eventColor'>Click to select colour:</label>
                            <input
                                type='color'
                                value={eventDetails.color}
                                // copy eventDetails into new object, set color to user selection, replace old object
                                onChange={(e) => setEventDetails({ ...eventDetails, color: e.target.value })}
                            />
                        </div>
                        <button type='submit'>Add Event</button>

                    </form>
                )}

                <div className='eventsList'>
                    <h2>My Events</h2>
                    {events.map((event, index) => (
                        <div
                            key={index}
                            className='eventItem'
                            style={{ backgroundColor: event.color }}
                        >
                            <strong>{event.name}</strong>
                            <p>{event.description}</p>
                            <p>
                                {event.startDate.toDateString()} - {event.endDate.toDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CalendarPage