import {caseStudyForPath} from '../projectCatalog';
import {courses, courseForPath} from '../courseCatalog';
import {digitalProductForPath} from '../digitalProductsData';
import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {brand, pageMetadata} from '../brand';
import {posts} from '../data';

export default function PageMetadata(){
  const {pathname} = useLocation();
  useEffect(()=>{
    const article = pathname.startsWith('/blog/') ? posts.find(post=>`/blog/${post.slug}` === pathname) : undefined;
    const project = caseStudyForPath(pathname);
    const dashboardSlug = /^\/dashboard\/courses\/([^/]+)\/?$/.exec(pathname)?.[1];
    const studyPlan = courses.find(course => course.slug === dashboardSlug);
    const offering = courseForPath(pathname) ?? digitalProductForPath(pathname);
    const page = studyPlan
      ? {title: `${studyPlan.title} - My Study Plan | ${brand.fullName}`, description: `Review the outline and keep personal notes for ${studyPlan.title}.`}
      : offering
      ? {title: `${offering.title} | ${brand.fullName}`, description: offering.summary}
      : project
      ? {title: `${project.title} | ${brand.fullName}`, description: project.summary}
      : article
      ? {title: `${article.title} | ${brand.fullName}`, description: article.excerpt}
      : pageMetadata(pathname);
    document.title = page.title;
    const setMeta = (attribute: 'name'|'property', key: string, value: string)=>{
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if(!element){
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.append(element);
      }
      element.content = value;
    };
    setMeta('name', 'description', page.description);
    setMeta('property', 'og:title', page.title);
    setMeta('property', 'og:description', page.description);
    setMeta('property', 'og:type', article ? 'article' : 'website');
    setMeta('name', 'twitter:title', page.title);
    setMeta('name', 'twitter:description', page.description);
  },[pathname]);
  return null;
}
