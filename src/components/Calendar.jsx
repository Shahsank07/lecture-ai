import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Mic, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { getAllClasses, getSchedules, saveSchedule } from '../db';
import './Calendar.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function Calendar({ subjects, onNavigate }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [classes, setClasses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ subjectId: '', title: '', time: '12:00' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allC = await getAllClasses();
      const allS = await getSchedules();
      setClasses(allC);
      setSchedules(allS);
    } catch (err) {
      console.error('Error loading calendar data', err);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dateToCompare = new Date(date);
    dateToCompare.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (dateToCompare >= today) {
        setShowScheduleForm(true);
    } else {
        setShowScheduleForm(false);
    }
  };

  const closePanel = () => {
    setSelectedDate(null);
    setShowScheduleForm(false);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newSchedule.subjectId || !newSchedule.title) return;

    const [hours, minutes] = newSchedule.time.split(':');
    const scheduleDate = new Date(selectedDate);
    scheduleDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    const schedule = {
      id: crypto.randomUUID(),
      subjectId: newSchedule.subjectId,
      title: newSchedule.title,
      scheduledDate: scheduleDate.toISOString(),
      createdAt: new Date().toISOString()
    };

    await saveSchedule(schedule);
    await loadData();
    closePanel();
    setNewSchedule({ subjectId: '', title: '', time: '12:00' });
  };

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const gridDays = [];
  
  // Prev month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    gridDays.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      isCurrentMonth: false
    });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    gridDays.push({
      date: new Date(year, month, i),
      isCurrentMonth: true
    });
  }
  
  // Next month days
  const remainingCells = 42 - gridDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    gridDays.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false
    });
  }

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  };

  const getEventsForDate = (date) => {
    const dayClasses = classes.filter(c => isSameDay(new Date(c.date), date));
    const daySchedules = schedules.filter(s => isSameDay(new Date(s.scheduledDate), date));
    return { classes: dayClasses, schedules: daySchedules };
  };

  const getSubjectColor = (subjectId) => {
    const s = (subjects || []).find(sub => sub.id === subjectId);
    return s ? s.color : 'var(--google-blue)';
  };

  const getSubjectEmoji = (subjectId) => {
    const s = (subjects || []).find(sub => sub.id === subjectId);
    return s ? s.emoji : '📚';
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>{MONTHS[month]} {year}</h2>
        <div className="calendar-nav">
          <button className="today-btn" onClick={goToToday}>Today</button>
          <button onClick={prevMonth}><ChevronLeft size={20} /></button>
          <button onClick={nextMonth}><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="calendar-grid-wrapper">
        <div className="calendar-grid-header">
          {DAYS.map(day => (
            <div key={day} className="calendar-grid-header-cell">{day}</div>
          ))}
        </div>
        
        <div className="calendar-grid">
          {gridDays.map((cell, index) => {
            const events = getEventsForDate(cell.date);
            const totalEvents = events.classes.length + events.schedules.length;
            
            return (
              <div 
                key={index} 
                className={`calendar-cell ${!cell.isCurrentMonth ? 'other-month' : ''} ${isToday(cell.date) ? 'today' : ''}`}
                onClick={() => handleDateClick(cell.date)}
              >
                <div className="calendar-cell-date">{cell.date.getDate()}</div>
                <div className="calendar-event-dots">
                  {events.classes.map(c => (
                    <span key={c.id} className="calendar-event-dot" style={{ backgroundColor: getSubjectColor(c.subjectId) }}></span>
                  ))}
                  {events.schedules.map(s => (
                    <span key={s.id} className="calendar-event-dot" style={{ backgroundColor: getSubjectColor(s.subjectId), borderRadius: '2px' }}></span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="day-panel-overlay" onClick={closePanel}>
          <div className="day-panel" onClick={e => e.stopPropagation()}>
            <div className="day-panel-header">
              <h3>{selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}</h3>
              <button className="close-btn" onClick={closePanel}><X size={20} /></button>
            </div>
            
            <div className="day-panel-content">
              {(() => {
                const events = getEventsForDate(selectedDate);
                const hasEvents = events.classes.length > 0 || events.schedules.length > 0;
                
                return (
                  <>
                    {events.classes.map(c => (
                      <div key={c.id} className="session-item" onClick={() => onNavigate(`notes:${c.id}`)}>
                        <div className="session-icon"><Mic size={20} color={getSubjectColor(c.subjectId)} /></div>
                        <div className="session-info">
                          <div className="session-title">{getSubjectEmoji(c.subjectId)} {c.title || 'Untitled Session'}</div>
                          <div className="session-meta">
                            {new Date(c.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 
                            {Math.round((c.duration || 0) / 60)} min
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {events.schedules.map(s => (
                      <div key={s.id} className="session-item">
                        <div className="session-icon"><CalendarIcon size={20} color={getSubjectColor(s.subjectId)} /></div>
                        <div className="session-info">
                          <div className="session-title">{getSubjectEmoji(s.subjectId)} {s.title}</div>
                          <div className="session-meta">
                            {new Date(s.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Scheduled
                          </div>
                        </div>
                      </div>
                    ))}

                    {!hasEvents && !showScheduleForm && (
                      <div className="empty-state">No sessions on this day</div>
                    )}
                  </>
                );
              })()}

              {showScheduleForm && (
                <div style={{ marginTop: '24px' }}>
                  <h4 style={{ marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>Schedule Session</h4>
                  <form className="schedule-form" onSubmit={handleScheduleSubmit}>
                    <label>
                      Subject
                      <select 
                        value={newSchedule.subjectId} 
                        onChange={e => setNewSchedule({...newSchedule, subjectId: e.target.value})}
                        required
                      >
                        <option value="" disabled>Select a subject</option>
                        {(subjects || []).map(s => (
                          <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Title
                      <input 
                        type="text" 
                        value={newSchedule.title} 
                        onChange={e => setNewSchedule({...newSchedule, title: e.target.value})}
                        placeholder="Session title"
                        required
                      />
                    </label>
                    <label>
                      Time
                      <input 
                        type="time" 
                        value={newSchedule.time} 
                        onChange={e => setNewSchedule({...newSchedule, time: e.target.value})}
                        required
                      />
                    </label>
                    <button type="submit">Add Schedule</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
