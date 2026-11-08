import {useEffect, useRef, useState} from 'react';
import {Link, NavLink, useLocation} from 'react-router-dom';
import { ChevronDown, Menu, X} from 'lucide-react';
import './navigation.css';

const groups = [
  {label:'Services', links:[['/engineering','Software engineering'],['/marketing','Digital marketing'],['/speaking','Speaking & workshops'],['/training','Training']]},
  {label:'Insights', links:[['/blog','Blog'],['/events','Events'],['/community','Community']]},
];

export default function Header(){
  const [open,setOpen]=useState(false);
  const [expanded,setExpanded]=useState<string|null>(null);
  const location=useLocation();
  const root=useRef<HTMLElement>(null);
  const toggle=useRef<HTMLButtonElement>(null);
  useEffect(()=>{setOpen(false);setExpanded(null)},[location]);
  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape'){
      if(expanded){root.current?.querySelector<HTMLButtonElement>(`[data-group="${expanded}"]`)?.focus();setExpanded(null)}
      else if(open){setOpen(false);toggle.current?.focus()}
    }};
    const onPointer=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node)){setExpanded(null);setOpen(false)}};
    const media=window.matchMedia('(min-width: 1100px)');
    const onResize=()=>{setOpen(false);setExpanded(null)};
    document.addEventListener('keydown',onKey);
    document.addEventListener('pointerdown',onPointer);
    media.addEventListener('change',onResize);
    return ()=>{document.removeEventListener('keydown',onKey);document.removeEventListener('pointerdown',onPointer);media.removeEventListener('change',onResize)};
  },[open,expanded]);
  return <header ref={root} className="site-header" onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node)){setExpanded(null);setOpen(false)}}}>
    <a className="skip-navigation" href="#main-content">Skip to content</a>
    <div className="site-header-inner">
      <Link to="/" className="site-brand" aria-label="Effiong Godswill home"><span className="site-monogram">EG.</span><span>Godswill<span className="brand-dot">.</span></span></Link>
      <button ref={toggle} className="navigation-toggle" type="button" aria-expanded={open} aria-controls="site-navigation" aria-label={open?'Close navigation':'Open navigation'} onClick={()=>{setOpen(!open);setExpanded(null)}}>{open?<X size={23}/>:<Menu size={23}/>}</button>
      <div id="site-navigation" className={'site-navigation'+(open?' is-open':'')}>
        <nav className="site-nav-links" aria-label="Main navigation">
          <NavLink to="/" end>Home</NavLink><NavLink to="/about">About</NavLink><NavLink to="/portfolio">Portfolio</NavLink>
          {groups.map(group=>{const isExpanded=expanded===group.label;const active=group.links.some(([path])=>location.pathname===path||location.pathname.startsWith(path+'/'));return <div key={group.label} className="navigation-group"><button type="button" data-group={group.label} className={active?'is-active':''} aria-expanded={isExpanded} aria-controls={'navigation-'+group.label.toLowerCase()} onClick={()=>setExpanded(isExpanded?null:group.label)}>{group.label}<ChevronDown size={14} className={isExpanded?'is-rotated':''}/></button><div hidden={!isExpanded} id={'navigation-'+group.label.toLowerCase()} className="navigation-dropdown">{group.links.map(([to,label])=><NavLink key={to} to={to}>{label}</NavLink>)}</div></div>})}
          <NavLink to="/contact">Contact</NavLink>
        </nav>
        <div className="navigation-actions"><NavLink to="/login" className="navigation-login">Log in</NavLink><Link to="/book" className="navigation-book">Book a session </Link></div>
      </div>
    </div>
  </header>;
}
