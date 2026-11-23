import {brand} from '../brand';
import type {Course} from '../courseCatalog';
import instructorPortrait from '../../my profile/images/IMG-20190225-WA0024.jpg';

const photographs = {
  Engineering: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1000&q=85',
  Marketing: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=85',
  Communication: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=85',
};

type Props = {course?: Course; variant?: 'hero' | 'card' | 'detail'; className?: string};

/** Decorative photography and editorial labels. The surrounding card supplies its accessible name. */
export default function CourseCover({course, variant = 'card', className = ''}: Props) {
  if (variant === 'hero') return <div className={`learning-cover learning-cover-hero ${className}`} aria-hidden="true">
    <div className="learning-cover-frame"><img src={instructorPortrait} alt="" fetchPriority="high"/><div className="learning-cover-photo-shade"/><span className="learning-cover-vertical">LEARN. BUILD. GROW.</span></div>
    <div className="learning-cover-roundel"><span>Made for</span><strong>real life.</strong></div>
    <div className="learning-cover-note learning-cover-note-one"><span className="learning-cover-note-tag">YOUR NEXT CHAPTER</span><strong>A little learning.<br/>A lot of possibility.</strong><span className="learning-cover-person"><img src={instructorPortrait} alt=""/><span>{brand.fullName}<small>Engineering & growth</small></span></span></div>
    <div className="learning-cover-note learning-cover-note-two"><span className="learning-cover-note-dot"/><span><strong>Learn your way.</strong><small>Individual & cohort courses</small></span></div>
    <div className="learning-cover-loop"/>
  </div>;
  const discipline = course?.discipline ?? 'Engineering';
  return <div className={`learning-cover learning-cover-${variant} learning-cover-${discipline.toLowerCase()} ${course?.format === 'cohort' ? 'learning-cover-cohort' : ''} ${className}`} aria-hidden="true">
    <img className="learning-cover-photo" src={photographs[discipline]} alt="" loading="lazy"/>
    <div className="learning-cover-wash"/>
    <span className="learning-cover-label">{course?.format === 'cohort' ? 'LEARN TOGETHER' : 'FIND YOUR FOCUS'}</span>
    <span className="learning-cover-subject">{discipline === 'Engineering' ? <><span>Ideas into</span><strong>interfaces.</strong></> : discipline === 'Marketing' ? <><span>Make your</span><strong>next move.</strong></> : <><span>Give your</span><strong>ideas a voice.</strong></>}</span>
    <span className="learning-cover-foot"><span>{course?.mark ?? 'LEARN'}</span><span>{course?.format === 'cohort' ? 'Cohort experience' : 'Practical learning'}</span></span>
  </div>;
}
