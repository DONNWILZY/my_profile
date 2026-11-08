import {defineConfig,loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
import brand from './src/brand/brand.json';

const base = process.env.GITHUB_PAGES === 'true' ? '/my_profile/' : '/';
const escapeHtml = (value: string)=>value.replace(/[&<>"']/g, character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]!));
const kebab = (value: string)=>value.replace(/[A-Z]/g, letter=>`-${letter.toLowerCase()}`);
const colorTokens = Object.entries(brand.colors).flatMap(([name,hex])=>{
  const rgb = [1,3,5].map(offset=>parseInt(hex.slice(offset,offset+2),16)).join(' ');
  return [`--brand-${kebab(name)}:${hex}`,`--brand-${kebab(name)}-rgb:${rgb}`];
});
const theme = `:root{${[...colorTokens,`--brand-font-body:'${brand.fonts.body}'`,`--brand-font-display:'${brand.fonts.display}'`].join(';')}}`;
const home = brand.pages['/'];
const htmlValues: Record<string,string> = {
  NAME: brand.name,
  FULL_NAME: brand.fullName,
  TITLE: `${home.title} | ${brand.fullName}`,
  DESCRIPTION: home.description,
  PRIMARY: brand.colors.primary,
  TAGLINE: brand.tagline,
  MARK: `${base}${brand.assets.mark}`,
  MANIFEST: `${base}${brand.assets.manifest}`,
};

export default defineConfig(({mode})=>{
 const siteUrl = loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL?.trim();
 const socialImage = siteUrl
   ? new URL(brand.assets.socialImage, `${siteUrl.replace(/\/+$/, '')}/`).href
   : `${base}${brand.assets.socialImage}`;
 return {
  base,
  plugins: [react(), {
    name: 'shared-brand',
    transformIndexHtml(html){
      return {
        html: html.replace(/__BRAND_([A-Z_]+)__/g, (token,key:string)=>key === 'SOCIAL_IMAGE' ? escapeHtml(socialImage) : key in htmlValues ? escapeHtml(htmlValues[key]) : token),
        tags: [{tag:'style',attrs:{id:'brand-theme'},children:theme,injectTo:'head-prepend'}],
      };
    },
  }],
 };
});
