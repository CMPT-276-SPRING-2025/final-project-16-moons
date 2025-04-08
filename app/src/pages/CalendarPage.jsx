import React, { useState, useEffect } from 'react';
import BackgroundImage from '../assets/calendar-background.jpg';
import Calendar from 'react-calendar';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import '../styles/Calendar.css';
import GoogleLogo from '../assets/Google__G__logo.svg';
import useGoogleAuth from '../components/googleAuth';

function CalendarPage() {

    // hook for google auth
    const { authorized, userName, signIn, signOut, content } = useGoogleAuth();

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [eventDetails, setEventDetails] = useState({ name: '', description: '', color: '#ff0000' });
    const [events, setEvents] = useState([]);
    const [startTime, setStartTime] = useState('00:00');
    const [endTime, setEndTime] = useState('23:59');

    ////////////* CALENDAR MANAGEMENT *//////////////

    const handleDateSelection = (date) => {
        if (!startDate) {
            setStartDate(date);
        } else if (!endDate) {
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
            start.setHours(...startTime.split(':').map(Number));
            const end = new Date(endDate);
            end.setHours(...endTime.split(':').map(Number));
            const newEvent = {
                ...eventDetails,
                color: eventDetails.color,
                startDate: start,
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

    const handleDownloadEventList = () => {
        // format event text for blob
        const eventListText = events.map((event) => {
            return `Event: ${event.name}
Description: ${event.description}
Start Date: ${event.startDate.toDateString()} ${event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
End Date: ${event.endDate.toDateString()} ${event.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
Colour: ${event.color}
---`;
        }).join('\n');

        // create a blob and download
        const blob = new Blob([eventListText], { type: 'text/plain' });
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'events.txt';
        downloadLink.click();
    };

    const handleImportEvents = (e) => {
        const file = e.target.files[0];

        // check if file is actually selected
        if (!file) return;

        // check that file is a .txt 
        if (file.type !== 'text/plain') {
            alert('Please upload a valid .txt file!');
            return;
        }

        // read from the file
        const reader = new FileReader();
        reader.onload = (event) => {
            const fileContent = event.target.result;

            try {
                // parse the file content
                const importedEvents = parseEventList(fileContent);

                // check for dupe events, don't import them
                const uniqueImportedEvents = importedEvents.filter((importedEvent) => {
                    return !events.some((existingEvent) =>
                        existingEvent.name === importedEvent.name &&
                        existingEvent.description === importedEvent.description &&
                        existingEvent.startDate.getTime() === importedEvent.startDate.getTime() &&
                        existingEvent.endDate.getTime() === importedEvent.endDate.getTime()
                    );
                });

                // import and sort events
                setEvents((prevEvents) => {
                    const updatedEvents = [
                        ...prevEvents,
                        ...uniqueImportedEvents.map(event => ({
                            ...event,
                            startDate: new Date(event.startDate),
                            endDate: new Date(event.endDate),
                        }))
                    ];

                    return updatedEvents.sort((a, b) => a.startDate - b.startDate);
                });
            } catch (error) {
                alert(`Error parsing file content: ${error.message}`);
                console.error("Import Error:", error);
            }

            e.target.value = '';
        };

        reader.readAsText(file);
    };

    const parseEventList = (fileContent) => {
        const eventSections = fileContent.split('---').map(section => section.trim()).filter(section => section.length > 0);

        return eventSections.map((section, index) => {
            const lines = section.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            
            // check if the section has the correct number of lines 
            if (lines.length < 5) {
                throw new Error(`Invalid event format at event ${index + 1}: Expected at least 5 lines.`);
            }

            // take the information
            const name = lines[0].replace('Event: ', '').trim();
            const description = lines[1].replace('Description: ', '').trim();
            const startDateStr = lines[2].replace('Start Date: ', '').trim();
            const endDateStr = lines[3].replace('End Date: ', '').trim();
            const colour = lines[4].replace('Colour: ', '').trim();

            // create the dates
            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);

            // make sure the dates are valid
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error(`Invalid date format in event ${index + 1}`);
            }

            // check if the event has a description
            if (description == 'Description:') {
                // return the event without description
                return {
                    name,
                    color: colour,
                    startDate,
                    endDate
                };
            }

            // return the event
            return {
                name,
                description,
                color: colour,
                startDate,
                endDate
            };
        });
    };

    const addEventsToGoogleCalendar = async () => {
        if (!authorized) {
            console.error("User is not authorized.");
            return;
        }
        // user's time zone
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // get all current events from google calendar, store in array
        const request = window.gapi.client.calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 2500,
            singleEvents: true,
            orderBy: 'startTime',
        });
      
        request.execute(async (resp) => {
            if (resp.error) {
                console.error('Error fetching events:', resp.error);
                return;
            }
            
            // put all imported events into an array
            const importedEvents = resp.items
                .filter((event) => {
                    const title = event.summary?.toLowerCase() || '';
                    return !title.includes('birthday') && !title.includes('holiday');
                })
                .map((event) => {
                    let startDate, endDate;
                    if (event.start.dateTime) {
                        startDate = new Date(event.start.dateTime);
                        endDate = new Date(event.end.dateTime);
                    } else {
                        startDate = new Date(event.start.date);
                        startDate.setDate(startDate.getDate() + 1);
                        startDate.setHours(0, 0);
                        endDate = new Date(event.end.date);
                        endDate.setDate(endDate.getDate());
                        endDate.setHours(23, 59);
                    }
      
                    return {
                        name: event.summary,
                        description: event.description || '',
                        color: '#425e68',
                        startDate,
                        endDate,
                    };
                });
            // loop through each event
            for (const event of events) {
                const isInCalendar = importedEvents.some((gEvent) => {
                    return (
                        event.name === gEvent.name &&
                        event.startDate.getTime() === gEvent.startDate.getTime() &&
                        event.endDate.getTime() === gEvent.endDate.getTime()
                    );
                });

                // check if the event is already in the calendar
                if(isInCalendar){
                    continue;
                }
                
                // check if the event is all day
                const isAllDay =
                    event.startDate.getHours() === 0 &&
                    event.startDate.getMinutes() === 0 &&
                    event.endDate.getHours() === 23 &&
                    event.endDate.getMinutes() === 59 &&
                    event.startDate.toDateString() === event.endDate.toDateString();

                const resource = {
                    summary: event.name,
                    description: event.description,
                    start: isAllDay ? {
                        date: event.startDate.toISOString().split('T')[0],
                    }
                    : {
                    dateTime: event.startDate.toISOString(),
                    timeZone: timeZone,
                    },
                    end: isAllDay ? {
                        date: new Date(event.endDate.getTime())
                        .toISOString()
                        .split('T')[0],
                    }
                    : {
                    dateTime: event.endDate.toISOString(),
                    timeZone: timeZone,
                    },
                }
                await new Promise((resolve, reject) => {
                    const request = window.gapi.client.calendar.events.insert({
                        calendarId: 'primary',
                        resource: resource,
                    });
                    request.execute((resp) => {
                        if (resp.error) {
                            console.error('Error creating event:', resp.error);
                            reject(resp.error);
                        } else {
                            console.log('Event created: ' + resp.htmlLink);
                            resolve(resp);
                        }
                    });
                });
            }
            alert('Events have been uploaded to your Google Calendar!');
            window.open('https://calendar.google.com/calendar', '_blank');
        });
    };

    const importEventsFromGoogleCalendar = async () => {
        // get calendar name
        const calendarName = prompt('Enter the name of the calendar to import events from.\nPress enter for primary calendar');
        let calendarId;

        if (!calendarName) { // no input, use primary calendar
            calendarId = 'primary';
        } else { // calendar name
            // get the calendar ID
            const calendarListResponse = await window.gapi.client.calendar.calendarList.list();
            if(calendarListResponse.error) {
                console.error('Error fetching calendar list:', calendarListResponse.error);
                return;
            }

            const calendarList = calendarListResponse.result.items;
            calendarId = calendarList.find(cal => cal.summary.toLowerCase() === calendarName.toLowerCase())?.id;
        }
            
        // get the events from the calendar
        const request = window.gapi.client.calendar.events.list({
            calendarId: calendarId,
            timeMin: new Date().toISOString(),
            maxResults: 2500,
            singleEvents: true,
            orderBy: 'startTime',
        });
      
        request.execute((resp) => {
            if (resp.error) {
                alert('Error finding calendar. Please check the name and try again.');
                console.error('Error fetching events:', resp.error);
                return;
            }
      
            const importedEvents = resp.items
                .filter((event) => {
                    const title = event.summary?.toLowerCase() || '';
                    return !title.includes('birthday') && !title.includes('holiday');
                })
                .map((event) => {
                    let startDate, endDate;
                    if (event.start.dateTime) {
                        startDate = new Date(event.start.dateTime);
                        endDate = new Date(event.end.dateTime);
                    } else {
                        startDate = new Date(event.start.date);
                        startDate.setDate(startDate.getDate() + 1);
                        startDate.setHours(0, 0);
                        endDate = new Date(event.end.date);
                        endDate.setDate(endDate.getDate());
                        endDate.setHours(23, 59);
                    }
      
                    return {
                        name: event.summary,
                        description: event.description || '',
                        color: '#425e68',
                        startDate,
                        endDate,
                    };
                });
      
            // Compare to avoid duplicates based on name and start time
            setEvents((prevEvents) => {
                const isDuplicate = (importedEvent) => {
                    return prevEvents.some((existing) =>
                        existing.name === importedEvent.name &&
                        existing.startDate.getTime() === importedEvent.startDate.getTime()
                    );
                };
      
                const newUniqueEvents = importedEvents.filter(e => !isDuplicate(e));
                return [...prevEvents, ...newUniqueEvents];
            });
        });
    };

    const shareCalendar = () => {
        const email = prompt('Enter the email address to share your calendar with:');
        if(!email){
            return;
        } else if(!email.includes('@')){
            alert('Please enter a valid email address!');
            return;
        }

        const resource = {
            scope: {
                type: 'user',
                value: email,
            },
            role: 'writer',
        };

        const request = window.gapi.client.calendar.acl.insert({
            calendarId: 'primary',
            resource: resource,
        });

        request.execute((resp) => {
            if (resp.error) {
                console.error('Error sharing calendar:', resp.error);
                alert('Error sharing calendar. Please try again.');
            } else {

                alert(`Calendar shared with ${email}`);
            }
        });
    };

    return (
        <div className='calendar' style={{ backgroundImage: `url(${BackgroundImage})` }}>
            <div className='headerContainer'>
                <h1>Calendar</h1>
                {authorized ? (
                    <>
                        <p className='welcomeMessage'>Welcome, {userName}</p>
                        <div className='loggedInButtons'>
                            <button onClick={signOut} className='logoutButton'>
                                Logout
                            </button>
                            <button className='addToCalendarButton' onClick={addEventsToGoogleCalendar}>
                                <CalendarMonthIcon/>
                                Add Events to Google Calendar
                            </button>
                            <button className="importFromCalendarButton" onClick={importEventsFromGoogleCalendar}>
                                <CalendarMonthIcon/>
                                Import Events from Google Calendar
                            </button>
                        </div>
                    </>
                ) : (
                    <button className='googleSignInButton' onClick={signIn}>
                        <img src={GoogleLogo} className='googleLogo' /> Sign in With Google
                    </button>
                )}
            </div>
            <div className='calendarBody'>
                <div className='calendarContainer'>
                <Calendar
                    calendarType='gregory'
                    showNeighboringMonth={false}
                    onClickDay={handleDateSelection}
                    tileClassName={({ date }) => {
                        if (startDate && endDate) {
                            const dateOnly = date.setHours(0, 0);
                            const startDateOnly = new Date(startDate).setHours(0, 0);
                            const endDateOnly = new Date(endDate).setHours(0, 0);
                            if (dateOnly >= startDateOnly && dateOnly <= endDateOnly) {
                                return 'selectedRange';
                            }
                        } else if (startDate) {
                            const dateOnly = date.setHours(0, 0);
                            const startDateOnly = new Date(startDate).setHours(0, 0);
                            if (dateOnly === startDateOnly) {
                                return 'selectedRange';
                            }
                        }
                        return '';
                    }}
                />
                </div>

                {startDate && endDate && (
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
                                    e.preventDefault();
                                    document.getElementById('hiddenColorInput').click();
                                }}
                                style={{ color: eventDetails.color }}
                            >
                                <ColorLensIcon />
                            </button>
                            <input
                                type='color'
                                id='hiddenColorInput'
                                style={{ display: 'none' }}
                                value={eventDetails.color}
                                onChange={(e) => setEventDetails({ ...eventDetails, color: e.target.value })}
                            />
                        </div>
                        <button type='submit'>Add Event</button>
                        <button type='button' onClick={handleCancel} className='cancelButton'>Cancel</button>
                    </form>
                )}

                <div className='eventsList'>
                    <div className='eventsHeader'>
                        <h2>My Events</h2>
                        {events.length > 0 && (
                            <button onClick={handleClearAllEvents} className='clearAllButton'>
                                Clear All
                            </button>
                        )}
                    </div>
                    {events.map((event, index) => (
                        <div key={index} className='eventItem' style={{ backgroundColor: event.color }}>
                            <button onClick={() => handleDeleteEvent(index)} className='deleteButton'>
                                Remove
                            </button>
                            <strong>{event.name}</strong>
                            <p>{event.description}</p>
                            <p>
                                Start: {event.startDate.toDateString()}: {event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                <br />
                                End: {event.endDate.toDateString()}: {event.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            <br />
            <div className='shareImportButtonsContainer'>
                <button className="importButton" title="Import with a text document" onClick={() => document.getElementById('fileInput').click()}>
                    Import Events
                </button>
                <input
                    type="file"
                    id="fileInput"
                    accept=".txt"
                    style={{ display: 'none' }}
                    onChange={handleImportEvents}
                />
                {events.length > 0 && (
                    <button className="exportButton" title="Export to a text document" onClick={handleDownloadEventList}>
                        Export Events
                    </button>
                )}
                {authorized && (
                    <button className="shareButton" title="Share with google" onClick={shareCalendar}>
                        Share
                    </button>
                )}
            </div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
        </div>
    );
}

export default CalendarPage;
