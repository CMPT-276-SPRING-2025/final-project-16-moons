import React, { useState } from 'react';
import BackgroundImage from '../assets/calendar-background.jpg';
import Calendar from 'react-calendar';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import '../styles/Calendar.css';

function CalendarPage() {

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [eventDetails, setEventDetails] = useState({ name: '', description: '', color: '#ff0000' });
    const [events, setEvents] = useState([]);
    const [startTime, setStartTime] = useState('00:00');
    const [endTime, setEndTime] = useState('23:59');

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
            const newEvent = {
                ...eventDetails,
                startDate: `${startDate.toDateString()} ${startTime}`, 
                endDate: `${endDate.toDateString()} ${endTime}`
            };

            const sortedEvents = [...events, newEvent].sort(
                (a, b) => new Date(a.startDate) - new Date(b.startDate)
            );
    
            setEvents(sortedEvents);
            setStartDate(null);
            setEndDate(null);
            setStartTime('');
            setEndTime('');
            setEventDetails({ name: '', description: '', color: '#2196F3' });
        }
    };

    const handleCancel = () => {
        setStartDate(null);
        setEndDate(null);
        setEventDetails({ name: '', description: '', color: '#ff0000' });
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
                    /* EVENT FORM*/
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
                        <div className='timePickerContainer'>
                            <div className='startTime'>
                                <label htmlFor='startTime'>Start time:</label>
                                <input
                                    type='time'
                                    id='startTime'
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                            </div>
                            <div className='endTime'>
                                <label htmlFor='endTime'>End time:</label>
                                <input
                                    type='time'
                                    id='endTime'
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
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
                        <button type='button' onClick={handleCancel} className='cancelButton'>Cancel</button>
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