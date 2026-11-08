import {useState} from 'react';
import {Link} from 'react-router-dom';
import {brand} from '../brand';
import seatedPortrait from '../../my profile/images/IMG-20190209-WA0004.jpg';
import outdoorPortrait from '../../my profile/images/IMG-20190225-WA0024.jpg';
import './hero.css';

const photographs=[
  {src:outdoorPortrait,label:'A little beyond the work',className:'outdoors'},
  {src:seatedPortrait,label:'The person behind the ideas',className:'portrait'},
  {src:outdoorPortrait,label:'Always looking ahead',className:'detail'},
];

export default function Hero(){
  const [paused,setPaused]=useState(false);
  return <section className="workflow-hero" aria-labelledby="workflow-title">
    <div className="workflow-heading">
      <p className="workflow-eyebrow">{brand.fullName}</p>
      <h1 id="workflow-title">{brand.hero.titleFirst}<br/>{brand.hero.titleSecondLead}<span>{brand.hero.titleAccent}</span></h1>
      <p className="workflow-description">{brand.hero.description}</p>
      <div className="workflow-actions">
        <Link to="/portfolio" className="workflow-work">Explore my work</Link>
        <Link to="/book" className="workflow-book">Start a conversation</Link>
      </div>
      <p className="workflow-location">{brand.locationLine}</p>
    </div>
    <div className="workflow-showcase">
      <div className="workflow-meeting">
        <div className="meeting-top"><span>A good place to start</span><span className="meeting-index">01</span></div>
        <div className="meeting-content">
          <span className="meeting-kicker">Open to conversations</span>
          <h2>Your next idea.<br/>Our next conversation.</h2>
          <p>Engineering, growth, or something new. Tell me what you have in mind.</p>
          <div className="meeting-bottom"><Link to="/book">Book a session</Link></div>
        </div>
      </div>
      <div className="workflow-disciplines">
        <div className="discipline-heading"><strong>3</strong><span>CONNECTED<br/>DISCIPLINES</span></div>
        <p>Engineering.<br/>Marketing.<br/>Speaking.</p>
        <span>Different perspectives.<br/>One thoughtful approach.</span>
      </div>
      <div className={'workflow-photos'+(paused?' is-paused':'')} role="region" aria-label={`Photos of ${brand.fullName}`}><div className="photo-stage">{photographs.map((photo,i)=><figure className={'rotating-photo photo-'+i} key={i}><div className="photo-card-heading"><span>{brand.name}, beyond the screen</span></div><img className={photo.className} src={photo.src} alt={i===2?'':i===0?`${brand.fullName} outdoors in traditional attire`:`Portrait of ${brand.fullName}`} fetchPriority={i===0?'high':'auto'}/><figcaption>{photo.label}<span>0{i+1} / 03</span></figcaption></figure>)}</div><div className="photo-gallery-bottom"><span>Different moments. Same me.</span><button type="button" onClick={()=>setPaused(!paused)} aria-label={paused?'Play photo animation':'Pause photo animation'} aria-pressed={paused}>{paused?'Play':'Pause'}</button></div></div>
      <div className="workflow-shortcuts">
        <div><h2>From idea to impact.</h2><p>Find the right starting point.</p></div>
        <nav className="shortcut-links" aria-label="Explore my services">
          <Link to="/engineering">Engineering</Link>
          <Link to="/marketing">Marketing</Link>
          <Link to="/speaking">Speaking</Link>
        </nav>
      </div>
    </div>
  </section>;
}
