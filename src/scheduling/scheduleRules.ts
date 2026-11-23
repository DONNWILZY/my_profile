export const SCHEDULE_TIMEZONE = 'Africa/Lagos';
export const LEAD_TIME_MINUTES = 120;
export const MAX_ADVANCE_DAYS = 90;
export const SLOT_MINUTES = 30;
export const OPENING_TIME = '09:00';
export const CLOSING_TIME = '17:00';
export const WORKING_DAYS = [1, 2, 3, 4, 5] as const;
export const SCHEDULE_SLOT_MINUTES = 30;
export const SCHEDULE_LEAD_MINUTES = 120;
export const SCHEDULE_HORIZON_DAYS = 90;
export const SCHEDULE_OPEN_MINUTES = 9 * 60;
export const SCHEDULE_CLOSE_MINUTES = 17 * 60;

export const SERVICE_TYPES = [
  { name: 'Discovery call', durationMinutes: 30, description: 'Discuss your goals and decide the next step.' },
  { name: 'Software consultation', durationMinutes: 60, description: 'Review a software idea, architecture, or technical challenge.' },
  { name: 'Marketing consultation', durationMinutes: 60, description: 'Plan a campaign, clarify your positioning, or review growth opportunities.' },
  { name: 'Course discussion', durationMinutes: 30, description: 'Find a course that fits your learning goals.' },
  { name: 'Cohort training', durationMinutes: 60, description: 'Discuss a learning programme for your team or group.' },
  { name: 'Speaking invitation', durationMinutes: 30, description: 'Talk through your event, audience, and proposed topic.' },
] as const;

export type ServiceType = typeof SERVICE_TYPES[number]['name'];
export type BusyInterval = { date: string; start: string; end: string };

export function scheduleDate(now = new Date()) {
  return new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 10);
}
export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
export function minutesToTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}
export function appointmentInstant(date: string, time: string) {
  return new Date(`${date}T${time}:00+01:00`);
}
export function isWorkingDate(date: string) {
  const weekday = new Date(`${date}T12:00:00+01:00`).getUTCDay();
  return weekday >= 1 && weekday <= 5;
}
export function overlapsBusy(date: string, time: string, durationMinutes: number, busy: readonly BusyInterval[]) {
  const start = timeToMinutes(time);
  return busy.some(interval => interval.date === date && start < timeToMinutes(interval.end) && timeToMinutes(interval.start) < start + durationMinutes);
}
export function isSlotAvailable(date: string, time: string, durationMinutes: number, busy: readonly BusyInterval[], serverNow: Date) {
  const start = timeToMinutes(time);
  const instant = appointmentInstant(date, time).getTime();
  return isWorkingDate(date) && start >= SCHEDULE_OPEN_MINUTES && start + durationMinutes <= SCHEDULE_CLOSE_MINUTES && start % SCHEDULE_SLOT_MINUTES === 0 && instant >= serverNow.getTime() + SCHEDULE_LEAD_MINUTES * 60000 && instant <= serverNow.getTime() + SCHEDULE_HORIZON_DAYS * 86400000 && !overlapsBusy(date, time, durationMinutes, busy);
}
export function appointmentTimes(durationMinutes: number) {
  const times: string[] = [];
  for (let minutes = SCHEDULE_OPEN_MINUTES; minutes + durationMinutes <= SCHEDULE_CLOSE_MINUTES; minutes += SCHEDULE_SLOT_MINUTES) times.push(minutesToTime(minutes));
  return times;
}
