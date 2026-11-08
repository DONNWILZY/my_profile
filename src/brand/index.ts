import definition from './brand.json';

/** Shared identity, messaging, palette, and page descriptions. */
export const brand = definition;

export function brandAsset(path: string){
  return `${import.meta.env.BASE_URL}${path}`;
}

export function pageMetadata(pathname: string){
  const pages: Record<string, {title: string; description: string}> = brand.pages;
  const page = pages[pathname] ?? {title: 'Page not found', description: brand.description};
  return {...page, title: `${page.title} | ${brand.fullName}`};
}
