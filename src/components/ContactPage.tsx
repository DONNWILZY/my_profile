import {useEffect, useRef, useState} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import {brand} from '../brand';
import './offerings.css';

const email = (import.meta.env.VITE_CONTACT_EMAIL as string | undefined)?.trim() || '';
const topics = ['Project collaboration', 'Software engineering', 'Digital marketing consultancy', 'Public speaking', 'Courses', 'Cohort training', 'Digital products', 'General enquiry'];

export default function ContactPage() {
  const [params] = useSearchParams();
  const requestedTopic = params.get('topic') ?? '';
  const item = (params.get('item') ?? '').slice(0, 180);
  const [topic, setTopic] = useState(topics.includes(requestedTopic) ? requestedTopic : topics[0]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const messageInput = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    setTopic(topics.includes(requestedTopic) ? requestedTopic : topics[0]);
    const learning = requestedTopic === 'Courses' || requestedTopic === 'Cohort training';
    setMessage(item ? `Hello Godswill,\n\nI'd like to know more about ${item}.\n\n${learning ? 'Please share availability, the format, schedule, and fees when confirmed.\n\nMy learning goals:\n' : 'My question:\n'}` : '');
    setStatus('');
  }, [requestedTopic, item]);
  const brief = `Enquiry: ${topic}${item ? `\nRegarding: ${item}` : ''}\n\n${message.trim()}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(brief);
      setStatus('Enquiry copied. Paste it into an email or a message on your preferred platform.');
    } catch {
      messageInput.current?.focus();
      messageInput.current?.select();
      setStatus('Select and copy your message, then share it through one of the social profiles.');
    }
  };
  return <div className="offering-page"><div className="offering-wrap">
    <section className="offering-hero">
      <div><p className="offering-eyebrow">Get in touch</p><h1 className="offering-title">Have an idea?<br/><em>Let's talk.</em></h1><p className="offering-lead">Start a conversation about a project, a course, a cohort for your team, or your next digital product.</p><div className="offering-actions"><Link to="/book" className="btn-light">Explore booking options</Link></div></div>
      <div className="offering-panel contact-enquiry">
        <p className="offering-eyebrow">Prepare your enquiry</p><h2>What would you like to explore?</h2>
        <label htmlFor="enquiry-topic">Enquiry type</label><select id="enquiry-topic" value={topic} onChange={event => {setTopic(event.target.value); setStatus('');}}>{topics.map(value => <option key={value}>{value}</option>)}</select>
        {item && <><label htmlFor="enquiry-item">Regarding</label><input id="enquiry-item" value={item} readOnly/></>}
        <label htmlFor="enquiry-message">Your message</label><textarea ref={messageInput} id="enquiry-message" value={message} onChange={event => {setMessage(event.target.value); setStatus('');}} placeholder="Tell me about your goals, your questions, and how I can help."/>
        <div className="offering-actions"><button className="btn-primary disabled:opacity-50 disabled:transform-none" type="button" onClick={copy} disabled={!message.trim()}>Copy enquiry</button>{email && <a className="btn-light" href={`mailto:${email}?subject=${encodeURIComponent(item ? `${topic}: ${item}` : topic)}&body=${encodeURIComponent(message)}`}>Open email app</a>}</div>
        <p className="contact-enquiry-status" role="status">{status || 'Your message stays on this page until you copy it or open your email app. You can share it through the profiles below.'}</p>
      </div>
    </section>
    <section className="offering-callout"><div><p className="offering-eyebrow">Stay connected</p><h2>Continue the conversation.</h2><p>Use your preferred platform to get in touch or follow along with my work.</p></div><nav className="offering-actions" aria-label="Contact profiles">{brand.socials.map(social => <a className="btn-light" key={social.name} href={social.url} target="_blank" rel="noopener noreferrer">{social.name}<span className="sr-only"> (opens in a new tab)</span></a>)}</nav></section>
  </div></div>;
}
