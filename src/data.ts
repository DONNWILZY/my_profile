import {brand} from './brand';
export type Project={title:string;category:'Engineering'|'Growth'|'Product';summary:string;tags:string[];link:string;accent:string;mark:string};
export const projects:Project[]=[
{title:'My LPG Hub',category:'Product',summary:'An LPG marketplace bringing vendors, customers and delivery operations into one digital experience.',tags:['Marketplace','Laravel','Operations'],link:'https://mylpg.site/',accent:'from-blue-100 to-indigo-50',mark:'LPG'},
{title:'Raywills Career',category:'Product',summary:'A career and skills platform connecting talent, hiring and professional learning.',tags:['HR Tech','Talent','Platform'],link:'https://raywillscareer.online/',accent:'from-violet-100 to-fuchsia-50',mark:'RC'},
{title:'GleegX Media',category:'Growth',summary:'Digital marketing, SEO and lead generation initiatives for brands and businesses.',tags:['SEO','Content','Lead generation'],link:'https://www.gleegx.com/',accent:'from-sky-100 to-cyan-50',mark:'GX'},
{title:'Authentication & Verification',category:'Engineering',summary:'Authentication flows including sign-up, sign-in and email verification.',tags:['Backend','Auth','Security'],link:'https://github.com/DONNWILZY/Login_Signup_auth-emailVerification',accent:'from-slate-100 to-blue-50',mark:'API'},
{title:'Booking System',category:'Engineering',summary:'An appointment scheduling interface and booking workflow experiment.',tags:['Web','UX','Booking'],link:'https://github.com/DONNWILZY/bookingSystem',accent:'from-blue-100 to-teal-50',mark:'BOOK'},
{title:'GleegX TV',category:'Engineering',summary:'A digital content-platform project exploring publishing and backend workflows.',tags:['Content','Web app','Backend'],link:'https://github.com/DONNWILZY/gleegxTv',accent:'from-orange-100 to-rose-50',mark:'TV'}
];
export const services=[
{slug:'engineering',title:'Software Engineering',description:'Reliable digital products, crafted from concept to launch.',items:['Web application development','Backend APIs & integrations','Mobile app architecture','Authentication & database systems','Technical consulting & product strategy']},
{slug:'marketing',title:'Digital Marketing & Growth',description:'Make your brand discoverable, memorable and commercially effective.',items:['Digital strategy & growth roadmaps','SEO and organic acquisition','Social media & content strategy','Lead generation & conversion funnels','Campaign analysis and optimisation']}
];
export const socials=brand.socials;
export type Entry={slug:string;title:string;category:string;date:string;excerpt:string;body:string};
export const posts:Entry[]=[
{slug:'engineering-meets-growth',title:'Where software engineering meets digital growth',category:'Strategy',date:'Editorial draft',excerpt:'Products become more valuable when engineering and marketing solve the same customer problem.',body:'A strong digital product is not only technically dependable. It also has to be discoverable, understandable, and valuable to the people it serves. My approach brings product engineering, analytics, user experience, and digital growth into the same conversation.'},
{slug:'building-useful-platforms',title:'Building platforms people can actually use',category:'Engineering',date:'Editorial draft',excerpt:'Practical principles for turning complex requirements into coherent user experiences.',body:'Start with the people using the product and the decisions they need to make. Design for clarity, protect data, and make complex workflows feel simple. Iterate with real feedback instead of relying only on assumptions.'},
{slug:'marketing-with-intention',title:'Marketing with intention, not just impressions',category:'Marketing',date:'Editorial draft',excerpt:'Why useful content, strong calls to action, and thoughtful follow-up matter.',body:'Audience growth is meaningful when it contributes to trust and outcomes. Educational content, clear calls to action, lead nurturing, and continuous measurement help teams connect attention to real business progress.'}
];
export const events=[{title:'Google I/O Extended 2023 — GDG Uyo',type:'Past appearance',location:'Uyo, Nigeria',description:'Community speaking engagement exploring technology and digital skills.',year:'2023'}];
