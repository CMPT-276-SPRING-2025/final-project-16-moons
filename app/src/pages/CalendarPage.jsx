import React, { useState } from 'react';
import BackgroundImage from '../assets/calendar-background.jpg';
import Calendar from 'react-calendar';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import '../styles/Calendar.css';
import GoogleLogo from '../assets/Google__G__logo.svg'

import { signInWithGoogle } from '../firebase/firebase';

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
            const start = new Date(startDate);
            start.setHours(...startTime.split(':').map(Number)); // set hrs and mins
    
            const end = new Date(endDate);
            end.setHours(...endTime.split(':').map(Number)); // set hrs and mins
    
            const newEvent = {
                ...eventDetails,
                color: eventDetails.color,
                startDate: start,  // stores as 'Date' object
                endDate: end
            };
    
            const sortedEvents = [...events, newEvent].sort(
                (a, b) => new Date(a.startDate) - new Date(b.startDate)
            );
    
            setEvents(sortedEvents);
            setStartDate(null);
            setEndDate(null);
            setStartTime('00:00');
            setEndTime('23:59');
            setEventDetails({ name: '', description: '', color: '#ff0000' });
        }
    };

    const handleCancel = () => {
        setStartDate(null);
        setEndDate(null);
        setEventDetails({ name: '', description: '', color: '#ff0000' });
    };

    const handleDeleteEvent = (index) => {
        setEvents(events.filter((_, i) => i !== index));
    };

    const handleClearAllEvents = () => {
        setEvents([]);
    };

    return (
        <div className='calendar' style={{ backgroundImage: `url(${BackgroundImage})` }}>
            <div className='headerContainer'>
                <h1>Calendar</h1>
                <button className='googleSignInButton' onClick={signInWithGoogle}>
                    <img className='googleLogo' src={GoogleLogo} /> Sign in With Google
                </button>
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
                            <button
                                type='button'
                                className='colorButton'
                                onClick={(e) => {
                                    e.preventDefault(); // Prevents accidental submission
                                    document.getElementById('hiddenColorInput').click();
                                }}
                                style={{ color: eventDetails.color }}
                            >
                                <ColorLensIcon />
                            </button>
                            <input
                                type='color'
                                id='hiddenColorInput'
                                style={{ display: 'none' }} // hide input field
                                value={eventDetails.color}
                                onChange={(e) => setEventDetails({ ...eventDetails, color: e.target.value })}
                            />
                        </div>
                        <button type='submit'>Add Event</button>
                        <button type='button' onClick={handleCancel} className='cancelButton'>Cancel</button>
                    </form>
                )}

                <div className='eventsList'>
                    {/* <h2>My Events</h2> */}
                    <div className='eventsHeader'>
                        <h2>My Events</h2>
                        {events.length > 0 && (
                            <button onClick={handleClearAllEvents} className='clearAllButton'>
                                Clear All
                            </button>
                        )}
                    </div>
                    {events.map((event, index) => (
                        <div
                            key={index}
                            className='eventItem'
                            style={{ backgroundColor: event.color }}
                        >
                            <button
                                onClick={() => handleDeleteEvent(index)}
                                className='deleteButton'
                            >
                                Remove
                            </button>   
                            <strong>{event.name}</strong>
                            <p>{event.description}</p>
                            <p>
                                Start: {event.startDate.toDateString()}: {event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                <br/>
                                End: {event.endDate.toDateString()}: {event.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CalendarPage