import {Bookmark, Check} from 'lucide-react';
import {useDashboard} from './DashboardProvider';

type Props = {kind: 'project' | 'article' | 'event'; id: string; label?: string; className?: string};

export default function PlatformSaveButton({kind, id, label, className = ''}: Props) {
  const {state, toggleProject, toggleArticle, toggleEvent} = useDashboard();
  const saved = kind === 'project' ? state.savedProjectKeys.includes(id) : kind === 'article' ? state.savedArticleSlugs.includes(id) : state.savedEventIds.includes(id);
  function toggle() {
    if (kind === 'project') toggleProject(id);
    else if (kind === 'article') toggleArticle(id);
    else toggleEvent(id);
  }
  return <button type="button" className={`platform-save-button ${className}`.trim()} aria-pressed={saved} aria-label={`${saved ? 'Unsave' : 'Save'} ${label || kind}`} onClick={toggle}>{saved ? <Check size={15}/> : <Bookmark size={15}/>}<span>{saved ? 'Saved' : 'Save for later'}</span></button>;
}
