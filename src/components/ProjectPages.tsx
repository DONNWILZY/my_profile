import {Link, useLocation, useParams, useSearchParams} from 'react-router-dom';
import {findCaseStudy, projectCollectionPath, projectDetailsPath, projectsForDiscipline, type Discipline, type ProjectCaseStudy} from '../projectCatalog';
import ProjectVisual from './ProjectVisual';
import './project-pages.css';

const disciplineName = (discipline: Discipline)=>discipline === 'engineering' ? 'Engineering' : 'Marketing';

function ProjectCaseCard({project, from}: {project: ProjectCaseStudy; from: string}){
  return <Link className="collection-project-card" to={projectDetailsPath(project.discipline,project.slug)} state={{from}}>
    <div className="collection-project-art"><ProjectVisual work={project}/><span className="collection-visual-caption">Illustrative project visual</span>{project.featured&&<span className="collection-featured-label">Featured</span>}</div>
    <div className="collection-project-copy"><span className="project-small-label">{project.kind} / {project.category}</span><h3>{project.title}</h3><p>{project.summary}</p><span className="collection-project-action">View project details</span></div>
  </Link>;
}

export function ProjectCollection({discipline}: {discipline: Discipline}){
  const allProjects = projectsForDiscipline(discipline);
  const location = useLocation();
  const [params,setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const requestedView = params.get('view');
  const view = requestedView === 'featured' || requestedView === 'more' ? requestedView : 'all';
  const normalizedQuery = query.trim().toLowerCase();
  const visible = allProjects.filter(project=>{
    const inView = view === 'all' || (view === 'featured' ? project.featured : !project.featured);
    const haystack = [project.title,project.summary,project.category,project.kind,...project.focus].join(' ').toLowerCase();
    return inView && (!normalizedQuery || haystack.includes(normalizedQuery));
  });
  const update = (key: 'q'|'view', value: string)=>{
    const next = new URLSearchParams(params);
    if(value && !(key === 'view' && value === 'all'))next.set(key,value);else next.delete(key);
    setParams(next,{replace:true});
  };
  const clearFilters = ()=>setParams({}, {replace:true});
  const featured = allProjects.filter(project=>project.featured).length;
  const from = `${location.pathname}${location.search}`;
  const filters = [{value:'all',label:'All work',count:allProjects.length},{value:'featured',label:'Featured',count:featured},{value:'more',label:'More work',count:allProjects.length-featured}];

  return <div className="project-pages project-collection">
    <div className="discipline-inner">
      <nav className="project-breadcrumb" aria-label="Breadcrumb"><Link to={`/${discipline}`}>{disciplineName(discipline)} portfolio</Link><span aria-hidden="true">/</span><span aria-current="page">Projects</span></nav>
      <header className="project-collection-heading"><p className="discipline-kicker">The project collection</p><h1>{discipline === 'engineering' ? <>All engineering<br/>projects<span>.</span></> : <>Marketing work,<br/>in context<span>.</span></>}</h1><p>{discipline === 'engineering' ? 'Explore the featured projects and more work across products, backend systems, and publishing.' : 'Explore GleegX Media and the connected focus studies behind the featured marketing work.'}</p><Link to={`/${discipline}`} className="discipline-text-link">Back to {discipline} portfolio</Link></header>
      <div className="project-collection-toolbar"><div className="project-view-filters" role="group" aria-label="Filter projects">{filters.map(filter=><button type="button" key={filter.value} aria-pressed={view===filter.value} onClick={()=>update('view',filter.value)}>{filter.label}<span>{filter.count}</span></button>)}</div><label className="project-search"><span>Search projects</span><input type="search" value={query} onChange={event=>update('q',event.target.value)} placeholder="Search by project, focus, or skill"/></label></div>
      <div className="project-result-summary"><p role="status" aria-live="polite">{visible.length} {visible.length===1?'result':'results'}{query.trim()&&<> for &ldquo;{query.trim()}&rdquo;</>}</p>{(query||view!=='all')&&<button type="button" onClick={clearFilters}>Clear filters</button>}</div>
      {visible.length ? <div className="project-collection-grid">{visible.map(project=><ProjectCaseCard project={project} from={from} key={project.slug}/>)}</div> : <div className="project-empty-state"><h2>No matching work found.</h2><p>Try a different search or clear the filters to see the whole collection.</p><button type="button" onClick={clearFilters}>Show all work</button></div>}
      <div className="project-collection-bottom"><p>Have a project of your own in mind?</p><Link to="/contact" className="project-primary-link">Let's talk about it</Link><Link to={`/${discipline === 'engineering' ? 'marketing' : 'engineering'}/projects`} className="project-secondary-link">Explore {discipline === 'engineering' ? 'marketing' : 'engineering'} projects</Link></div>
    </div>
  </div>;
}

export function ProjectDetails({discipline}: {discipline: Discipline}){
  const {slug} = useParams();
  const location = useLocation();
  const project = findCaseStudy(discipline,slug);
  const collection = projectCollectionPath(discipline);
  const stateFrom: unknown = (location.state as {from?: unknown}|null)?.from;
  const returnTo = typeof stateFrom === 'string' && (stateFrom === collection || stateFrom.startsWith(`${collection}?`)) ? stateFrom : collection;

  if(!project)return <div className="project-pages"><div className="discipline-inner project-missing"><p className="discipline-kicker">{disciplineName(discipline)} projects</p><h1>Project not found.</h1><p>This project is not in the collection. Explore the other projects to find the work you are looking for.</p><Link to={collection} className="project-primary-link">Browse {discipline} projects</Link><Link to={`/${discipline}`} className="project-secondary-link">Back to portfolio</Link></div></div>;

  const allProjects = projectsForDiscipline(discipline);
  const index = allProjects.findIndex(item=>item.slug === project.slug);
  const nextProject = allProjects[(index+1)%allProjects.length];
  const parent = project.parentSlug ? findCaseStudy(discipline,project.parentSlug) : undefined;
  const related = allProjects.filter(item=>item.slug !== project.slug).sort((a,b)=>{
    const priority = (item: ProjectCaseStudy)=>item.slug === project.parentSlug || item.parentSlug === project.slug ? 0 : 1;
    return priority(a)-priority(b);
  }).slice(0,3);
  const resourceLabel = project.project.link.includes('github.com') ? 'View source on GitHub' : 'Visit website';

  return <article className="project-pages project-case-study">
    <div className="discipline-inner">
      <nav className="project-breadcrumb" aria-label="Breadcrumb"><Link to={`/${discipline}`}>{disciplineName(discipline)} portfolio</Link><span aria-hidden="true">/</span><Link to={returnTo}>Projects</Link><span aria-hidden="true">/</span><span aria-current="page">{project.title}</span></nav>
      <header className="case-study-heading"><div><p className="discipline-kicker">{project.kind} / {disciplineName(discipline)}</p><h1>{project.title}<span>.</span></h1><p>{project.summary}</p>{parent&&<Link className="case-study-parent" to={projectDetailsPath(discipline,parent.slug)}>Part of {parent.title}</Link>}<div className="case-study-actions"><a className="project-primary-link" href={project.project.link} target="_blank" rel="noopener noreferrer">{resourceLabel}</a><Link to={returnTo} className="project-secondary-link">Back to all projects</Link></div></div><figure className="case-study-visual"><ProjectVisual work={project}/><figcaption>Illustrative project visual</figcaption></figure></header>
      <div className="case-study-layout"><aside className="case-study-at-a-glance"><h2>At a glance</h2><dl><div><dt>Discipline</dt><dd>{disciplineName(discipline)}</dd></div><div><dt>Type</dt><dd>{project.kind}</dd></div><div><dt>Area</dt><dd>{project.category}</dd></div>{parent&&<div><dt>Parent project</dt><dd><Link to={projectDetailsPath(discipline,parent.slug)}>{parent.title}</Link></dd></div>}</dl><h3>Focus areas</h3><ul className="case-study-tags">{project.focus.map(tag=><li key={tag}>{tag}</li>)}</ul><Link to={returnTo} className="discipline-text-link">All {discipline} work</Link></aside><div className="case-study-story"><section aria-labelledby="project-overview-title"><p className="project-small-label">01 / The context</p><h2 id="project-overview-title">Project overview.</h2>{project.overview.map(paragraph=><p key={paragraph}>{paragraph}</p>)}</section><section aria-labelledby="project-scope-title"><p className="project-small-label">02 / The scope</p><h2 id="project-scope-title">What the work explores.</h2><div className="case-study-scope">{project.scope.map(item=><div key={item.title}><h3>{item.title}</h3><p>{item.description}</p></div>)}</div></section><section aria-labelledby="project-approach-title"><p className="project-small-label">03 / The approach</p><h2 id="project-approach-title">How the work comes together.</h2><ol className="case-study-steps">{project.approach.map((item,index)=><li key={item.title}><span>0{index+1}</span><div><h3>{item.title}</h3><p>{item.description}</p></div></li>)}</ol></section><section className="case-study-explore" aria-labelledby="project-resource-title"><p className="project-small-label">04 / Explore further</p><h2 id="project-resource-title">Take a closer look.</h2><p>{project.exploration}</p><a href={project.project.link} target="_blank" rel="noopener noreferrer" className="discipline-text-link">{resourceLabel}</a></section></div></div>
      <section className="case-study-related" aria-labelledby="related-work-title"><div className="case-study-section-heading"><div><p className="discipline-kicker">Keep exploring</p><h2 id="related-work-title">More {discipline} work.</h2></div><Link to={returnTo} className="discipline-text-link">View all projects</Link></div><div className="project-related-grid">{related.map(item=><ProjectCaseCard project={item} from={returnTo} key={item.slug}/>)}</div></section>
      <nav className="case-study-next" aria-label="Project navigation"><div><p>Have a similar challenge?</p><Link to="/contact" className="discipline-text-link">Let's discuss your project</Link></div><Link to={projectDetailsPath(discipline,nextProject.slug)} state={{from:returnTo}}><small>Next {nextProject.kind.toLowerCase()}</small><span>{nextProject.title}</span></Link></nav>
    </div>
  </article>;
}
