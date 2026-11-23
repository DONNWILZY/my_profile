import {useEffect, useRef, useState} from 'react';
import {Link, NavLink, Route, Routes, useLocation, useNavigate, useParams} from 'react-router-dom';
import {BookOpen, CalendarDays, Check, Download, FileText, Gift, LayoutDashboard, Bookmark, Activity, MessageSquare, Code2, Megaphone, Users, Newspaper, Menu, Plus, Settings, X} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import {brand, brandAsset} from '../brand';
import {courses, courseEnquiryPath, coursePath, type Course} from '../courseCatalog';
import {digitalProducts} from '../digitalProductsData';
import {useDashboard} from './DashboardProvider';
import {portfolioOffers} from './offers';
import {events, posts} from '../data';
import {projectCaseStudies, projectDetailsPath} from '../projectCatalog';
import {useAppointments} from '../scheduling/AppointmentProvider';
import SchedulePage from '../scheduling/SchedulePage';
import PlatformSaveButton from './PlatformSaveButton';
import './dashboard.css';

const navigation = [
  {path: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true},
  {path: '/dashboard/activity', label: 'Activity', icon: Activity, end: false},
  {path: '/dashboard/saved', label: 'Saved items', icon: Bookmark, end: false},
  {path: '/dashboard/enquiries', label: 'Enquiries', icon: MessageSquare, end: false},
  {path: '/dashboard/courses', label: 'My courses', icon: BookOpen, end: false},
  {path: '/dashboard/bookings', label: 'Bookings', icon: CalendarDays, end: false},
  {path: '/dashboard/offers', label: 'Offers', icon: Gift, end: false},
  {path: '/dashboard/resources', label: 'Resources', icon: FileText, end: false},
  {path: '/dashboard/settings', label: 'Settings', icon: Settings, end: false},
];

function initials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'YOU';
}

function displayDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'});
}

function reviewedCount(course: Course, indices: number[]) {
  return course.modules.filter((_, index) => indices.includes(index)).length;
}

function CourseMark({course}: {course: Course}) {
  return <div className={`dashboard-course-mark dashboard-course-mark--${course.discipline.toLowerCase()}`} aria-hidden="true"><span>{course.mark}</span><i/><i/></div>;
}

function CourseProgress({course, reviewed}: {course: Course; reviewed: number[]}) {
  const count = reviewedCount(course, reviewed);
  return <div className="dashboard-progress"><div><span>Outline reviewed</span><strong>{count}/{course.modules.length} modules</strong></div><progress aria-label={`${course.title} outline reviewed`} max={course.modules.length} value={count}/></div>;
}

function EmptyState({title, children}: {title: string; children: React.ReactNode}) {
  return <div className="dashboard-empty"><span className="dashboard-empty-symbol" aria-hidden="true"><BookOpen size={22}/></span><h3>{title}</h3>{children}</div>;
}

function SectionHeading({title, detail, link, label}: {title: string; detail?: string; link?: string; label?: string}) {
  return <div className="dashboard-section-heading"><div><h2>{title}</h2>{detail && <p>{detail}</p>}</div>{link && <Link to={link}>{label || 'View all'}</Link>}</div>;
}

function StudyCard({course, compact = false}: {course: Course; compact?: boolean}) {
  const {state, trackCourse, untrackCourse} = useDashboard();
  const navigate = useNavigate();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const track = state.courses.find(item => item.slug === course.slug);
  return <article className={`dashboard-study-card${compact ? ' dashboard-study-card--compact' : ''}`}>
    <CourseMark course={course}/>
    <div className="dashboard-study-copy"><div className="dashboard-card-label"><span>{course.discipline}</span><span>{course.format === 'cohort' ? 'Cohort' : 'Individual'}</span></div><h3><Link to={track ? `/dashboard/courses/${course.slug}` : coursePath(course)}>{course.title}</Link></h3>{!compact && <p>{course.summary}</p>}
      {track ? <><CourseProgress course={course} reviewed={track.reviewedModules}/><div className="dashboard-card-actions"><Link className="dashboard-button dashboard-button--primary" to={`/dashboard/courses/${course.slug}`}>Open study plan</Link>{!compact && <button className="dashboard-text-button" onClick={() => setConfirmRemove(true)} aria-expanded={confirmRemove} aria-label={`Remove ${course.title} from my courses`}>Remove</button>}</div>{confirmRemove && <div className="dashboard-remove-confirm" role="group" aria-label={`Confirm removal of ${course.title}`}><strong>Remove this study plan?</strong><p>Your outline checklist and notes for this course will also be removed.</p><div><button className="dashboard-text-button" onClick={() => untrackCourse(course.slug)}>Remove plan</button><button className="dashboard-text-button" onClick={() => setConfirmRemove(false)}>Keep plan</button></div></div>}</> : <div className="dashboard-card-actions"><button className="dashboard-button dashboard-button--primary" onClick={() => {trackCourse(course.slug); navigate(`/dashboard/courses/${course.slug}`);}}><Plus size={15}/>Add study plan</button><Link className="dashboard-text-button" to={coursePath(course)}>Course details</Link></div>}
    </div>
  </article>;
}

const exploreLinks = [
  {path: '/engineering', title: 'Engineering', detail: 'Products & case studies', icon: Code2},
  {path: '/marketing', title: 'Marketing', detail: 'Strategy & growth', icon: Megaphone},
  {path: '/courses', title: 'Courses', detail: 'Individual & cohort learning', icon: BookOpen},
  {path: '/digital-products', title: 'Digital products', detail: 'Platforms & downloads', icon: FileText},
  {path: '/blog', title: 'Insights', detail: 'Ideas worth revisiting', icon: Newspaper},
  {path: '/events', title: 'Events', detail: 'Talks & appearances', icon: CalendarDays},
  {path: '/community', title: 'Community', detail: 'Connect & collaborate', icon: Users},
  {path: '/contact', title: 'Get in touch', detail: 'Your next conversation', icon: MessageSquare},
];

function ActivityList({limit}: {limit?: number}) {
  const {state} = useDashboard();
  const items = limit ? state.activity.slice(0, limit) : state.activity;
  if (!items.length) return <div className="dashboard-activity-empty"><Activity size={24}/><h3>Your next action starts the story.</h3><p>Saved projects, course plans, bookings, offers, and prepared enquiries appear here as you use the platform.</p></div>;
  return <ol className="dashboard-activity-list">{items.map(item => <li key={item.id}><span className={`dashboard-activity-dot dashboard-activity-dot--${item.kind}`} aria-hidden="true"/><div><Link to={item.path}>{item.title}</Link><span>{item.kind} <i aria-hidden="true">/</i> {new Date(item.createdAt).toLocaleString(undefined, {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'})}</span></div></li>)}</ol>;
}

function Overview() {
  const {state} = useDashboard();
  const {appointments, loading, error} = useAppointments();
  const upcoming = appointments.filter(item => item.status === 'confirmed' && new Date(`${item.date}T${item.time}:00+01:00`).getTime() >= Date.now()).sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  const nextAppointment = upcoming[0];
  const savedCount = state.savedProjectKeys.length + state.savedArticleSlugs.length + state.savedEventIds.length;
  return <>
    <div className="dashboard-page-title"><span>YOUR PLATFORM AT A GLANCE</span><h1>{state.displayName.trim() ? `Welcome back, ${state.displayName.trim().split(/\s+/)[0]}.` : 'Everything you do, in one place.'}</h1><p>Your projects, appointments, learning, resources, and conversations with {brand.name}.</p></div>
    <div className="dashboard-welcome-grid"><section className="dashboard-welcome"><div><span>IDEAS. CONNECTIONS. POSSIBILITIES.</span><h2>Keep your next step<br/>within reach.</h2><p>Return to something you saved, plan a conversation, or explore something new.</p><Link className="dashboard-button dashboard-button--white" to="/dashboard/saved">Open saved items</Link></div><div className="dashboard-welcome-art" aria-hidden="true"><div className="dashboard-art-orbit"/><div className="dashboard-art-sheet"><span>YOUR NEXT STEP</span><strong>Make room for good ideas.</strong><div><Check size={14}/>Save what interests you</div><div><Check size={14}/>Find a time to connect</div><div className="dashboard-art-current"><span/>Keep moving forward</div><i/><i/></div><span className="dashboard-art-badge"><Bookmark size={22}/></span></div></section><section className="dashboard-goal-card"><span className="dashboard-kicker">A NOTE TO YOURSELF</span><h2>Your next goal</h2><p>{state.goal || 'A new skill, a useful product, a stronger brand, or a conversation. What would you like to do next?'}</p><Link to="/dashboard/settings">{state.goal ? 'Edit your goal' : 'Set your next goal'}</Link><span className="dashboard-goal-decoration" aria-hidden="true">{brand.name.slice(0,1)}.</span></section></div>
    <div className="dashboard-stats dashboard-stats--platform"><article><span className="dashboard-stat-icon"><CalendarDays size={20}/></span><div><strong>{loading ? '-' : upcoming.length}</strong><span>Appointments</span></div><small>Confirmed upcoming sessions</small></article><article><span className="dashboard-stat-icon"><Bookmark size={20}/></span><div><strong>{savedCount}</strong><span>Saved items</span></div><small>Projects, insights & events</small></article><article><span className="dashboard-stat-icon"><BookOpen size={20}/></span><div><strong>{state.courses.length}</strong><span>Study plans</span></div><small>Your individual & cohort interests</small></article><article><span className="dashboard-stat-icon"><MessageSquare size={20}/></span><div><strong>{state.enquiries.length}</strong><span>Enquiry drafts</span></div><small>Briefs you have prepared</small></article></div>
    <SectionHeading title="Explore the platform" detail="More than learning. Find the next thing that matters to you."/>
    <div className="dashboard-explore-grid">{exploreLinks.map(item => <Link key={item.path} to={item.path}><span><item.icon size={20}/></span><div><strong>{item.title}</strong><small>{item.detail}</small></div></Link>)}</div>
    <div className="dashboard-overview-grid"><section className="dashboard-panel"><SectionHeading title="Recent activity" detail="A record of your own actions across the platform." link="/dashboard/activity" label="All activity"/><ActivityList limit={6}/></section><aside className="dashboard-right-rail"><section className="dashboard-panel"><SectionHeading title="Your next appointment" link="/dashboard/bookings" label="Manage"/>{nextAppointment ? <><div className="dashboard-date-tile"><CalendarDays size={21}/><div><strong>{displayDate(nextAppointment.date)}</strong><span>{nextAppointment.time} / Africa/Lagos (WAT)</span></div></div><h3>{nextAppointment.type}</h3><span className="dashboard-status">Confirmed</span><p>Reference: {nextAppointment.reference}</p></> : <><div className="dashboard-quiet-icon"><CalendarDays size={27}/></div><h3>{loading ? 'Checking your appointments.' : 'Make time for a conversation.'}</h3><p>{error || 'Explore available times for a consultation, course discussion, or speaking session.'}</p><Link className="dashboard-button dashboard-button--soft" to="/dashboard/bookings">Book an appointment</Link></>}</section><section className="dashboard-resource-callout"><span className="dashboard-kicker">YOUR COLLECTION</span><h3>{state.savedProductSlugs.length + state.savedOfferIds.length} resources & offers saved.</h3><p>Keep useful downloads, digital products, and opportunities together.</p><div className="dashboard-card-actions"><Link to="/dashboard/resources">Resources</Link><Link to="/dashboard/offers">Offers</Link></div></section></aside></div>
  </>;
}

function AllActivity() {
  return <><div className="dashboard-page-title"><span>YOUR PLATFORM HISTORY</span><h1>A record of your next steps.</h1><p>Your most recent 100 actions across projects, bookings, courses, resources, offers, insights, events, and enquiries.</p></div><section className="dashboard-panel"><ActivityList/></section></>;
}

function SavedItems() {
  const {state} = useDashboard();
  const [filter, setFilter] = useState('all');
  const savedProjects = projectCaseStudies.filter(item => state.savedProjectKeys.includes(`${item.discipline}/${item.slug}`));
  const savedArticles = posts.filter(item => state.savedArticleSlugs.includes(item.slug));
  const savedEvents = events.filter(item => state.savedEventIds.includes(item.title));
  const items = [
    ...savedProjects.map(item => ({kind: 'project' as const, id: `${item.discipline}/${item.slug}`, title: item.title, description: item.summary, label: `${item.discipline} / ${item.kind}`, path: projectDetailsPath(item.discipline, item.slug)})),
    ...savedArticles.map(item => ({kind: 'article' as const, id: item.slug, title: item.title, description: item.excerpt, label: `${item.category} / ${item.date}`, path: `/blog/${item.slug}`})),
    ...savedEvents.map(item => ({kind: 'event' as const, id: item.title, title: item.title, description: item.description, label: `${item.type} / ${item.year}`, path: '/events'})),
  ].filter(item => filter === 'all' || item.kind === filter);
  return <><div className="dashboard-page-title"><span>YOUR OWN COLLECTION</span><h1>Good things to come back to.</h1><p>Projects you are exploring, insights to revisit, and events you want to remember.</p></div><div className="dashboard-toolbar"><div className="dashboard-tabs" aria-label="Filter saved items">{[['all','Everything'], ['project','Projects'], ['article','Insights'], ['event','Events']].map(([value,label]) => <button key={value} aria-pressed={filter === value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div><Link className="dashboard-text-button" to="/dashboard/resources">Saved resources</Link></div>{items.length ? <div className="dashboard-saved-grid">{items.map(item => <article className="dashboard-saved-card" key={`${item.kind}/${item.id}`}><span className="dashboard-kicker">{item.label}</span><h2><Link to={item.path}>{item.title}</Link></h2><p>{item.description}</p><div className="dashboard-card-actions"><Link className="dashboard-button dashboard-button--primary" to={item.path}>View {item.kind === 'article' ? 'insight' : item.kind}</Link><PlatformSaveButton kind={item.kind} id={item.id}/></div></article>)}</div> : <EmptyState title="Give a good idea a place to stay."><p>Use Save on project details, insights, or events to find them here. Try another filter if you have already saved something.</p><Link className="dashboard-button dashboard-button--primary" to="/portfolio">Explore projects</Link></EmptyState>}</>;
}

function Enquiries() {
  const {state} = useDashboard();
  const [feedback, setFeedback] = useState('');
  async function copy(message: string) {
    try {await navigator.clipboard.writeText(message); setFeedback('Enquiry copied.');} catch {setFeedback('Copy is unavailable. Select and copy the message below, or reopen it in Contact.');}
  }
  return <><div className="dashboard-page-title"><span>YOUR CONVERSATIONS</span><h1>Keep your ideas in the loop.</h1><p>Prepared briefs and enquiries from the contact page. A saved draft is ready for you to share.</p></div><p className="dashboard-form-message" role="status">{feedback}</p>{state.enquiries.length ? <div className="dashboard-enquiry-list">{state.enquiries.map(item => <article className="dashboard-panel dashboard-enquiry-card" key={item.id}><span className="dashboard-kicker">{item.topic} / {new Date(item.createdAt).toLocaleDateString()}</span><h2>{item.item || item.topic}</h2><span className="dashboard-status">Prepared draft</span><p>{item.message}</p><div className="dashboard-card-actions"><Link className="dashboard-button dashboard-button--primary" to={`/contact?${new URLSearchParams({topic:item.topic, item:item.item, message:item.message})}`}>Open enquiry</Link><button className="dashboard-text-button" onClick={() => copy(item.message)}>Copy message</button></div></article>)}</div> : <EmptyState title="Your next collaboration starts here."><p>Prepare an enquiry about a project, service, course, product, or speaking opportunity, and keep a copy in your dashboard.</p><Link className="dashboard-button dashboard-button--primary" to="/contact">Prepare an enquiry</Link></EmptyState>}</>;
}

function MyCourses() {
  const {state} = useDashboard();
  const [filter, setFilter] = useState('all');
  const tracked = courses.filter(course => state.courses.some(item => item.slug === course.slug));
  const filtered = tracked.filter(course => filter === 'all' || course.format === filter);
  return <><div className="dashboard-page-title"><span>YOUR LEARNING</span><h1>One step at a time.</h1><p>Save a course, review its proposed outline, and keep your own notes.</p></div><div className="dashboard-toolbar"><div className="dashboard-tabs" aria-label="Filter study plans">{[['all', 'All plans'], ['individual', 'Individual'], ['cohort', 'Cohorts']].map(([value, label]) => <button key={value} aria-pressed={filter === value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div><Link className="dashboard-button dashboard-button--primary" to="/courses">Explore courses</Link></div>{filtered.length ? <div className="dashboard-courses-grid">{filtered.map(course => <StudyCard course={course} key={course.slug}/>)}</div> : <EmptyState title={tracked.length ? 'No plans in this format yet.' : 'Your next skill starts with a plan.'}><p>{tracked.length ? 'Try another filter or explore courses to add a new plan.' : 'Add an upcoming course to review the outline and gather your questions before it launches.'}</p><Link className="dashboard-button dashboard-button--primary" to="/courses">Find a course</Link></EmptyState>}<SectionHeading title="Something to explore" detail="Individual learning and guided cohort training."/><div className="dashboard-recommendations">{courses.filter(course => !tracked.some(item => item.slug === course.slug)).slice(0, 3).map(course => <StudyCard course={course} key={course.slug} compact/>)}</div><div className="dashboard-note"><p>Study plans are personal tracking tools. Course availability, delivery dates, and fees are confirmed separately before enrollment opens.</p></div></>;
}

function CourseStudyPlan() {
  const {slug} = useParams();
  const {state, storageWarning, trackCourse, toggleModule, updateCourseNotes} = useDashboard();
  const course = courses.find(item => item.slug === slug);
  const track = state.courses.find(item => item.slug === slug);
  const [notes, setNotes] = useState(track?.notes || '');
  const [feedback, setFeedback] = useState('');
  useEffect(() => {setNotes(track?.notes || '');}, [slug, track?.notes]);
  useEffect(() => {setFeedback('');}, [slug]);
  if (!course) return <DashboardNotFound title="This course could not be found."/>;
  return <><Link className="dashboard-back-link" to="/dashboard/courses">My courses</Link><div className="dashboard-course-heading"><div className="dashboard-page-title"><span>{course.discipline.toUpperCase()} · {course.format === 'cohort' ? 'COHORT TRAINING' : 'INDIVIDUAL COURSE'}</span><h1>{course.title}</h1><p>{course.summary}</p></div><CourseMark course={course}/></div>{!track ? <EmptyState title="Make this outline your own."><p>Add a personal study plan to check off modules you have reviewed and save your questions.</p><button className="dashboard-button dashboard-button--primary" onClick={() => trackCourse(course.slug)}>Add study plan</button></EmptyState> : <div className="dashboard-course-layout"><section><div className="dashboard-panel"><SectionHeading title="Your outline checklist" detail="Mark a module when you have reviewed its description."/><CourseProgress course={course} reviewed={track.reviewedModules}/><div className="dashboard-module-list">{course.modules.map((module, index) => <label className={`dashboard-module${track.reviewedModules.includes(index) ? ' is-reviewed' : ''}`} key={module.title}><input type="checkbox" checked={track.reviewedModules.includes(index)} onChange={() => toggleModule(course.slug, index)}/><span className="dashboard-module-number">{String(index + 1).padStart(2, '0')}</span><span><strong>{module.title}</strong><span>{module.description}</span></span></label>)}</div></div><form className="dashboard-panel dashboard-notes" onSubmit={event => {event.preventDefault(); updateCourseNotes(course.slug, notes); setFeedback(storageWarning ? 'Notes updated for this visit.' : 'Notes saved on this device.');}}><label htmlFor="course-notes"><h2>Your notes & questions</h2><p>Ideas, practice goals, and things you would like to ask.</p></label><textarea id="course-notes" rows={7} maxLength={5000} value={notes} onChange={event => {setNotes(event.target.value); setFeedback('');}} placeholder="What would you like to learn or build?"/><div className="dashboard-form-footer"><button className="dashboard-button dashboard-button--primary" type="submit">Save notes</button><p role="status">{feedback}</p></div></form></section><aside className="dashboard-right-rail"><section className="dashboard-panel"><span className="dashboard-status">Upcoming course</span><h2>Plan now. Learn when it launches.</h2><p>Checking an outline records your own review. Lessons, enrollment, and certificates are not available here yet.</p><dl className="dashboard-facts"><div><dt>Level</dt><dd>{course.level}</dd></div><div><dt>Proposed modules</dt><dd>{course.modules.length}</dd></div><div><dt>Format</dt><dd>{course.format === 'cohort' ? 'Batch / cohort' : 'Individual'}</dd></div></dl><Link className="dashboard-button dashboard-button--primary" to={courseEnquiryPath(course)}>Ask about availability</Link><Link className="dashboard-text-button" to={coursePath(course)}>View full course details</Link></section><section className="dashboard-resource-callout"><h3>Make it practical.</h3><p>Bring a real idea or problem to your learning. Small, useful projects make the concepts easier to explore.</p></section></aside></div>}</>;
}

function Offers() {
  const {state, toggleOffer} = useDashboard();
  const [savedOnly, setSavedOnly] = useState(false);
  const offers = portfolioOffers.filter(offer => !savedOnly || state.savedOfferIds.includes(offer.id));
  return <><div className="dashboard-page-title"><span>WAYS TO WORK & GROW TOGETHER</span><h1>Find your next opportunity.</h1><p>Useful resources, learning formats, and conversations around your next idea.</p></div><div className="dashboard-toolbar"><div className="dashboard-tabs" aria-label="Filter offers"><button aria-pressed={!savedOnly} className={!savedOnly ? 'active' : ''} onClick={() => setSavedOnly(false)}>All opportunities</button><button aria-pressed={savedOnly} className={savedOnly ? 'active' : ''} onClick={() => setSavedOnly(true)}>Saved ({state.savedOfferIds.length})</button></div></div>{offers.length ? <div className="dashboard-offer-grid">{offers.map((offer, index) => {
    const saved = state.savedOfferIds.includes(offer.id);
    return <article className={`dashboard-offer dashboard-offer--${index % 3}`} key={offer.id}><div className="dashboard-offer-top"><span>{offer.label}</span><button aria-pressed={saved} onClick={() => toggleOffer(offer.id)} aria-label={`${saved ? 'Unsave' : 'Save'} ${offer.title}`}>{saved ? <Check size={17}/> : <Plus size={17}/>}</button></div><h2>{offer.title}</h2><p>{offer.description}</p><Link className="dashboard-button dashboard-button--white" to={offer.path}>{offer.actionLabel}</Link></article>;
  })}</div> : <EmptyState title="Keep a good opportunity close."><p>Save an opportunity from the full list to find it here later.</p><button className="dashboard-button dashboard-button--primary" onClick={() => setSavedOnly(false)}>Explore opportunities</button></EmptyState>}<div className="dashboard-note"><p>Availability and scope are confirmed through the linked course, resource, or enquiry. Saving an offer does not purchase or reserve it.</p></div></>;
}

function Resources() {
  const {state, toggleProduct, logActivity} = useDashboard();
  const [savedOnly, setSavedOnly] = useState(false);
  const products = digitalProducts.filter(product => !savedOnly || state.savedProductSlugs.includes(product.slug));
  return <><div className="dashboard-page-title"><span>A LITTLE HELP FOR YOUR NEXT IDEA</span><h1>Your resource shelf.</h1><p>Practical downloads and digital platforms worth keeping within reach.</p></div><div className="dashboard-toolbar"><div className="dashboard-tabs" aria-label="Filter resources"><button aria-pressed={!savedOnly} className={!savedOnly ? 'active' : ''} onClick={() => setSavedOnly(false)}>All resources</button><button aria-pressed={savedOnly} className={savedOnly ? 'active' : ''} onClick={() => setSavedOnly(true)}>Saved ({state.savedProductSlugs.length})</button></div><Link className="dashboard-text-button" to="/digital-products">Digital products catalog</Link></div>{products.length ? <div className="dashboard-resource-grid">{products.map(product => {
    const saved = state.savedProductSlugs.includes(product.slug);
    return <article className="dashboard-resource-card" key={product.slug}><div className={`dashboard-resource-art dashboard-resource-art--${product.preview}`} aria-hidden="true"><div><FileText size={30}/><span>{product.category === 'Resource' ? 'THE PRODUCT\nPLANNING WORKSHEET' : product.title}</span><i/><i/><i/></div></div><div className="dashboard-resource-copy"><span className="dashboard-kicker">{product.status}</span><h2><Link to={`/digital-products/${product.slug}`}>{product.title}</Link></h2><p>{product.summary}</p><div className="dashboard-card-actions">{product.download ? <a className="dashboard-button dashboard-button--primary" href={brandAsset(product.download)} download onClick={() => logActivity({kind: 'resource', title: `Downloaded resource: ${product.title}`, path: `/digital-products/${product.slug}`})}><Download size={16}/>Download worksheet</a> : <Link className="dashboard-button dashboard-button--primary" to={`/digital-products/${product.slug}`}>Explore product</Link>}<button className="dashboard-text-button" aria-pressed={saved} onClick={() => toggleProduct(product.slug)}>{saved ? 'Saved' : 'Save for later'}</button></div>{product.fileLabel && <small>{product.fileLabel}</small>}</div></article>;
  })}</div> : <EmptyState title="Make this shelf your own."><p>Save a resource or platform to keep it here for later.</p><button className="dashboard-button dashboard-button--primary" onClick={() => setSavedOnly(false)}>View all resources</button></EmptyState>}</>;
}

function DashboardSettings() {
  const {state, storageWarning, updateProfile, resetDashboard} = useDashboard();
  const [displayName, setDisplayName] = useState(state.displayName);
  const [goal, setGoal] = useState(state.goal);
  const [feedback, setFeedback] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  return <><div className="dashboard-page-title"><span>YOUR DASHBOARD PREFERENCES</span><h1>A little more personal.</h1><p>Your name, your direction, your own pace.</p></div><div className="dashboard-settings-layout"><form className="dashboard-panel dashboard-settings-form" onSubmit={event => {event.preventDefault(); updateProfile({displayName, goal}); setFeedback(storageWarning ? 'Your preferences were updated for this visit.' : 'Your preferences were saved on this device.');}}><h2>Your preferences</h2><label htmlFor="dashboard-display-name">What should we call you?</label><input id="dashboard-display-name" maxLength={60} value={displayName} onChange={event => {setDisplayName(event.target.value); setFeedback('');}} autoComplete="given-name" placeholder="Your first name"/><label htmlFor="dashboard-next-goal">Your next goal</label><textarea id="dashboard-next-goal" maxLength={500} rows={5} value={goal} onChange={event => {setGoal(event.target.value); setFeedback('');}} placeholder="For example: build and publish my first useful website."/><div className="dashboard-form-footer"><button className="dashboard-button dashboard-button--primary" type="submit">Save preferences</button><p role="status">{feedback}</p></div></form><aside className="dashboard-panel"><span className="dashboard-kicker">SAVED ON THIS DEVICE</span><h2>Your personal dashboard</h2><p>Your saved projects, insights, events, course plans, notes, resources, offers, and enquiry drafts stay in this browser. Appointment availability is checked through the booking service.</p><p>Clearing your browser data can remove your dashboard. Keep a separate copy of notes you want to retain.</p><Link className="dashboard-text-button" to="/contact">Have a question?</Link></aside></div><section className="dashboard-reset"><div><h2>Start fresh</h2><p>Remove your name, goal, study plans, notes, enquiry drafts, activity, and saved items from this browser. Confirmed appointments are managed separately in Bookings.</p></div>{confirmReset ? <div className="dashboard-reset-confirm"><strong>Clear everything in this dashboard?</strong><p>This cannot be undone.</p><div><button className="dashboard-button dashboard-button--danger" onClick={() => {resetDashboard(); setDisplayName(''); setGoal(''); setConfirmReset(false); setFeedback('Your dashboard was reset.');}}>Yes, clear my dashboard</button><button className="dashboard-text-button" onClick={() => setConfirmReset(false)}>Keep my data</button></div></div> : <button className="dashboard-button dashboard-button--outline" onClick={() => setConfirmReset(true)}>Reset dashboard</button>}</section></>;
}

function DashboardNotFound({title = 'This dashboard page could not be found.'}: {title?: string}) {
  return <EmptyState title={title}><p>Head back to your overview to continue.</p><Link className="dashboard-button dashboard-button--primary" to="/dashboard">Open overview</Link></EmptyState>;
}

export default function Dashboard() {
  const {state, storageWarning} = useDashboard();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousPathRef = useRef(location.pathname);
  function toggleMenu() {
    if (menuOpen) {
      setMenuOpen(false);
      menuToggleRef.current?.focus();
      return;
    }
    setMenuOpen(true);
    requestAnimationFrame(() => sidebarRef.current?.querySelector<HTMLAnchorElement>('nav a')?.focus());
  }
  useEffect(() => {
    setMenuOpen(false);
    const changed = previousPathRef.current !== location.pathname;
    previousPathRef.current = location.pathname;
    if (!changed) return;
    const frame = requestAnimationFrame(() => {
      const heading = contentRef.current?.querySelector<HTMLHeadingElement>('h1');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({preventScroll: true});
      } else contentRef.current?.focus({preventScroll: true});
    });
    return () => cancelAnimationFrame(frame);
  }, [location.pathname]);
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && menuOpen) {
        event.preventDefault();
        setMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);
  return <div className="personal-dashboard"><aside className={`dashboard-sidebar${menuOpen ? ' is-open' : ''}`} id="dashboard-navigation" ref={sidebarRef}><Link to="/" className="dashboard-brand" aria-label={`${brand.name} homepage`}><BrandLogo/></Link><div className="dashboard-sidebar-label">MY DASHBOARD</div><nav aria-label="Dashboard navigation">{navigation.map(item => <NavLink key={item.path} to={item.path} end={item.end} className={({isActive}) => isActive ? 'is-active' : ''}><item.icon size={19}/><span>{item.label}</span></NavLink>)}</nav><div className="dashboard-sidebar-bottom"><div className="dashboard-sidebar-callout"><span>KEEP YOUR CURIOSITY.</span><h2>Something new<br/>starts with you.</h2><Link to="/dashboard/offers">Explore opportunities</Link><div aria-hidden="true">+</div></div><Link to="/" className="dashboard-return">Back to portfolio</Link><p>My dashboard<br/>Your platform activity</p></div></aside><div className="dashboard-main"><header className="dashboard-topbar"><div className="dashboard-topbar-context"><button ref={menuToggleRef} className="dashboard-menu-toggle" aria-label={menuOpen ? 'Close dashboard menu' : 'Open dashboard menu'} aria-expanded={menuOpen} aria-controls="dashboard-navigation" onClick={toggleMenu}>{menuOpen ? <X size={21}/> : <Menu size={21}/>}</button><span>My dashboard <i>/</i> <strong>{navigation.find(item => item.end ? location.pathname === item.path : location.pathname.startsWith(item.path))?.label || 'Overview'}</strong></span></div><div className="dashboard-topbar-actions"><Link to="/portfolio" className="dashboard-catalog-link">Explore the portfolio</Link><Link to="/dashboard/settings" className="dashboard-profile" aria-label="Your dashboard preferences"><span>{initials(state.displayName)}</span><strong>{state.displayName || 'My dashboard'}</strong></Link></div></header><div className="dashboard-content" ref={contentRef} tabIndex={-1}>{storageWarning && <div className="dashboard-storage-warning" role="status">{storageWarning}</div>}<Routes><Route index element={<Overview/>}/><Route path="courses" element={<MyCourses/>}/><Route path="courses/:slug" element={<CourseStudyPlan/>}/><Route path="bookings" element={<SchedulePage embedded/>}/><Route path="schedule" element={<SchedulePage embedded/>}/><Route path="activity" element={<AllActivity/>}/><Route path="saved" element={<SavedItems/>}/><Route path="enquiries" element={<Enquiries/>}/><Route path="offers" element={<Offers/>}/><Route path="resources" element={<Resources/>}/><Route path="settings" element={<DashboardSettings/>}/><Route path="*" element={<DashboardNotFound/>}/></Routes></div></div></div>;
}
