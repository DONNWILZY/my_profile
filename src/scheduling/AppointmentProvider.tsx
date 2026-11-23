import {createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode} from 'react';

export type Appointment = {
  reference: string;
  type: string;
  date: string;
  time: string;
  durationMinutes: number;
  status: 'confirmed' | 'cancelled';
  name: string;
  email: string;
  notes: string;
  createdAt: string;
  updatedAt?: string;
  managementToken: string;
};
export type BookingInput = Pick<Appointment, 'type' | 'date' | 'time' | 'name' | 'email' | 'notes'>;
export type Availability = {
  timezone: string;
  slotMinutes: number;
  openingTime: string;
  closingTime: string;
  workingDays: number[];
  busy: {date: string; start: string; end: string}[];
  serverNow: string;
};
export class ScheduleError extends Error {
  constructor(message: string, public status = 0, public code = '') {super(message); this.name = 'ScheduleError';}
}
const apiBase = ((import.meta.env.VITE_SCHEDULE_API_URL as string | undefined)?.trim() || '').replace(/\/+$/, '');
const storageKey = 'godswill.appointments.v1';
const storageMessage = 'Your appointments could not be saved in this browser. Keep your appointment reference and contact details for your records.';

export async function scheduleRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBase}/api/schedule${path}`, {...options, headers: {'Content-Type': 'application/json', ...options.headers}, cache: 'no-store'});
  } catch {throw new ScheduleError('The schedule is temporarily unavailable. Please retry in a moment.');}
  let data: unknown;
  try {data = await response.json();} catch {throw new ScheduleError('The scheduling service is unavailable. Please retry later.', response.status);}
  if (!response.ok) {
    const error = data as {error?: unknown; code?: unknown};
    throw new ScheduleError(typeof error.error === 'string' ? error.error : 'The appointment could not be updated.', response.status, typeof error.code === 'string' ? error.code : '');
  }
  return data as T;
}

function readAppointments(): {appointments: Appointment[]; warning: string | null} {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return {appointments: [], warning: null};
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length > 500) throw Error();
    const appointments = parsed.filter((item): item is Appointment => {
      if (!item || typeof item !== 'object') return false;
      const appointment = item as Record<string, unknown>;
      return ['reference', 'type', 'date', 'time', 'name', 'email', 'notes', 'createdAt', 'managementToken'].every(key => typeof appointment[key] === 'string' && (appointment[key] as string).length <= (key === 'notes' ? 5000 : 500))
        && /^\d{4}-\d{2}-\d{2}$/.test(appointment.date as string)
        && /^\d{2}:\d{2}$/.test(appointment.time as string)
        && (appointment.status === 'confirmed' || appointment.status === 'cancelled')
        && typeof appointment.durationMinutes === 'number' && appointment.durationMinutes > 0 && appointment.durationMinutes <= 480;
    });
    return {appointments: [...new Map(appointments.map(item => [item.reference, item])).values()], warning: appointments.length === parsed.length ? null : 'Some saved appointment records could not be read. Your other records are still available.'};
  } catch {return {appointments: [], warning: 'Saved appointment records could not be read in this browser. Contact Godswill if you need help with an existing appointment.'};}
}

type AppointmentContextValue = {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  storageWarning: string | null;
  refresh: () => Promise<void>;
  createBooking: (input: BookingInput) => Promise<Appointment>;
  cancelBooking: (reference: string) => Promise<Appointment>;
  rescheduleBooking: (reference: string, input: {date: string; time: string}) => Promise<Appointment>;
};
const AppointmentContext = createContext<AppointmentContextValue | null>(null);

export function AppointmentProvider({children}: {children: ReactNode}) {
  const [initial] = useState(readAppointments);
  const [appointments, setAppointments] = useState(initial.appointments);
  const [storageWarning, setStorageWarning] = useState<string | null>(initial.warning);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = useRef(appointments);
  const persist = useCallback((next: Appointment[]) => {
    current.current = next;
    setAppointments(next);
    try {localStorage.setItem(storageKey, JSON.stringify(next)); setStorageWarning(null);} catch {setStorageWarning(storageMessage);}
  }, []);
  const refresh = useCallback(async () => {
    if (!current.current.length) return;
    setLoading(true);
    const records = [...current.current];
    const results = await Promise.allSettled(records.map(async record => {
      const result = await scheduleRequest<{booking: Omit<Appointment, 'managementToken'>}>(`/bookings/${encodeURIComponent(record.reference)}`, {headers: {Authorization: `Bearer ${record.managementToken}`}});
      return {...result.booking, managementToken: record.managementToken};
    }));
    const updates = new Map(results.flatMap(result => result.status === 'fulfilled' ? [[result.value.reference, result.value] as const] : []));
    // Merge against the latest list so a refresh never drops a newly created booking.
    persist(current.current.map(record => {
      const update = updates.get(record.reference);
      if (!update || (record.status === 'cancelled' && update.status !== 'cancelled')) return record;
      return Date.parse(update.updatedAt ?? update.createdAt) < Date.parse(record.updatedAt ?? record.createdAt) ? record : update;
    }));
    setError(results.some(result => result.status === 'rejected') ? 'Some appointments could not be refreshed. The last saved details are shown.' : null);
    setLoading(false);
  }, [persist]);
  useEffect(() => {
    void refresh();
    const synchronize = (event: StorageEvent) => {
      if (event.key !== storageKey && event.key !== null) return;
      const next = readAppointments();
      current.current = next.appointments;
      setAppointments(next.appointments);
      setStorageWarning(next.warning);
    };
    const onFocus = () => {void refresh();};
    window.addEventListener('storage', synchronize);
    window.addEventListener('focus', onFocus);
    return () => {window.removeEventListener('storage', synchronize); window.removeEventListener('focus', onFocus);};
  }, [refresh]);
  const createBooking = useCallback(async (input: BookingInput) => {
    const result = await scheduleRequest<{booking: Omit<Appointment, 'managementToken'>; managementToken: string}>('/bookings', {method: 'POST', body: JSON.stringify(input)});
    const appointment = {...result.booking, managementToken: result.managementToken};
    persist([...current.current.filter(item => item.reference !== appointment.reference), appointment]);
    setError(null);
    return appointment;
  }, [persist]);
  const mutate = useCallback(async (reference: string, action: 'cancel' | 'reschedule', input?: {date: string; time: string}) => {
    const record = current.current.find(item => item.reference === reference);
    if (!record) throw new ScheduleError('This appointment is not saved in this browser. Please contact Godswill for help.');
    const result = await scheduleRequest<{booking: Omit<Appointment, 'managementToken'>}>(`/bookings/${encodeURIComponent(reference)}/${action}`, {method: 'POST', headers: {Authorization: `Bearer ${record.managementToken}`}, body: JSON.stringify(input ?? {})});
    const appointment = {...result.booking, managementToken: record.managementToken};
    persist(current.current.map(item => item.reference === reference ? appointment : item));
    setError(null);
    return appointment;
  }, [persist]);
  return <AppointmentContext.Provider value={{appointments, loading, error, storageWarning, refresh, createBooking, cancelBooking: reference => mutate(reference, 'cancel'), rescheduleBooking: (reference, input) => mutate(reference, 'reschedule', input)}}>{children}</AppointmentContext.Provider>;
}

export function useAppointments() {
  const value = useContext(AppointmentContext);
  if (!value) throw Error('useAppointments must be used within AppointmentProvider');
  return value;
}
