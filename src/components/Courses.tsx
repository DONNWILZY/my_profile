import {Bookmark, Check} from 'lucide-react';
import {Link, useLocation, useParams, useSearchParams} from 'react-router-dom';
import {brand} from '../brand';
import {courses, coursePath, courseEnquiryPath, type Course, type CourseFormat} from '../courseCatalog';
import {useDashboard} from '../dashboard/DashboardProvider';
import CourseCover from './CourseCover';
import portrait from '../../my profile/images/IMG-20190225-WA0024.jpg';
import './course-learning.css';

const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'});

function SaveCourse({course, compact = false}: {course: Course; compact?: boolean}) {
  const {state, trackCourse} = useDashboard();
  const saved = state.courses.some(item => item.slug === course.slug);
  if (saved) return <Link to={`/dashboard/courses/${course.slug}`} className={compact ? 'learning-save is-saved' : 'learning-button learning-button-light'} aria-label={compact ? `Open study plan for ${course.title}` : undefined} title={compact ? 'Open your study plan' : undefined}><Bookmark size={compact ? 17 : 16} fill="currentColor"/>{!compact && 'Open my study plan'}</Link>;
  return <button type="button" className={compact ? 'learning-save' : 'learning-button learning-button-light'} aria-label={compact ? `Save ${course.title} to my learning` : undefined} title={compact ? 'Save to my learning' : undefined} onClick={() => trackCourse(course.slug)}><Bookmark size={compact ? 17 : 16}/>{!compact && 'Save to my learning'}</button>;
}

export function CourseCard({course}: {course: Course}) {
  const location = useLocation();
  const linkState = {from: location.pathname + location.search};
  return <article className="learning-card" data-course={course.slug}>
    <div className="learning-card-media"><Link to={coursePath(course)} state={linkState} className="learning-card-cover" tabIndex={-1} aria-hidden="true"><CourseCover course={course} variant="card"/></Link><SaveCourse course={course} compact/></div>
    <div className="learning-card-body"><div className="learning-card-meta"><span>{course.discipline}</span><span className="learning-status">Upcoming</span></div>
      <h3><Link to={coursePath(course)} state={linkState} className="learning-card-title">{course.title}</Link></h3><p>{course.summary}</p>
      <div className="learning-card-facts"><span>{course.modules.length} modules</span><span>{course.level}</span></div>
      <div className="learning-card-footer"><span>{course.format === 'cohort' ? 'Batch / cohort' : 'Individual course'}</span><Link to={coursePath(course)} state={linkState} aria-label={`View details for ${course.title}`}>View details</Link></div>
    </div>
  </article>;
}

const faqs = [
  ['Are the courses open for enrollment?', 'The courses are being prepared. Explore the proposed outlines and request availability. The final syllabus, delivery format, dates, and fees will be confirmed before enrollment opens.'],
  ['How is a cohort different from an individual course?', 'An individual course focuses on a specific skill. A cohort brings a group together around a shared schedule, guided practice, and discussion. Explore each page for its proposed format.'],
  ['Can I keep track of courses I am interested in?', 'Yes. Save a course to your learning dashboard, review its outline, and keep your own notes. Your dashboard is saved on this device. Saved courses and reviewed modules are a personal study plan, not enrollment or certification.'],
  ['Can you organize training for my team or community?', 'Yes. Send an enquiry with your group size, experience level, goals, and preferred topics to discuss a dedicated batch. Dates and delivery arrangements are agreed before training is confirmed.'],
];

function CourseFAQ() {
  return <div className="learning-faq">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true"/></summary><p>{answer}</p></details>)}</div>;
}

export function Courses() {
  const [params, setParams] = useSearchParams();
  const {state} = useDashboard();
  const selected = params.get('format');
  const format = selected === 'individual' || selected === 'cohort' ? selected : 'all';
  const query = params.get('q') ?? '';
  const topic = params.get('topic') ?? 'all';
  const disciplines = [...new Set(courses.map(course => course.discipline))];
  const validTopic = disciplines.includes(topic as Course['discipline']) ? topic : 'all';
  const visible = courses.filter(course => (format === 'all' || course.format === format) && (validTopic === 'all' || course.discipline === validTopic) && `${course.title} ${course.discipline} ${course.summary}`.toLowerCase().includes(query.trim().toLowerCase()));
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && !(key !== 'q' && value === 'all')) next.set(key, value); else next.delete(key);
    setParams(next, {replace: true});
  };
  const chooseFormat = (value: CourseFormat) => {setParams({format: value}); scrollToSection('course-catalog');};
  return <div className="learning-page courses-page">
    <section className="learning-wrap learning-hero">
      <div className="learning-hero-copy"><p className="learning-kicker">Learn with {brand.name}</p><h1 className="learning-title">Your next chapter<br/>starts with <span>a skill.</span></h1>
        <p className="learning-description">Build useful things. Reach the right people. Share your ideas with confidence. Practical courses for the work you want to do next.</p>
        <div className="learning-actions"><button type="button" className="learning-button" onClick={() => scrollToSection('course-catalog')}>Find your course</button><Link to="/dashboard" className="learning-text-link">My learning space{state.courses.length > 0 && ` (${state.courses.length})`}</Link></div>
        <p className="learning-note">Upcoming courses & cohorts. Save your interests or enquire about the next launch.</p>
      </div><div className="learning-hero-visual"><CourseCover variant="hero"/></div>
    </section>
    <section className="learning-wrap learning-proof" aria-label="Learning at a glance">
      <div><strong>{disciplines.length}</strong><span>Connected disciplines</span></div><div><strong>{courses.filter(course => course.format === 'individual').length}</strong><span>Individual course outlines</span></div><div><strong>{courses.filter(course => course.format === 'cohort').length}</strong><span>Cohort experiences</span></div><div><strong>Your pace.</strong><span>Your next practical step.</span></div>
    </section>
    <section id="course-catalog" className="learning-wrap learning-section">
      <div className="learning-section-head"><div><p className="learning-kicker">Explore the courses</p><h2>Find a skill worth building.</h2><p>Start with one course. Make room for what comes next.</p></div><span className="learning-result-count" role="status">{visible.length} {visible.length === 1 ? 'learning experience' : 'learning experiences'}</span></div>
      <div className="learning-toolbar"><div className="learning-filters" role="group" aria-label="Learning format">{([['all', 'All courses'], ['individual', 'Individual courses'], ['cohort', 'Cohort training']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={format === value} onClick={() => update('format', value)}>{label}</button>)}</div><label className="learning-search"><span className="sr-only">Search courses</span><input type="search" value={query} onChange={event => update('q', event.target.value)} placeholder="Find something to learn"/></label></div>
      <div className="learning-topic-filter"><label htmlFor="learning-topic">Explore a discipline</label><select id="learning-topic" value={validTopic} onChange={event => update('topic', event.target.value)}><option value="all">All disciplines</option>{disciplines.map(discipline => <option key={discipline}>{discipline}</option>)}</select></div>
      {visible.length ? <div className="learning-grid course-grid">{visible.map(course => <CourseCard key={course.slug} course={course}/>)}</div> : <div className="learning-empty"><h3>No courses found.</h3><p>Try another topic or explore all the learning experiences.</p><button type="button" className="learning-button learning-button-light" onClick={() => setParams({})}>Clear filters</button></div>}
    </section>
    <section className="learning-wrap learning-section"><div className="learning-section-head"><div><p className="learning-kicker">Choose how you grow</p><h2>Your own path.<br/>Or a shared journey.</h2></div></div><div className="learning-formats">
      <article><span className="learning-kicker">01 / Individual courses</span><h3>One skill.<br/>A clear place to start.</h3><p>Explore focused outlines, practical exercises, and a learning goal you can make your own.</p><button className="learning-text-link" type="button" onClick={() => chooseFormat('individual')}>Explore individual courses</button></article>
      <article><span className="learning-kicker">02 / Batch & cohort training</span><h3>Better questions.<br/>Shared progress.</h3><p>Build with a group through guided sessions, a shared schedule, and project conversations.</p><button className="learning-text-link" type="button" onClick={() => chooseFormat('cohort')}>Explore cohort training</button></article>
    </div></section>
    <section className="learning-wrap learning-section learning-about"><div className="learning-about-photo"><img src={portrait} alt={brand.fullName} loading="lazy"/><span>Engineer. Strategist. Speaker.</span></div><div><p className="learning-kicker">Meet your guide</p><h2>Real work.<br/>Thoughtful learning.</h2><p>I'm {brand.fullName}. I connect software engineering, digital marketing, and communication to turn ideas into useful experiences.</p><p>These courses bring that same approach to learning: start with a real problem, practice with purpose, and reflect on what you can improve.</p><ul><li>Practical topics that connect to everyday work.</li><li>Clear outlines to help you choose your starting point.</li><li>Space to build your own learning plan.</li></ul><Link to="/about" className="learning-text-link">More about {brand.name}</Link></div></section>
    <section className="learning-wrap learning-section"><div className="learning-section-head"><div><p className="learning-kicker">A little clarity</p><h2>Before you take the next step.</h2></div></div><CourseFAQ/></section>
    <section className="learning-wrap learning-section"><div className="learning-callout"><div><p className="learning-kicker">For teams & communities</p><h2>A shared goal.<br/>A stronger learning group.</h2><p>Let's shape a dedicated training batch around your team's goals.</p></div><Link to="/contact?topic=Cohort+training&item=Dedicated+team+cohort" className="learning-button">Discuss your cohort</Link></div></section>
  </div>;
}

export function CourseDetails({format}: {format: CourseFormat}) {
  const {slug} = useParams();
  const location = useLocation();
  const {state} = useDashboard();
  const course = courses.find(item => item.slug === slug && item.format === format);
  if (!course) return <div className="learning-page"><div className="learning-wrap learning-empty learning-missing"><p className="learning-kicker">Courses</p><h1>Course not found.</h1><p>Explore the catalog to find an individual course or a cohort.</p><Link to="/courses" className="learning-button">Browse courses</Link></div></div>;
  const cohort = course.format === 'cohort';
  const related = courses.filter(item => item.slug === course.relatedSlug || (item.discipline !== course.discipline && item.format === 'individual')).slice(0, 3);
  const track = state.courses.find(item => item.slug === course.slug);
  const from = (location.state as {from?: unknown} | null)?.from;
  const back = typeof from === 'string' && (from === '/courses' || from.startsWith('/courses?')) ? from : '/courses';
  return <div className="learning-page learning-detail course-details"><div className="learning-wrap">
    <nav className="learning-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><Link to={back}>Courses</Link><span>/</span><span aria-current="page">{cohort ? 'Cohort training' : 'Individual course'}</span></nav>
    <div className="learning-detail-layout">
      <section className="learning-detail-heading"><p className="learning-kicker">{course.discipline} / {course.level}</p><h1 className="learning-title">{course.title}</h1><p className="learning-description">{course.summary}</p><div className="learning-detail-badges"><span>{course.modules.length} proposed modules</span><span>{cohort ? 'Batch / cohort' : 'Individual course'}</span><span>Upcoming</span></div><div className="learning-actions"><SaveCourse course={course}/><button className="learning-text-link" type="button" onClick={() => scrollToSection('course-outline')}>Explore the syllabus</button></div></section>
      <aside className="learning-enrollment" aria-label="Course availability"><CourseCover course={course} variant="detail"/><div className="learning-enrollment-body"><span className="learning-status">Upcoming {cohort ? 'cohort' : 'course'}</span><h2>{cohort ? 'Learn with a group.' : 'Your next skill starts here.'}</h2><p>Availability & fees to be confirmed.</p><Link to={courseEnquiryPath(course)} className="learning-button">{cohort ? 'Enquire about the next batch' : 'Request course availability'}</Link><SaveCourse course={course}/><dl><div><dt>Format</dt><dd>{cohort ? 'Batch / cohort training' : 'Individual course'}</dd></div><div><dt>Level</dt><dd>{course.level}</dd></div><div><dt>Syllabus</dt><dd>{course.modules.length} proposed modules</dd></div><div><dt>{cohort ? 'Next batch' : 'Launch date'}</dt><dd>To be announced</dd></div></dl>{track && <Link className="learning-progress-link" to={`/dashboard/courses/${course.slug}`}><span>{track.reviewedModules.length} / {course.modules.length} outline modules reviewed</span><progress value={track.reviewedModules.length} max={course.modules.length} aria-label="Personal outline review progress"/></Link>}<p className="learning-note">Save a personal study plan or start an enquiry. Enrollment opens when the final course details are confirmed.</p></div></aside>
      <div className="learning-detail-story">

        <section><p className="learning-kicker">Course overview</p><h2>{cohort ? 'A little structure. A shared rhythm.' : 'A practical place to start.'}</h2><p>{course.overview}</p></section>
        <section className="learning-outcomes"><div><h2>What you will work toward</h2><ul>{course.outcomes.map(outcome => <li key={outcome}><Check size={15}/><span>{outcome}</span></li>)}</ul></div><div><h2>Who this is for</h2><ul>{course.audience.map(item => <li key={item}><Check size={15}/><span>{item}</span></li>)}</ul></div></section>
        <section id="course-outline"><div className="learning-section-head"><div><p className="learning-kicker">A look inside</p><h2>Proposed course syllabus</h2></div><span className="learning-result-count">{course.modules.length} modules</span></div><div className="learning-modules">{course.modules.map((module, index) => <details key={module.title} open={index === 0}><summary><span>{String(index + 1).padStart(2, '0')}</span><h3>{module.title}</h3><b aria-hidden="true"/></summary><p>{module.description}</p></details>)}</div><p className="learning-note">The final syllabus and delivery details will be shared before enrollment opens. You can review the outline and keep notes in your personal dashboard.</p></section>
        <section><h2>What to bring</h2><ul className="learning-requirements">{course.requirements.map(item => <li key={item}>{item}</li>)}</ul></section>
        {cohort && <section className="learning-batch-info"><p className="learning-kicker">The next batch</p><h2>Good things take a little planning.</h2><p>Dates are to be announced. Enquire about the next open group or a dedicated batch for your team. The schedule, session format, fees, and joining instructions will be shared once confirmed.</p><Link to={courseEnquiryPath(course)} className="learning-text-link">Discuss your availability</Link></section>}
        <section className="learning-instructor"><img className="learning-instructor-photo" src={portrait} alt={brand.fullName} loading="lazy"/><div><p className="learning-kicker">Your instructor</p><h2>{brand.fullName}</h2><p>Software engineer, digital marketing strategist, and public speaker. Connecting the work of building products with the skills to share them.</p><Link to="/about" className="learning-text-link">Meet {brand.name}</Link></div></section>
        <section><p className="learning-kicker">Your questions, answered</p><h2>Before you get started.</h2><CourseFAQ/></section>
      </div>

    </div>
    <section className="learning-section learning-detail-related"><div className="learning-section-head"><div><p className="learning-kicker">Keep the momentum going</p><h2>Make room for another skill.</h2></div><Link to="/courses" className="learning-text-link">Explore all courses</Link></div><div className="learning-grid">{related.map(item => <CourseCard key={item.slug} course={item}/>)}</div></section>
    <section className="learning-section"><div className="learning-callout"><div><p className="learning-kicker">A space for your next chapter</p><h2>Keep your learning<br/>in one place.</h2><p>Save courses, review their outlines, and plan your next conversation.</p></div><Link to="/dashboard" className="learning-button">Open my dashboard</Link></div></section>
  </div></div>;
}
