import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {brand, pageMetadata} from '../brand';
import {posts} from '../data';

export default function PageMetadata(){
  const {pathname} = useLocation();
  useEffect(()=>{
    const article = pathname.startsWith('/blog/') ? posts.find(post=>`/blog/${post.slug}` === pathname) : undefined;
    const page = article
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
