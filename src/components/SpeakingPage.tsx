import {useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import {brand} from '../brand';
import {events} from '../data';
import PlatformSaveButton from '../dashboard/PlatformSaveButton';
import portrait from '../../my profile/images/IMG-20190225-WA0024.jpg';
import stagePhoto from '../assets/speaking/stage.jpg';
import discussionPhoto from '../assets/speaking/discussion.jpg';
import collaborationPhoto from '../assets/speaking/collaboration.jpg';
import learningPhoto from '../assets/speaking/learning.jpg';
import buildingPhoto from '../assets/speaking/building.jpg';
import audiencePhoto from '../assets/speaking/audience.jpg';
import './speaking-page.css';

const photos = {
  stage: stagePhoto,
  discussion: discussionPhoto,
  collaboration: collaborationPhoto,
  learning: learningPhoto,
  building: buildingPhoto,
  audience: audiencePhoto,
};

const conversations = [
  {category: 'Engineering', title: 'Building products people can actually use.', copy: 'From an early idea to a useful digital experience, with people at the centre.', image: photos.building},
  {category: 'Growth', title: 'Where good products meet meaningful growth.', copy: 'Connecting engineering, marketing, and a clearer understanding of your audience.', image: photos.discussion},
  {category: 'Community', title: 'Turning digital skills into possibilities.', copy: 'A practical conversation about learning, careers, and creating opportunities.', image: photos.collaboration},
];

const formats = [
  {name: 'Conference talks', label: 'A perspective for your stage.', copy: 'A focused talk shaped around your event theme, audience, and the ideas you want people to take away. Topics span product engineering, digital growth, and careers in technology.'},
  {name: 'Panels & conversations', label: 'Make room for different perspectives.', copy: 'Thoughtful contributions to moderated panels, interviews, and open conversations about building products, growing brands, and working across disciplines.'},
  {name: 'Practical workshops', label: 'Give an idea room to become a skill.', copy: 'An interactive session with a clear learning goal, guided discussion, and practical activities. We can agree on the level, format, and materials around your audience.'},
  {name: 'Community sessions', label: 'Useful conversations, closer to people.', copy: 'Sessions for student groups, developer communities, and career networks exploring digital skills, finding direction, and learning through collaboration.'},
];

const topics = [
  {category: 'Technology & products', title: 'Build with purpose.', copy: 'Software engineering, product thinking, and making complex digital experiences feel simple.', image: photos.learning, tags: ['Product thinking', 'Engineering']},
  {category: 'Marketing & growth', title: 'Connect ideas to people.', copy: 'Digital strategy, discoverability, useful content, and bringing products to the right audience.', image: photos.discussion, tags: ['Digital strategy', 'Growth']},
  {category: 'Skills & community', title: 'Create your next possibility.', copy: 'Digital skills, careers in technology, and the communities that help people keep learning.', image: photos.collaboration, tags: ['Digital skills', 'Community']},
];

function invitationPath(item: string) {
  return `/contact?${new URLSearchParams({topic: 'Public speaking', item}).toString()}`;
}

function Waveform() {
  const heights = [5, 9, 15, 8, 19, 13, 24, 16, 11, 22, 28, 15, 9, 19, 12, 24, 18, 10, 16, 27, 20, 12, 23, 15, 8, 17, 25, 13, 20, 29, 17, 11, 21, 14, 7, 18, 25, 16, 12, 22, 28, 15, 9, 19, 12, 24, 18, 10, 16, 23, 14, 8, 18, 11, 6];
  return <div className="speaking-waveform" aria-hidden="true">{heights.map((height, index) => <i key={index} style={{height}}/>)}</div>;
}

export default function SpeakingPage() {
  const [activeFormat, setActiveFormat] = useState<number | null>(0);
  const topicsHeading = useRef<HTMLHeadingElement>(null);
  const appearance = events[0];

  function exploreTopics() {
    const heading = topicsHeading.current;
    if (!heading) return;
    heading.focus({preventScroll: true});
    heading.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'});
  }

  return <div className="speaking-page">
    <section className="speaking-hero" aria-labelledby="speaking-title">
      <div className="speaking-hero-copy">
        <Waveform/>
        <p className="speaking-kicker">Speaking & meaningful conversations</p>
        <h1 id="speaking-title">Ideas that connect<br/><span>technology, growth & people.</span></h1>
        <p className="speaking-hero-description">Fresh perspectives. Practical ideas. Conversations that stay with you.<br className="speaking-desktop-break"/> Join {brand.fullName} at the intersection of building, growing, and learning.</p>
        <div className="speaking-actions">
          <Link className="speaking-button" to="/book?type=Speaking%20invitation">Invite me to speak</Link>
          <button className="speaking-button speaking-button-outline" type="button" onClick={exploreTopics}>Explore speaking topics</button>
        </div>
      </div>

      <div className="speaking-photo-collage" aria-label="Ideas, people, and collaboration">
        <div className="speaking-photo-column speaking-photo-outer"><img src={photos.stage} alt=""/></div>
        <div className="speaking-photo-column speaking-photo-inner"><img src={photos.discussion} alt=""/><img src={photos.learning} alt=""/></div>
        <figure className="speaking-photo-main"><img src={portrait} alt={`${brand.fullName}, software engineer, digital marketer, and speaker`}/><figcaption><span>Meet your speaker</span><strong>{brand.fullName}</strong></figcaption></figure>
        <div className="speaking-photo-column speaking-photo-inner"><img src={photos.collaboration} alt=""/><img src={photos.building} alt=""/></div>
        <div className="speaking-photo-column speaking-photo-outer"><img src={photos.audience} alt=""/></div>
      </div>

      <div className="speaking-perspectives">
        <p>One perspective. A world of connected ideas.</p>
        <div><span>Technology</span><i aria-hidden="true"/><span>Digital growth</span><i aria-hidden="true"/><span>Learning</span><i aria-hidden="true"/><span>Community</span></div>
      </div>
    </section>

    <section className="speaking-section speaking-conversations" aria-labelledby="speaking-conversations-title">
      <div className="speaking-section-heading"><div><p className="speaking-kicker">Conversation starters</p><h2 id="speaking-conversations-title">Good ideas deserve a conversation.</h2></div><p>Possible starting points for your next event.<br/>Every session is shaped around your audience.</p></div>
      <div className="speaking-conversation-grid">{conversations.map(conversation => <article className="speaking-conversation-card" key={conversation.title}>
        <img src={conversation.image} alt="" loading="lazy"/>
        <div><span className="speaking-category">{conversation.category}</span><h3>{conversation.title}</h3><p>{conversation.copy}</p><Link to={invitationPath(conversation.title)}>Discuss this topic</Link></div>
      </article>)}</div>
    </section>

    <section className="speaking-appearance speaking-section" aria-labelledby="speaking-appearance-title">
      <div className="speaking-appearance-year"><span>Selected appearance</span><strong>2023</strong><span>Uyo, Nigeria</span></div>
      <div className="speaking-appearance-copy"><p className="speaking-kicker">On stage & in the community</p><h2 id="speaking-appearance-title">Google I/O Extended 2023</h2><p>GDG Uyo · Technology, digital skills, and the possibilities they create.</p>
        <details><summary>About this appearance<span aria-hidden="true"/></summary><div><p>{appearance.description} Part of Google I/O Extended 2023 with the GDG Uyo community in Uyo, Nigeria.</p><p>Planning a related event? Share your audience, theme, and format so we can discuss the right session.</p><Link to={invitationPath('Technology & digital skills community session')}>Discuss a community session</Link></div></details>
      </div>
      <PlatformSaveButton kind="event" id={appearance.title} label="Google I/O Extended 2023" className="speaking-save-appearance"/>
    </section>

    <section className="speaking-format-section" aria-labelledby="speaking-formats-title">
      <div className="speaking-section speaking-format-layout">
        <div className="speaking-format-copy"><p className="speaking-kicker">Your audience. The right format.</p><h2 id="speaking-formats-title">A meaningful session,<br/>in the right setting.</h2><p className="speaking-section-description">From a stage to a smaller circle, let’s make the conversation useful to the people in the room.</p>
          <div className="speaking-format-list">{formats.map((format, index) => <div className={`speaking-format${activeFormat === index ? ' is-open' : ''}`} key={format.name}>
            <h3><button type="button" id={`speaking-format-button-${index}`} aria-expanded={activeFormat === index} aria-controls={`speaking-format-panel-${index}`} onClick={() => setActiveFormat(activeFormat === index ? null : index)}><span>{format.name}</span><i aria-hidden="true">{activeFormat === index ? '−' : '+'}</i></button></h3>
            <div id={`speaking-format-panel-${index}`} role="region" aria-labelledby={`speaking-format-button-${index}`} hidden={activeFormat !== index}><h4>{format.label}</h4><p>{format.copy}</p><Link to={invitationPath(format.name)}>Plan a {format.name === 'Panels & conversations' ? 'conversation' : format.name === 'Practical workshops' ? 'workshop' : format.name === 'Community sessions' ? 'community session' : 'conference talk'}</Link></div>
          </div>)}</div>
        </div>
        <div className="speaking-format-portrait"><div className="speaking-portrait-orbit" aria-hidden="true"/><img src={portrait} alt={`${brand.fullName} outdoors`} loading="lazy"/><div className="speaking-portrait-note"><span>A connected perspective</span><strong>Engineer.<br/>Marketer. Speaker.</strong><p>Practical thinking across disciplines.</p></div></div>
      </div>
    </section>

    <section className="speaking-section speaking-topics" aria-labelledby="speaking-topics-title">
      <div className="speaking-section-heading"><div><p className="speaking-kicker">Explore the possibilities</p><h2 id="speaking-topics-title" ref={topicsHeading} tabIndex={-1}>What shall we talk about?</h2></div><Link className="speaking-text-link" to={invitationPath('A tailored speaking topic')}>Have a different theme? Let’s discuss it.</Link></div>
      <div className="speaking-topics-grid">{topics.map(topic => <article className="speaking-topic-card" key={topic.category}>
        <div className="speaking-topic-image"><img src={topic.image} alt="" loading="lazy"/></div>
        <div className="speaking-topic-copy"><p className="speaking-kicker">{topic.category}</p><h3>{topic.title}</h3><p>{topic.copy}</p><div className="speaking-topic-tags">{topic.tags.map(tag => <span key={tag}>{tag}</span>)}</div><Link to={invitationPath(topic.category)}>Explore this topic</Link></div>
      </article>)}</div>
    </section>

    <section className="speaking-invitation" aria-labelledby="speaking-invitation-title">
      <div className="speaking-invitation-copy"><p className="speaking-kicker">Let’s make it a conversation</p><h2 id="speaking-invitation-title">Your next event.<br/>A fresh perspective.</h2><p>Tell me about your audience, your theme, and the kind of session you have in mind. We’ll take it from there.</p><Link to="/book?type=Speaking%20invitation" className="speaking-button">Start a speaking invitation</Link><span>Conferences · Panels · Workshops · Communities</span></div>
      <div className="speaking-invitation-photo"><img src={portrait} alt="" loading="lazy"/></div>
    </section>
  </div>;
}
