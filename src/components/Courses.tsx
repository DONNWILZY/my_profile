import {Link, useLocation, useParams, useSearchParams} from 'react-router-dom';
import {brand} from '../brand';
import {courses, coursePath, courseEnquiryPath, type Course, type CourseFormat} from '../courseCatalog';
import './offerings.css';

const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'});

function CourseArt({course}: {course?: Course}) {
  return <div className={`course-art${course ? ` course-art-${course.discipline.toLowerCase()}` : ''}`} aria-hidden="true">
    <div className="course-art-orbit"/>
    <div className="course-art-notebook">
      <span className="course-art-label">{brand.name.toUpperCase()} / LEARNING</span>
      <strong>{course?.mark ?? 'MAKE IT\nPRACTICAL.'}</strong>
      <div className="course-art-lines"><i/><i/><i/></div>
      <span className="course-art-bottom">{course?.discipline ?? 'Ideas. Practice. Progress.'}</span>
    </div>
    <div className="course-art-note">{course?.format === 'cohort' ? 'Learn together.' : 'Build your next skill.'}<span>One practical step at a time.</span></div>
  </div>;
}

function CourseCard({course}: {course: Course}) {
  const location = useLocation();
  return <Link to={coursePath(course)} state={{from: location.pathname + location.search}} className="offering-card course-card">
    <div className="offering-card-art"><CourseArt course={course}/></div>
    <div className="offering-card-body">
      <div className="offering-card-meta"><span>{course.discipline}</span><span className="offering-status">Upcoming</span></div>
      <h3>{course.title}</h3><p>{course.summary}</p>
      <div className="course-card-facts"><span>{course.format === 'cohort' ? 'Batch / cohort' : 'Individual course'}</span><span>{course.level}</span></div>
      <span className="offering-card-link">{course.format === 'cohort' ? 'Explore the cohort' : 'View course details'}</span>
    </div>
  </Link>;
}

export function Courses() {
  const [params, setParams] = useSearchParams();
  const selected = params.get('format');
  const format = selected === 'individual' || selected === 'cohort' ? selected : 'all';
  const query = params.get('q') ?? '';
  const visible = courses.filter(course => (format === 'all' || course.format === format) && `${course.title} ${course.discipline} ${course.summary}`.toLowerCase().includes(query.trim().toLowerCase()));
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && !(key === 'format' && value === 'all')) next.set(key, value); else next.delete(key);
    setParams(next, {replace: true});
  };
  return <div className="offering-page courses-page">
    <section className="offering-wrap offering-hero">
      <div><p className="offering-eyebrow">Courses & cohort training</p><h1 className="offering-title">Learn something.<br/><em>Build something.</em></h1>
        <p className="offering-lead">Practical learning across engineering, marketing, and communication. Explore an individual course or grow alongside a cohort.</p>
        <div className="offering-actions"><button type="button" onClick={() => scrollToSection('course-catalog')} className="btn-primary">Explore courses</button><Link to="/contact?topic=Cohort+training" className="offering-text-link">Plan a team cohort</Link></div>
        <p className="offering-availability">New learning experiences are being prepared. Request availability for launch details.</p>
      </div><div className="offering-hero-art"><CourseArt/></div>
    </section>
    <section className="offering-wrap course-formats" aria-label="Learning formats">
      <div><span>01 / YOUR OWN PATH</span><h2>Individual courses</h2><p>Focus on one skill and explore a course built around practical exercises and a clear learning goal.</p></div>
      <div><span>02 / SHARED PROGRESS</span><h2>Batch & cohort training</h2><p>Learn with a group through a shared schedule, guided sessions, and project discussions.</p></div>
    </section>
    <section id="course-catalog" className="offering-wrap offering-section">
      <div className="offering-section-heading"><div><p className="offering-eyebrow">Find your next step</p><h2>Explore the learning catalog.</h2></div><span className="offering-count" aria-live="polite">{visible.length} {visible.length === 1 ? 'learning experience' : 'learning experiences'}</span></div>
      <div className="offering-toolbar"><div className="offering-filters" role="group" aria-label="Learning format">
        {([['all', 'All'], ['individual', 'Individual courses'], ['cohort', 'Cohort training']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={format === value} onClick={() => update('format', value)}>{label}</button>)}
      </div><label className="offering-search"><span className="sr-only">Search courses</span><input type="search" value={query} onChange={event => update('q', event.target.value)} placeholder="Search courses"/></label></div>
      {visible.length ? <div className="offering-grid course-grid">{visible.map(course => <CourseCard key={course.slug} course={course}/>)}</div> : <div className="offering-empty"><h3>No courses found.</h3><p>Try a different topic or explore all learning experiences.</p><button type="button" className="btn-light" onClick={() => setParams({})}>Clear filters</button></div>}
    </section>
    <section className="offering-wrap offering-section"><div className="offering-callout"><div><p className="offering-eyebrow">For teams & communities</p><h2>A learning experience for your group.</h2><p>Share your goals, experience level, and preferred topics to discuss a dedicated training batch.</p></div><Link to="/contact?topic=Cohort+training&item=Dedicated+team+cohort" className="btn-primary">Discuss a team cohort</Link></div></section>
  </div>;
}

export function CourseDetails({format}: {format: CourseFormat}) {
  const {slug} = useParams();
  const location = useLocation();
  const course = courses.find(item => item.slug === slug && item.format === format);
  if (!course) return <div className="offering-page"><div className="offering-wrap offering-empty offering-missing"><p className="offering-eyebrow">Courses</p><h1>Course not found.</h1><p>Explore the catalog to find an individual course or a cohort.</p><Link to="/courses" className="btn-primary">Browse courses</Link></div></div>;
  const cohort = course.format === 'cohort';
  const related = courses.find(item => item.slug === course.relatedSlug);
  const from = (location.state as {from?: unknown} | null)?.from;
  const back = typeof from === 'string' && (from === '/courses' || from.startsWith('/courses?')) ? from : '/courses';
  return <div className="offering-page course-details">
    <div className="offering-wrap">
      <nav className="offering-breadcrumb" aria-label="Breadcrumb"><Link to={back}>Courses</Link><span>/</span><span>{cohort ? 'Cohort training' : 'Individual course'}</span></nav>
      <section className="offering-hero course-detail-hero"><div><div className="offering-card-meta"><p className="offering-eyebrow">{course.discipline} / {course.level}</p><span className="offering-status">Upcoming</span></div><h1 className="offering-title">{course.title}</h1><p className="offering-lead">{course.summary}</p><div className="offering-actions"><Link to={courseEnquiryPath(course)} className="btn-primary">{cohort ? 'Enquire about the next batch' : 'Request course availability'}</Link><button type="button" onClick={() => scrollToSection('course-outline')} className="offering-text-link">Explore the outline</button></div></div><div className="offering-hero-art"><CourseArt course={course}/></div></section>
      <div className="offering-detail-layout offering-section">
        <div className="offering-detail-copy">
          <section><p className="offering-eyebrow">The experience</p><h2>{cohort ? 'Learn with a shared rhythm.' : 'A practical place to start.'}</h2><p>{course.overview}</p></section>
          <section><h2>What you will work toward</h2><ul className="offering-list">{course.outcomes.map(outcome => <li key={outcome}>{outcome}</li>)}</ul></section>
          <section id="course-outline"><div className="offering-section-heading"><h2>Proposed course outline</h2><span className="offering-count">{course.modules.length} modules</span></div><div className="course-modules">{course.modules.map((module, index) => <details key={module.title} open={index === 0}><summary><span>{String(index + 1).padStart(2, '0')}</span><h3>{module.title}</h3><b className="course-module-toggle" aria-hidden="true"/></summary><p>{module.description}</p></details>)}</div><p className="course-outline-note">The final syllabus and delivery details will be shared before enrollment opens.</p></section>
          <section className="course-audience"><div><h2>Who this is for</h2><ul className="offering-list">{course.audience.map(item => <li key={item}>{item}</li>)}</ul></div><div><h2>What to bring</h2><ul className="offering-list">{course.requirements.map(item => <li key={item}>{item}</li>)}</ul></div></section>
          {cohort && <section className="offering-panel course-batch-info"><p className="offering-eyebrow">Next batch</p><h2>Dates to be announced.</h2><p>Enquire about the next open group or a dedicated batch for your team. The schedule, session format, fees, and joining instructions will be shared once confirmed.</p><Link to={courseEnquiryPath(course)} className="offering-text-link">Discuss your availability</Link></section>}
        </div>
        <aside className="offering-panel course-enquiry" aria-label="Course availability"><p className="offering-eyebrow">Your next step</p><h2>{cohort ? 'Join a future learning group.' : 'Make room for a new skill.'}</h2><dl className="course-facts"><div><dt>Format</dt><dd>{cohort ? 'Batch / cohort training' : 'Individual course'}</dd></div><div><dt>Level</dt><dd>{course.level}</dd></div><div><dt>{cohort ? 'Next batch' : 'Availability'}</dt><dd>{cohort ? 'Dates to be announced' : 'Upcoming'}</dd></div><div><dt>Schedule & fees</dt><dd>To be confirmed</dd></div></dl><Link to={courseEnquiryPath(course)} className="btn-primary">Request details</Link><p className="course-outline-note">An enquiry starts a conversation. Enrollment will open when the course details are confirmed.</p><p className="course-instructor">Prepared by <Link to="/about">{brand.fullName}</Link></p></aside>
      </div>
      {related && <section className="offering-section course-related"><div><p className="offering-eyebrow">Another way to learn</p><h2>{related.format === 'cohort' ? 'Prefer learning with a group?' : 'Explore the individual course.'}</h2><p>{related.summary}</p><Link className="btn-light" to={coursePath(related)}>Explore {related.format === 'cohort' ? 'cohort training' : 'the course'}</Link></div><CourseCard course={related}/></section>}
    </div>
  </div>;
}
