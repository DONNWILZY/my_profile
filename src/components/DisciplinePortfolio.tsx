import ProjectVisual from './ProjectVisual';
import {projectCollectionPath,projectDetailsPath} from '../projectCatalog';
import {useEffect, useId, useState, type FormEvent} from 'react';
import {Link} from 'react-router-dom';
import {motion, useReducedMotion} from 'framer-motion';
import {brand} from '../brand';
import {posts} from '../data';
import {disciplinePortfolios, type Discipline} from '../portfolioData';
import portrait from '../../my profile/images/IMG-20190209-WA0004.jpg';
import storyPortrait from '../../my profile/images/IMG-20190225-WA0024.jpg';
import './discipline-portfolio.css';

const contactEmail = (import.meta.env.VITE_CONTACT_EMAIL as string|undefined)?.trim();
const MotionLink = motion(Link);
const sections = [['services','Services'], ['works','Works'], ['insights','Insights']] as const;

export default function DisciplinePortfolio({discipline}: {discipline: Discipline}){
  const data = disciplinePortfolios[discipline];
  const reduced = useReducedMotion();
  const filterId = `portrait-key-${useId().replace(/:/g,'')}`;
  const [activeCapability, setActiveCapability] = useState(0);
  const [activeSection, setActiveSection] = useState('services');
  const [approach, setApproach] = useState(0);
  const [preparedBrief, setPreparedBrief] = useState('');
  const [name, setName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [firstName, ...otherNames] = brand.fullName.split(' ');
  const otherDiscipline = discipline === 'engineering' ? 'marketing' : 'engineering';
  const workCount = new Set(data.work.map(work=>work.project.link)).size;
  const scrollTo = (section: string)=>document.getElementById(`${discipline}-${section}`)?.scrollIntoView({behavior: reduced ? 'instant' : 'smooth', block:'start'});

  useEffect(()=>{
    const observer = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting)setActiveSection(entry.target.id.replace(`${discipline}-`,''))});
    }, {rootMargin:'-15% 0px -65% 0px'});
    sections.forEach(([id])=>{const section=document.getElementById(`${discipline}-${id}`);if(section)observer.observe(section)});
    return ()=>observer.disconnect();
  },[discipline]);

  const prepareProject = (event: FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    setPreparedBrief(`${data.enquiry}\n\nName: ${name.trim()}\nEmail: ${senderEmail.trim()}\n\nProject details:\n${message.trim()}`);
  };

  return <article className={`discipline-portfolio discipline-${discipline}`}>
    <svg width="0" height="0" className="portrait-filter" aria-hidden="true"><defs><filter id={filterId} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -10 -10 -10 0 29"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs></svg>
    <section className="discipline-hero" aria-labelledby={`${discipline}-title`}>
      <div className="discipline-inner discipline-local-nav"><span>{data.label}</span><nav aria-label="On this portfolio">{sections.map(([id,label])=><button key={id} type="button" onClick={()=>{setActiveSection(id);scrollTo(id)}} className={activeSection===id ? 'is-current' : ''}>{label}</button>)}</nav></div>
      <div className="discipline-inner discipline-hero-layout">
        <img className="discipline-hero-portrait" src={portrait} alt={`${brand.fullName}, ${data.role.toLowerCase()}`} style={{filter:`url(#${filterId})`}} fetchPriority="high"/>
        <motion.div className="discipline-name" initial={reduced ? false : {opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.65}}><h1 id={`${discipline}-title`}>{firstName}<br/>{otherNames.join(' ')}<span>.</span></h1><span className="discipline-name-rule"/><div className="discipline-socials">{brand.socials.slice(0,3).map(social=><a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer">{social.name}</a>)}</div></motion.div>
        <div className="discipline-introduction"><p className="discipline-kicker">Introduction</p><h2>{data.role}, based in {brand.location}.</h2><p>{data.introduction}</p><Link to="/about" className="discipline-text-link">My story</Link></div>
      </div>
    </section>

    <section className="discipline-services" id={`${discipline}-services`} aria-label="Services and approach">
      <div className="discipline-inner">
        <div className="discipline-contact-overview"><div><p className="discipline-kicker">Contact</p><h2>Any type of query<br/>& discussion.</h2><p>{data.contactCopy}</p>{contactEmail ? <a className="discipline-text-link" href={`mailto:${contactEmail}`}>{contactEmail}</a> : <Link className="discipline-text-link" to="/contact">Start a conversation</Link>}</div><div><h2>{data.statement}</h2><p>{data.statementCopy}</p><dl className="discipline-facts"><div><dt>{String(workCount).padStart(2,'0')}</dt><dd>{discipline === 'marketing' ? 'Featured\nbrand' : 'Selected\nprojects'}</dd></div><div><dt>{String(data.capabilities.length).padStart(2,'0')}</dt><dd>Connected<br/>capabilities</dd></div></dl></div></div>
        <div className="discipline-capabilities">{data.capabilities.map((capability,index)=><button type="button" key={capability.title} className={activeCapability===index ? 'is-selected' : ''} aria-pressed={activeCapability===index} aria-controls={`${discipline}-capability-detail`} onClick={()=>setActiveCapability(index)}><span className="capability-number">0{index+1}</span><strong>{capability.title}</strong><span>{capability.detail}</span></button>)}</div>
        <p className="discipline-capability-detail" id={`${discipline}-capability-detail`} aria-live="polite">{data.capabilities[activeCapability].description}</p>
      </div>
    </section>

    <section className="discipline-work" id={`${discipline}-works`} aria-labelledby={`${discipline}-work-title`}>
      <div className="discipline-inner">
        <div className="discipline-focus" aria-label="Areas of focus">{data.focus.map(focus=><span key={focus}>{focus}</span>)}</div>
        <div className="discipline-work-grid"><div className="discipline-work-intro"><p className="discipline-kicker">Portfolio</p><h2 id={`${discipline}-work-title`}>{data.workHeading}</h2><p>{data.workDescription}</p><Link to={projectCollectionPath(discipline)} className="discipline-text-link">View all projects</Link></div>{data.work.map((work,index)=><MotionLink className={`discipline-project project-${index}`} key={`${work.preview}-${work.project.title}`} to={projectDetailsPath(discipline,work.slug)} initial={reduced ? false : {opacity:0,y:25}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:.55}}><div className="discipline-project-heading"><h3>{work.title}</h3><span>{work.category}</span></div><p>{work.description}</p><ProjectVisual work={work}/><div className="discipline-project-caption"><span>Illustrative project visual</span><span>View project details</span></div></MotionLink>)}</div>
      </div>
    </section>

    <section className="discipline-insights" id={`${discipline}-insights`} aria-labelledby={`${discipline}-insights-title`}><div className="discipline-inner"><div className="discipline-insight-list"><div><p className="discipline-kicker">Insights</p><h2 id={`${discipline}-insights-title`}>What's new?<br/>Ideas & perspectives.</h2></div><div>{posts.map(post=><Link to={`/blog/${post.slug}`} key={post.slug}><span>{post.category}<small>{post.date}</small></span><h3>{post.title}</h3></Link>)}</div></div><div className="discipline-approach"><img src={storyPortrait} alt={brand.fullName} loading="lazy"/><div><p className="discipline-kicker">My approach</p><div className="approach-copy" aria-live="polite"><blockquote>{data.approaches[approach].quote}</blockquote><p>{data.approaches[approach].detail}</p><span>{brand.fullName}<small>{data.approaches[approach].title}</small></span></div><div className="approach-controls" role="group" aria-label="Explore my approach">{data.approaches.map((item,index)=><button type="button" key={item.title} onClick={()=>setApproach(index)} aria-pressed={approach===index} aria-label={item.title}><span/></button>)}</div></div></div></div></section>

    <section className="discipline-enquiry" aria-labelledby={`${discipline}-enquiry-title`}><div className="discipline-inner discipline-enquiry-layout"><div><p className="discipline-kicker">Have something in mind?</p><h2 id={`${discipline}-enquiry-title`}>Got a project?<br/>Let's talk.</h2><p>{data.contactCopy}</p><Link to="/book" className="discipline-text-link">Book a conversation</Link><Link className="discipline-other-portfolio" to={`/${otherDiscipline}`}>Explore my {otherDiscipline} portfolio</Link></div><div><h2>Tell me about<br/>your next idea.</h2><form onSubmit={prepareProject}><label htmlFor={`${discipline}-name`}>What's your name?</label><input id={`${discipline}-name`} name="name" autoComplete="name" value={name} onChange={event=>{setName(event.target.value);setPreparedBrief('')}} placeholder="Your name" required maxLength={120}/><label htmlFor={`${discipline}-email`}>Your email</label><input id={`${discipline}-email`} name="email" type="email" autoComplete="email" value={senderEmail} onChange={event=>{setSenderEmail(event.target.value);setPreparedBrief('')}} placeholder="you@example.com" required maxLength={254}/><label htmlFor={`${discipline}-message`}>Tell me about your project</label><textarea id={`${discipline}-message`} name="message" rows={3} value={message} onChange={event=>{setMessage(event.target.value);setPreparedBrief('')}} placeholder="What would you like to build or grow?" required minLength={10} maxLength={5000}/><button className="discipline-submit" type="submit">Prepare project brief</button><p className="discipline-form-note">Prepare your brief here, then choose how to send it.</p></form>{preparedBrief&&<div className="discipline-brief" role="status"><p>Your brief is ready. Choose your next step.</p><a href={`data:text/plain;charset=utf-8,${encodeURIComponent(preparedBrief)}`} download={`${discipline}-project-brief.txt`}>Download brief</a>{contactEmail ? <a href={`mailto:${contactEmail}?subject=${encodeURIComponent(data.enquiry)}&body=${encodeURIComponent(preparedBrief)}`}>Open email app</a> : <Link to="/contact">Choose a contact method</Link>}</div>}</div></div></section>
  </article>;
}
