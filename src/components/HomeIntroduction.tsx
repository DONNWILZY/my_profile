import {Link} from 'react-router-dom';
import portrait from '../../my profile/images/IMG-20190225-WA0024.jpg';
import './home-introduction.css';

export default function HomeIntroduction(){
  return <section className="home-introduction" aria-labelledby="introduction-title">
    <div className="introduction-layout">
      <figure className="introduction-portrait">
        <div className="introduction-image">
          <img src={portrait} alt="Effiong Godswill outdoors in traditional attire" loading="lazy"/>
        </div>
        <figcaption>
          <span>Effiong Godswill</span>
          <span>Based in Nigeria. Working globally.</span>
        </figcaption>
      </figure>
      <div className="introduction-copy">
        <p className="introduction-eyebrow">THE PERSON BEHIND THE WORK</p>
        <h2 id="introduction-title" className="introduction-title">Meet Effiong<br/>Godswill<span>.</span></h2>
        <p className="introduction-lead">A technical mind.<br/>A people-first approach.</p>
        <p className="introduction-description">I'm a software engineer, digital marketing strategist, and public speaker. I connect technology and storytelling to turn complex ideas into experiences people can use.</p>
        <p className="introduction-description">Whether I'm building a product, shaping a growth strategy, or sharing what I've learned, I start with the people it needs to serve.</p>
        <nav className="introduction-expertise" aria-label="Explore my areas of work">
          <Link to="/engineering">Engineering</Link>
          <Link to="/marketing">Digital marketing</Link>
          <Link to="/speaking">Speaking</Link>
        </nav>
        <div className="introduction-actions">
          <Link to="/about" className="introduction-about">More about me</Link>
          <Link to="/contact" className="introduction-contact">Let's work together</Link>
        </div>
      </div>
    </div>
  </section>;
}
