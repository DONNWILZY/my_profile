import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import {courses, coursePath} from '../courseCatalog';
import {digitalProducts} from '../digitalProductsData';
import {projectCaseStudies, projectDetailsPath} from '../projectCatalog';
import {events, posts} from '../data';
import {portfolioOffers} from './offers';

export type CourseTrack = {slug: string; savedAt: string; reviewedModules: number[]; notes: string};
// Earlier locally prepared booking plans are retained when saved data is upgraded.
export type BookingPlan = {id: string; type: string; date: string; time: string; notes: string; status: 'planned' | 'requested' | 'cancelled'; createdAt: string};
export type Enquiry = {id: string; topic: string; item: string; message: string; createdAt: string};
export type ActivityKind = 'course' | 'project' | 'article' | 'event' | 'resource' | 'offer' | 'enquiry' | 'booking';
export type DashboardActivity = {id: string; kind: ActivityKind; title: string; path: string; createdAt: string};
export type DashboardState = {
  version: 1; displayName: string; goal: string; courses: CourseTrack[]; bookings: BookingPlan[];
  savedOfferIds: string[]; savedProductSlugs: string[]; savedProjectKeys: string[];
  savedArticleSlugs: string[]; savedEventIds: string[]; enquiries: Enquiry[]; activity: DashboardActivity[];
};
type BookingInput = Pick<BookingPlan, 'type' | 'date' | 'time' | 'notes'>;
type BookingPatch = Partial<Pick<BookingPlan, 'status' | 'notes' | 'date' | 'time' | 'type'>>;
type EnquiryInput = Pick<Enquiry, 'topic' | 'item' | 'message'>;
type ActivityInput = Pick<DashboardActivity, 'kind' | 'title' | 'path'>;
type DashboardContextValue = {
  state: DashboardState; storageWarning: string | null;
  trackCourse: (slug: string) => void; untrackCourse: (slug: string) => void;
  toggleModule: (slug: string, index: number) => void; updateCourseNotes: (slug: string, notes: string) => void;
  addBooking: (input: BookingInput) => string; updateBooking: (id: string, patch: BookingPatch) => void; removeBooking: (id: string) => void;
  toggleOffer: (id: string) => void; toggleProduct: (slug: string) => void;
  toggleProject: (key: string) => void; toggleArticle: (slug: string) => void; toggleEvent: (title: string) => void;
  saveEnquiry: (input: EnquiryInput) => void; logActivity: (input: ActivityInput) => void;
  updateProfile: (profile: Pick<DashboardState, 'displayName' | 'goal'>) => void; resetDashboard: () => void;
};
const STORAGE_KEY = 'godswill.dashboard.v1';
const MEMORY_WARNING = 'Your browser could not save this dashboard. Changes are available for this visit only.';
const CORRUPT_WARNING = 'Saved dashboard data could not be read safely. You can keep using this dashboard for this visit, or reset it in Settings to start saving again.';
const DashboardContext = createContext<DashboardContextValue | null>(null);
const activityKinds: ActivityKind[] = ['course', 'project', 'article', 'event', 'resource', 'offer', 'enquiry', 'booking'];
function emptyState(): DashboardState {
  return {version: 1, displayName: '', goal: '', courses: [], bookings: [], savedOfferIds: [], savedProductSlugs: [], savedProjectKeys: [], savedArticleSlugs: [], savedEventIds: [], enquiries: [], activity: []};
}
function record(value: unknown): value is Record<string, unknown> {return typeof value === 'object' && value !== null && !Array.isArray(value);}
function text(value: unknown, max: number, required = false): value is string {return typeof value === 'string' && value.length <= max && (!required || value.trim().length > 0);}
function timestamp(value: unknown): value is string {
  if (!text(value, 30, true) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
  const parsed = new Date(value); return Number.isFinite(parsed.getTime()) && parsed.toISOString() === value;
}
function date(value: unknown): value is string {
  if (!text(value, 10, true) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`); return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
function time(value: unknown): value is string {return text(value, 5, true) && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);}
function booking(value: unknown): value is BookingPlan {
  return record(value) && text(value.id, 100, true) && text(value.type, 120, true) && date(value.date) && time(value.time)
    && text(value.notes, 5000) && typeof value.status === 'string' && ['planned', 'requested', 'cancelled'].includes(value.status) && timestamp(value.createdAt);
}
function uniqueStrings(value: unknown, allowed: Set<string>): value is string[] {
  return Array.isArray(value) && value.length <= allowed.size && value.every(item => typeof item === 'string' && allowed.has(item)) && new Set(value).size === value.length;
}
function enquiry(value: unknown): value is Enquiry {
  return record(value) && text(value.id, 100, true) && text(value.topic, 120, true) && text(value.item, 200) && text(value.message, 5000, true) && timestamp(value.createdAt);
}
function activity(value: unknown): value is DashboardActivity {
  return record(value) && text(value.id, 100, true) && activityKinds.includes(value.kind as ActivityKind) && text(value.title, 250, true)
    && text(value.path, 1500, true) && /^\/(?!\/)/.test(value.path) && !/[\r\n]/.test(value.path) && timestamp(value.createdAt);
}
function validState(value: unknown): value is DashboardState {
  if (!record(value) || value.version !== 1 || !text(value.displayName, 80) || !text(value.goal, 500)) return false;
  if (!Array.isArray(value.courses) || value.courses.length > courses.length || !Array.isArray(value.bookings) || value.bookings.length > 1000) return false;
  const seen = new Set<string>();
  for (const item of value.courses) {
    if (!record(item) || typeof item.slug !== 'string') return false;
    const course = courses.find(candidate => candidate.slug === item.slug);
    if (!course || seen.has(item.slug) || !timestamp(item.savedAt) || !text(item.notes, 5000) || !Array.isArray(item.reviewedModules)) return false;
    if (item.reviewedModules.length > course.modules.length || item.reviewedModules.some(index => !Number.isInteger(index) || index < 0 || index >= course.modules.length) || new Set(item.reviewedModules).size !== item.reviewedModules.length) return false;
    seen.add(item.slug);
  }
  return value.bookings.every(booking) && new Set(value.bookings.map(item => (item as BookingPlan).id)).size === value.bookings.length
    && uniqueStrings(value.savedOfferIds, new Set(portfolioOffers.map(item => item.id)))
    && uniqueStrings(value.savedProductSlugs, new Set(digitalProducts.map(item => item.slug)))
    && uniqueStrings(value.savedProjectKeys, new Set(projectCaseStudies.map(item => `${item.discipline}/${item.slug}`)))
    && uniqueStrings(value.savedArticleSlugs, new Set(posts.map(item => item.slug)))
    && uniqueStrings(value.savedEventIds, new Set(events.map(item => item.title)))
    && Array.isArray(value.enquiries) && value.enquiries.length <= 100 && value.enquiries.every(enquiry) && new Set(value.enquiries.map(item => item.id)).size === value.enquiries.length
    && Array.isArray(value.activity) && value.activity.length <= 100 && value.activity.every(activity) && new Set(value.activity.map(item => item.id)).size === value.activity.length;
}
/** Older browser data keeps its original plans and receives empty platform collections. */
function migrate(value: unknown): unknown {
  if (!record(value)) return value;
  const next = {...value};
  for (const key of ['savedProjectKeys', 'savedArticleSlugs', 'savedEventIds', 'enquiries', 'activity']) if (next[key] === undefined) next[key] = [];
  return next;
}
function readInitialState(): {state: DashboardState; warning: string | null; canPersist: boolean} {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === null) return {state: emptyState(), warning: null, canPersist: true};
    try {const parsed = migrate(JSON.parse(saved)); if (validState(parsed)) return {state: parsed, warning: null, canPersist: true};} catch { /* Preserve unreadable saved data until reset. */ }
    return {state: emptyState(), warning: CORRUPT_WARNING, canPersist: false};
  } catch {return {state: emptyState(), warning: MEMORY_WARNING, canPersist: false};}
}
function identifier() {return typeof window.crypto?.randomUUID === 'function' ? window.crypto.randomUUID() : `item-${Date.now()}-${Math.random().toString(36).slice(2)}`;}
function withActivity(state: DashboardState, input: ActivityInput): DashboardState {
  const item = {...input, id: identifier(), createdAt: new Date().toISOString()};
  if (!activity(item)) return state;
  return {...state, activity: [item, ...state.activity].slice(0, 100)};
}
export function DashboardProvider({children}: {children: ReactNode}) {
  const [initial] = useState(readInitialState);
  const [state, setState] = useState(initial.state);
  const [storageWarning, setStorageWarning] = useState<string | null>(initial.warning);
  const stateRef = useRef(state);
  const canPersist = useRef(initial.canPersist);
  const commit = useCallback((next: DashboardState) => {
    if (!validState(next)) return;
    stateRef.current = next; setState(next);
    if (!canPersist.current) return;
    try {window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));} catch {canPersist.current = false; setStorageWarning(MEMORY_WARNING);}
  }, []);
  useEffect(() => {
    const synchronize = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      try {
        const incoming = event.newValue === null ? emptyState() : migrate(JSON.parse(event.newValue));
        if (!validState(incoming)) throw new Error('Invalid dashboard');
        stateRef.current = incoming; setState(incoming); canPersist.current = true; setStorageWarning(null);
      } catch {canPersist.current = false; setStorageWarning(CORRUPT_WARNING);}
    };
    window.addEventListener('storage', synchronize); return () => window.removeEventListener('storage', synchronize);
  }, []);
  const trackCourse = useCallback((slug: string) => {
    const current = stateRef.current, course = courses.find(item => item.slug === slug);
    if (!course || current.courses.some(item => item.slug === slug)) return;
    commit(withActivity({...current, courses: [...current.courses, {slug, savedAt: new Date().toISOString(), reviewedModules: [], notes: ''}]}, {kind: 'course', title: `Added a study plan: ${course.title}`, path: `/dashboard/courses/${slug}`}));
  }, [commit]);
  const untrackCourse = useCallback((slug: string) => {
    const current = stateRef.current, course = courses.find(item => item.slug === slug);
    if (!course || !current.courses.some(item => item.slug === slug)) return;
    commit(withActivity({...current, courses: current.courses.filter(item => item.slug !== slug)}, {kind: 'course', title: `Removed a study plan: ${course.title}`, path: coursePath(course)}));
  }, [commit]);
  const toggleModule = useCallback((slug: string, index: number) => {
    const current = stateRef.current, course = courses.find(item => item.slug === slug);
    if (!course || !Number.isInteger(index) || index < 0 || index >= course.modules.length) return;
    const tracked = current.courses.find(item => item.slug === slug) ?? {slug, savedAt: new Date().toISOString(), reviewedModules: [], notes: ''};
    const reviewed = tracked.reviewedModules.includes(index);
    const reviewedModules = reviewed ? tracked.reviewedModules.filter(item => item !== index) : [...tracked.reviewedModules, index].sort((a, b) => a - b);
    commit(withActivity({...current, courses: [...current.courses.filter(item => item.slug !== slug), {...tracked, reviewedModules}]}, {kind: 'course', title: `${reviewed ? 'Unchecked' : 'Reviewed'} outline: ${course.modules[index].title}`, path: `/dashboard/courses/${slug}`}));
  }, [commit]);
  const updateCourseNotes = useCallback((slug: string, notes: string) => {
    const current = stateRef.current, course = courses.find(item => item.slug === slug);
    if (!course || !current.courses.some(item => item.slug === slug)) return;
    commit(withActivity({...current, courses: current.courses.map(item => item.slug === slug ? {...item, notes: notes.slice(0, 5000)} : item)}, {kind: 'course', title: `Saved study notes: ${course.title}`, path: `/dashboard/courses/${slug}`}));
  }, [commit]);
  const addBooking = useCallback((input: BookingInput) => {
    const current = stateRef.current; if (current.bookings.length >= 1000) return '';
    const plan: BookingPlan = {...input, type: input.type.trim().slice(0, 120), notes: input.notes.slice(0, 5000), id: identifier(), status: 'planned', createdAt: new Date().toISOString()};
    if (!booking(plan)) return ''; commit({...current, bookings: [...current.bookings, plan]}); return plan.id;
  }, [commit]);
  const updateBooking = useCallback((id: string, patch: BookingPatch) => {
    const current = stateRef.current, existing = current.bookings.find(item => item.id === id); if (!existing) return;
    const updated = {...existing};
    if (patch.type !== undefined) updated.type = patch.type.trim().slice(0, 120);
    if (patch.notes !== undefined) updated.notes = patch.notes.slice(0, 5000);
    if (patch.date !== undefined) updated.date = patch.date;
    if (patch.time !== undefined) updated.time = patch.time;
    if (patch.status !== undefined) updated.status = patch.status;
    if (booking(updated)) commit({...current, bookings: current.bookings.map(item => item.id === id ? updated : item)});
  }, [commit]);
  const removeBooking = useCallback((id: string) => {const current = stateRef.current; commit({...current, bookings: current.bookings.filter(item => item.id !== id)});}, [commit]);
  const toggleOffer = useCallback((id: string) => {
    const current = stateRef.current, offer = portfolioOffers.find(item => item.id === id); if (!offer) return;
    const saved = current.savedOfferIds.includes(id);
    commit(withActivity({...current, savedOfferIds: saved ? current.savedOfferIds.filter(item => item !== id) : [...current.savedOfferIds, id]}, {kind: 'offer', title: `${saved ? 'Unsaved' : 'Saved'} offer: ${offer.title}`, path: offer.path}));
  }, [commit]);
  const toggleProduct = useCallback((slug: string) => {
    const current = stateRef.current, product = digitalProducts.find(item => item.slug === slug); if (!product) return;
    const saved = current.savedProductSlugs.includes(slug);
    commit(withActivity({...current, savedProductSlugs: saved ? current.savedProductSlugs.filter(item => item !== slug) : [...current.savedProductSlugs, slug]}, {kind: 'resource', title: `${saved ? 'Unsaved' : 'Saved'} resource: ${product.title}`, path: `/digital-products/${slug}`}));
  }, [commit]);
  const toggleProject = useCallback((key: string) => {
    const current = stateRef.current, project = projectCaseStudies.find(item => `${item.discipline}/${item.slug}` === key); if (!project) return;
    const saved = current.savedProjectKeys.includes(key);
    commit(withActivity({...current, savedProjectKeys: saved ? current.savedProjectKeys.filter(item => item !== key) : [...current.savedProjectKeys, key]}, {kind: 'project', title: `${saved ? 'Unsaved' : 'Saved'} project: ${project.title}`, path: projectDetailsPath(project.discipline, project.slug)}));
  }, [commit]);
  const toggleArticle = useCallback((slug: string) => {
    const current = stateRef.current, article = posts.find(item => item.slug === slug); if (!article) return;
    const saved = current.savedArticleSlugs.includes(slug);
    commit(withActivity({...current, savedArticleSlugs: saved ? current.savedArticleSlugs.filter(item => item !== slug) : [...current.savedArticleSlugs, slug]}, {kind: 'article', title: `${saved ? 'Unsaved' : 'Saved'} article: ${article.title}`, path: `/blog/${slug}`}));
  }, [commit]);
  const toggleEvent = useCallback((title: string) => {
    const current = stateRef.current, event = events.find(item => item.title === title); if (!event) return;
    const saved = current.savedEventIds.includes(title);
    commit(withActivity({...current, savedEventIds: saved ? current.savedEventIds.filter(item => item !== title) : [...current.savedEventIds, title]}, {kind: 'event', title: `${saved ? 'Unsaved' : 'Saved'} event: ${event.title}`, path: '/events'}));
  }, [commit]);
  const saveEnquiry = useCallback((input: EnquiryInput) => {
    const current = stateRef.current;
    const draft: Enquiry = {id: identifier(), topic: input.topic.trim().slice(0, 120), item: input.item.trim().slice(0, 200), message: input.message.trim().slice(0, 5000), createdAt: new Date().toISOString()};
    if (!enquiry(draft) || current.enquiries.some(item => item.topic === draft.topic && item.item === draft.item && item.message === draft.message)) return;
    commit(withActivity({...current, enquiries: [draft, ...current.enquiries].slice(0, 100)}, {kind: 'enquiry', title: `Prepared enquiry: ${draft.item || draft.topic}`, path: '/dashboard/enquiries'}));
  }, [commit]);
  const logActivity = useCallback((input: ActivityInput) => commit(withActivity(stateRef.current, input)), [commit]);
  const updateProfile = useCallback((profile: Pick<DashboardState, 'displayName' | 'goal'>) => commit({...stateRef.current, displayName: profile.displayName.slice(0, 80), goal: profile.goal.slice(0, 500)}), [commit]);
  const resetDashboard = useCallback(() => {
    const next = emptyState(); stateRef.current = next; setState(next);
    try {window.localStorage.removeItem(STORAGE_KEY); canPersist.current = true; setStorageWarning(null);} catch {canPersist.current = false; setStorageWarning(MEMORY_WARNING);}
  }, []);
  const value = useMemo<DashboardContextValue>(() => ({state, storageWarning, trackCourse, untrackCourse, toggleModule, updateCourseNotes, addBooking, updateBooking, removeBooking, toggleOffer, toggleProduct, toggleProject, toggleArticle, toggleEvent, saveEnquiry, logActivity, updateProfile, resetDashboard}), [state, storageWarning, trackCourse, untrackCourse, toggleModule, updateCourseNotes, addBooking, updateBooking, removeBooking, toggleOffer, toggleProduct, toggleProject, toggleArticle, toggleEvent, saveEnquiry, logActivity, updateProfile, resetDashboard]);
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
export function useDashboard() {const context = useContext(DashboardContext); if (!context) throw new Error('useDashboard must be used within DashboardProvider'); return context;}
