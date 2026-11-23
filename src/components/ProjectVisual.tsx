import {type Project} from '../data';
import {type PreviewKind} from '../projectCatalog';
import './discipline-portfolio.css';

export default function ProjectVisual({work}: {work: {project: Project; preview: PreviewKind}}){
  const engineering = work.project.category !== 'Growth';
  return <div className={`discipline-project-visual preview-${work.preview}`} aria-hidden="true">
    <div className="discipline-browser">
      <div className="browser-chrome"><span/><span/><span/><small>{engineering ? work.project.title : 'GleegX Media'}</small></div>
      <div className="browser-content">
        <div className="browser-label">{engineering ? 'BUILD SOMETHING USEFUL' : 'A CLEARER DIGITAL PRESENCE'}</div>
        <strong>{work.project.slug === 'raywills-career' ? <>Your next opportunity.<br/>A little closer.</> : work.project.slug === 'gleegx-tv' ? <>A place for stories.<br/>Built for publishing.</> : work.preview === 'marketplace' ? <>Everyday energy.<br/>One simple platform.</> : work.preview === 'auth' ? <>A better beginning.<br/>Built on trust.</> : work.preview === 'booking' ? <>Make room for<br/>what comes next.</> : work.preview === 'search' ? <>Be there when<br/>people are looking.</> : work.preview === 'content' ? <>Stories worth<br/>spending time with.</> : <>Turn attention<br/>into a conversation.</>}</strong>
        <div className="browser-copy"><span/><span/></div>
        <span className="browser-button">{engineering ? 'Explore the experience' : 'Start a conversation'}</span>
        <div className="browser-modules"><div><b>{engineering ? 'Simple' : 'Relevant'}</b><span/><span/></div><div><b>{engineering ? 'Connected' : 'Consistent'}</b><span/><span/></div><div><b>{engineering ? 'Useful' : 'Clear'}</b><span/><span/></div></div>
      </div>
    </div>
    <div className="discipline-phone"><span className="phone-notch"/><small>{engineering ? work.project.mark : 'GLEEGX'}</small><strong>{engineering ? 'Your next step, simplified.' : 'Make your story count.'}</strong><span className="phone-art"/><span className="phone-line"/><span className="phone-line short"/><span className="phone-button"/></div>
  </div>;
}

