import {useCallback, useEffect, useRef, useState, type FormEvent} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import {CalendarDays, ChevronLeft, ChevronRight, Clock, Check, RefreshCw} from 'lucide-react';
import {brand} from '../brand';
import {useDashboard} from '../dashboard/DashboardProvider';
import {ScheduleError, scheduleRequest, useAppointments, type Appointment, type Availability} from './AppointmentProvider';
import {SERVICE_TYPES, SCHEDULE_TIMEZONE, appointmentTimes, isSlotAvailable, isWorkingDate, scheduleDate, timeToMinutes, minutesToTime, overlapsBusy} from './scheduleRules';
import './schedule.css';

const dateLabel = (date: string, options: Intl.DateTimeFormatOptions = {weekday: 'long', month: 'long', day: 'numeric'}) => new Date(`${date}T12:00:00+01:00`).toLocaleDateString('en-GB', {...options, timeZone: SCHEDULE_TIMEZONE});
const addDays = (date: string, days: number) => new Date(new Date(`${date}T12:00:00Z`).getTime() + days * 86400000).toISOString().slice(0, 10);
const initialDate = () => {let date = scheduleDate(); while (!isWorkingDate(date)) date = addDays(date, 1); return date;};
const validDate = (value: string | null): value is string => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const monthLabel = (month: string) => new Date(`${month}-15T12:00:00Z`).toLocaleDateString('en-GB', {month: 'long', year: 'numeric'});

export default function SchedulePage({embedded = false}: {embedded?: boolean}) {
  const [params] = useSearchParams();
  const {state, logActivity} = useDashboard();
  const {appointments, createBooking, cancelBooking, rescheduleBooking, refresh, error: appointmentError, storageWarning} = useAppointments();
  const [serviceName, setServiceName] = useState<string>(SERVICE_TYPES.some(service => service.name === params.get('type')) ? params.get('type')! : SERVICE_TYPES[0].name);
  const [date, setDate] = useState(validDate(params.get('date')) ? params.get('date')! : initialDate());
  const [month, setMonth] = useState(date.slice(0, 7));
  const [time, setTime] = useState('');
  const [view, setView] = useState<'month' | 'week' | 'agenda'>('month');
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState('');
  const [name, setName] = useState(state.displayName);
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [confirmation, setConfirmation] = useState<Appointment | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const requestId = useRef(0);
  const service = SERVICE_TYPES.find(item => item.name === serviceName) ?? SERVICE_TYPES[0];
  useEffect(() => {
    const requestedType = params.get('type');
    const requestedDate = params.get('date');
    if (SERVICE_TYPES.some(item => item.name === requestedType)) setServiceName(requestedType!);
    if (validDate(requestedDate)) {setDate(requestedDate); setMonth(requestedDate.slice(0, 7));}
    setTime('');
  }, [params]);
  const loadAvailability = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const data = await scheduleRequest<Availability>(`/availability?month=${encodeURIComponent(month)}`);
      if (!Array.isArray(data.busy) || !Number.isFinite(new Date(data.serverNow).getTime())) throw Error('Invalid schedule');
      if (id === requestId.current) {setAvailability(data); setScheduleError('');}
    } catch (error) {
      if (id === requestId.current) {setAvailability(null); setScheduleError(error instanceof Error ? error.message : 'The schedule is temporarily unavailable.');}
    } finally {if (id === requestId.current) setLoading(false);}
  }, [month]);
  useEffect(() => {
    setAvailability(null);
    void loadAvailability();
    const interval = window.setInterval(() => {void loadAvailability();}, 30000);
    const onFocus = () => {void loadAvailability();};
    window.addEventListener('focus', onFocus);
    return () => {requestId.current++; clearInterval(interval); window.removeEventListener('focus', onFocus);};
  }, [loadAvailability]);
  const times = appointmentTimes(service.durationMinutes);
  const busy = (availability?.busy ?? []).filter(interval => !(editing && interval.date === editing.date && interval.start === editing.time && interval.end === minutesToTime(timeToMinutes(editing.time) + editing.durationMinutes)));
  const canUse = (selectedDate: string, selectedTime: string) => !!availability && !loading && !scheduleError && isSlotAvailable(selectedDate, selectedTime, service.durationMinutes, busy, new Date(availability.serverNow));
  const availableOn = (selectedDate: string) => !!availability && times.some(slot => isSlotAvailable(selectedDate, slot, service.durationMinutes, busy, new Date(availability.serverNow)));
  useEffect(() => {setTime('');}, [date, serviceName]);
  const selectDate = (next: string) => {if (!validDate(next)) return; setDate(next); if (next.slice(0, 7) !== month) setMonth(next.slice(0, 7)); setFeedback('');};
  const changeMonth = (offset: number) => {
    const next = new Date(`${month}-15T12:00:00Z`); next.setUTCMonth(next.getUTCMonth() + offset);
    setMonth(next.toISOString().slice(0, 7)); setTime('');
  };
  const firstDay = `${month}-01`;
  const offset = (new Date(`${firstDay}T12:00:00Z`).getUTCDay() + 6) % 7;
  const monthCells = Array.from({length: 42}, (_, index) => addDays(firstDay, index - offset));
  const weekStart = addDays(date, -((new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7));
  const shownDays = view === 'week' ? Array.from({length: 7}, (_, index) => addDays(weekStart, index)) : monthCells;
  const now = availability ? new Date(availability.serverNow) : new Date();
  const today = scheduleDate(now);
  const active = appointments.filter(item => item.status === 'confirmed');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canUse(date, time)) {setFeedback('Choose an available date and time.'); return;}
    setPending(true); setFeedback(''); setConfirmation(null);
    try {
      const result = editing ? await rescheduleBooking(editing.reference, {date, time}) : await createBooking({type: service.name, date, time, name: name.trim(), email: email.trim(), notes: notes.trim()});
      setConfirmation(result); setEditing(null); setTime('');
      setFeedback(`Appointment ${editing ? 'rescheduled' : 'reserved'}. Your reference is ${result.reference}.`);
      logActivity({kind: 'booking', title: `${editing ? 'Rescheduled' : 'Reserved'} ${result.type}`, path: '/dashboard/bookings'});
      await loadAvailability();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'The appointment could not be reserved.');
      if (error instanceof ScheduleError && error.status === 409) {setTime(''); await loadAvailability();}
    } finally {setPending(false);}
  }
  function editAppointment(appointment: Appointment) {
    setEditing(appointment); setServiceName(appointment.type); setName(appointment.name); setEmail(appointment.email); setNotes(appointment.notes);
    selectDate(appointment.date); setConfirmation(null);
    document.getElementById('appointment-form')?.scrollIntoView({behavior: 'smooth', block: 'start'});
  }
  async function cancel(appointment: Appointment) {
    setPending(true);
    try {
      await cancelBooking(appointment.reference); setCancelId(null);
      if (editing?.reference === appointment.reference) setEditing(null);
      if (confirmation?.reference === appointment.reference) setConfirmation(null);
      setFeedback('Appointment cancelled. The time is available for another booking.');
      logActivity({kind: 'booking', title: `Cancelled ${appointment.type}`, path: '/dashboard/bookings'});
      await loadAvailability();
    } catch (error) {setFeedback(error instanceof Error ? error.message : 'The appointment could not be cancelled.');}
    finally {setPending(false);}
  }
  function dayButton(day: string, compact = false) {
    const occupied = busy.filter(interval => interval.date === day).length;
    const open = availableOn(day);
    const outside = day.slice(0, 7) !== month;
    return <button key={day} type="button" className={`schedule-day${date === day ? ' is-selected' : ''}${occupied ? ' has-bookings' : ''}${outside ? ' is-outside' : ''}${day === today ? ' is-today' : ''}`} disabled={loading || !open || (view === 'month' && outside)} aria-pressed={date === day} aria-label={`${dateLabel(day)}${occupied ? `, ${occupied} occupied appointment ${occupied === 1 ? 'time' : 'times'}` : ''}${!open ? ', unavailable' : ', available'}`} onClick={() => selectDate(day)} data-date={day}>
      {compact && <small>{dateLabel(day, {weekday: 'short'})}</small>}<span>{Number(day.slice(-2))}</span>{occupied > 0 && <i aria-hidden="true"/>}{compact && <em>{!open ? 'Unavailable' : occupied ? 'Limited times' : 'Available'}</em>}
    </button>;
  }

  return <div className={`schedule-page${embedded ? ' schedule-page--embedded' : ''}`}><div className="schedule-container">
    <header className="schedule-heading"><div><p className="schedule-kicker">Appointments & schedule</p><h1>{embedded ? 'Your time, thoughtfully planned.' : 'Make time for what comes next.'}</h1><p>Choose a conversation, find an open time, and reserve your appointment with {brand.name}.</p></div><div className="schedule-timezone"><Clock size={16}/><span>West Africa Time<br/><strong>Africa/Lagos · UTC+1</strong></span></div></header>
    <div className="schedule-summary"><div><span className="schedule-summary-icon"><CalendarDays size={19}/></span><p><strong>{active.length}</strong> your confirmed {active.length === 1 ? 'appointment' : 'appointments'}</p></div><p>Monday–Friday · 9:00–17:00 · Book at least 2 hours ahead</p><Link to={embedded ? '/contact?topic=Booking' : '/dashboard/bookings'}>{embedded ? 'Need help?' : 'My appointments'}</Link></div>
    <div className="schedule-layout"><section className="schedule-calendar-panel" aria-label="Appointment calendar">
      <div className="schedule-calendar-toolbar"><div><p className="schedule-kicker">Find your time</p><h2>{monthLabel(month)}</h2></div><div className="schedule-view-options" role="group" aria-label="Calendar view">{(['month', 'week', 'agenda'] as const).map(value => <button key={value} type="button" aria-pressed={view === value} onClick={() => setView(value)}>{value.charAt(0).toUpperCase() + value.slice(1)}</button>)}</div></div>
      <div className="schedule-month-controls"><button type="button" aria-label={view === 'week' ? 'Previous week' : 'Previous month'} onClick={() => view === 'week' ? selectDate(addDays(date, -7)) : changeMonth(-1)}><ChevronLeft size={17}/></button><button type="button" onClick={() => {setMonth(today.slice(0, 7)); selectDate(today);}}>Today</button><button type="button" aria-label={view === 'week' ? 'Next week' : 'Next month'} onClick={() => view === 'week' ? selectDate(addDays(date, 7)) : changeMonth(1)}><ChevronRight size={17}/></button><button type="button" className="schedule-refresh" onClick={() => {void loadAvailability();}} aria-label="Refresh appointment availability"><RefreshCw size={15}/></button></div>
      {scheduleError && <div className="schedule-alert" role="status"><strong>Schedule unavailable</strong><p>{scheduleError} Times cannot be reserved until availability is checked.</p><button type="button" onClick={() => {void loadAvailability();}}>Try again</button></div>}
      {view === 'month' && <><div className="schedule-weekdays" aria-hidden="true">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <span key={day}>{day}</span>)}</div><div className="schedule-month-grid" aria-busy={loading}>{shownDays.map(day => dayButton(day))}</div></>}
      {view === 'week' && <div className="schedule-week-grid" aria-busy={loading}>{shownDays.map(day => dayButton(day, true))}</div>}
      {view === 'agenda' && <div className="schedule-agenda"><h3>Occupied times this month</h3>{!loading && availability && !busy.length ? <p>No reservations yet this month. Choose a date below to see open times.</p> : busy.map((interval, index) => <div key={`${interval.date}-${index}`}><span>{dateLabel(interval.date, {month: 'short', day: 'numeric'})}</span><i/><div><strong>Reserved appointment</strong><p>{interval.start}–{interval.end} WAT</p></div><span className="schedule-busy-label">Taken</span></div>)}<label htmlFor="agenda-date">Choose a date</label><input type="date" id="agenda-date" value={date} onChange={event => {if (event.target.value) selectDate(event.target.value);}}/></div>}
      <div className="schedule-legend"><span><i className="legend-selected"/>Selected</span><span><i className="legend-occupied"/>Contains occupied times</span><span><i className="legend-unavailable"/>Unavailable</span></div>
      <div className="schedule-slots-heading"><div><p className="schedule-kicker">Available appointment times</p><h3>{dateLabel(date)}</h3></div><span>{service.durationMinutes} minutes</span></div>
      {loading ? <p className="schedule-loading" role="status">Checking live availability…</p> : !availability ? <p className="schedule-loading">Availability must be connected before you can choose a time.</p> : <><div className="schedule-slots" role="group" aria-label="Appointment times">{times.map(slot => {
        const taken = overlapsBusy(date, slot, service.durationMinutes, busy);
        const enabled = canUse(date, slot);
        return <button key={slot} type="button" data-time={slot} className={`${time === slot ? 'is-selected' : ''}${taken ? ' is-taken' : ''}`} disabled={!enabled || pending} aria-pressed={time === slot} aria-label={`${slot} WAT${taken ? ', taken' : !enabled ? ', unavailable' : ', available'}`} onClick={() => {setTime(slot); setFeedback('');}}>{slot}{taken && <span>Taken</span>}</button>;
      })}</div>{!availableOn(date) && <p className="schedule-note">No open times for this conversation on this date. Try another working day.</p>}</>}
      <p className="schedule-note">Circled dates contain occupied times. Taken and overlapping times cannot be selected. Availability is checked again when you reserve.</p>
    </section>
    <aside className="schedule-form-panel"><form id="appointment-form" onSubmit={submit}><p className="schedule-kicker">{editing ? 'Change your appointment' : 'A good conversation starts here'}</p><h2>{editing ? 'Reschedule appointment' : 'Reserve your appointment'}</h2><label htmlFor="appointment-type">What would you like to discuss?</label><select id="appointment-type" value={service.name} disabled={!!editing || pending} onChange={event => setServiceName(event.target.value)}>{SERVICE_TYPES.map(item => <option key={item.name}>{item.name}</option>)}</select><p className="schedule-service-description">{service.description}</p>
      <div className="schedule-selected-summary"><CalendarDays size={20}/><div><strong>{dateLabel(date, {day: 'numeric', month: 'short', year: 'numeric'})}</strong><span>{time ? `${time}–${minutesToTime(timeToMinutes(time) + service.durationMinutes)} WAT` : 'Choose an available time'}</span></div><span>{service.durationMinutes} min</span></div>
      <label htmlFor="appointment-name">Your name</label><input id="appointment-name" name="name" autoComplete="name" required maxLength={100} value={name} disabled={pending || !!editing} onChange={event => setName(event.target.value)}/><label htmlFor="appointment-email">Email address</label><input id="appointment-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} disabled={pending || !!editing} onChange={event => setEmail(event.target.value)}/><label htmlFor="appointment-notes">A little context <span>(optional)</span></label><textarea id="appointment-notes" name="notes" rows={4} maxLength={2000} value={notes} disabled={pending || !!editing} onChange={event => setNotes(event.target.value)} placeholder="Your goals, questions, or anything helpful to know."/>
      <button type="submit" className="schedule-primary" disabled={pending || !time || !canUse(date, time)}>{pending ? 'Updating your appointment…' : editing ? 'Confirm new time' : 'Reserve appointment'}</button>{editing && <button type="button" className="schedule-secondary" onClick={() => {setEditing(null); setTime(''); setFeedback('');}}>Keep current appointment</button>}<p className="schedule-form-feedback" role="status">{feedback}</p><p className="schedule-note">Your contact details are used to arrange this appointment. Keep your reference; meeting details are arranged separately.</p>
    </form>{confirmation && <div className="schedule-confirmation"><span><Check size={18}/>Appointment reserved</span><h3>{confirmation.reference}</h3><p>{dateLabel(confirmation.date)} · {confirmation.time} WAT</p><Link to="/dashboard/bookings">View in my dashboard</Link></div>}</aside></div>
    <section className="schedule-my-appointments"><div className="schedule-section-heading"><div><p className="schedule-kicker">Your appointments</p><h2>Conversations on your calendar.</h2></div><button type="button" onClick={() => {void refresh(); void loadAvailability();}}>Refresh my appointments</button></div>{storageWarning && <p className="schedule-alert" role="status">{storageWarning}</p>}{appointmentError && <p className="schedule-alert" role="status">{appointmentError}</p>}
      {appointments.length ? <div className="schedule-appointment-list">{[...appointments].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).map(appointment => <article key={appointment.reference} className={appointment.status === 'cancelled' ? 'is-cancelled' : ''}><div className="schedule-appointment-date"><strong>{dateLabel(appointment.date, {day: 'numeric'})}</strong><span>{dateLabel(appointment.date, {month: 'short'})}</span></div><div className="schedule-appointment-copy"><span className="schedule-appointment-status">{appointment.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}</span><h3>{appointment.type}</h3><p>{dateLabel(appointment.date, {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'})} · {appointment.time}–{minutesToTime(timeToMinutes(appointment.time) + appointment.durationMinutes)} WAT</p><small>Reference: {appointment.reference}</small></div>{appointment.status === 'confirmed' && <div className="schedule-appointment-actions">{cancelId === appointment.reference ? <><p>Cancel this appointment and release the time?</p><button type="button" disabled={pending} onClick={() => {void cancel(appointment);}}>Yes, cancel appointment</button><button type="button" onClick={() => setCancelId(null)}>Keep appointment</button></> : <><button type="button" disabled={pending} onClick={() => editAppointment(appointment)}>Reschedule</button><button type="button" disabled={pending} onClick={() => setCancelId(appointment.reference)}>Cancel appointment</button></>}</div>}</article>)}</div> : <div className="schedule-empty"><CalendarDays size={27}/><h3>A little room for your next conversation.</h3><p>Appointments you reserve on this device will appear here.</p></div>}
    </section>
    {state.bookings.length > 0 && <section className="schedule-my-appointments"><div className="schedule-section-heading"><div><p className="schedule-kicker">Personal reminders</p><h2>Your saved booking ideas.</h2></div></div><p className="schedule-note">These ideas are not reservations and do not block appointment times. Choose an available time above to reserve a session.</p><div className="schedule-appointment-list">{state.bookings.map(plan => <article key={plan.id}><div className="schedule-appointment-copy"><span className="schedule-appointment-status">{plan.status === 'cancelled' ? 'Archived idea' : 'Unconfirmed idea'}</span><h3>{plan.type}</h3><p>{dateLabel(plan.date, {day: 'numeric', month: 'short', year: 'numeric'})} · {plan.time} (originally entered as local time)</p>{plan.notes && <p>{plan.notes}</p>}</div><Link className="schedule-idea-link" to={`${embedded ? '/dashboard/bookings' : '/book'}?${new URLSearchParams({type: plan.type, date: plan.date}).toString()}`}>Check appointment times</Link></article>)}</div></section>}
  </div></div>;
}
