import {projects, type Project} from './data';

export type Discipline = 'engineering' | 'marketing';
export type PreviewKind = 'marketplace' | 'auth' | 'booking' | 'search' | 'content' | 'campaign';
export type CaseStudySection = {title: string; description: string};
export type ProjectCaseStudy = {
  slug: string;
  discipline: Discipline;
  title: string;
  featuredTitle?: string;
  category: string;
  summary: string;
  preview: PreviewKind;
  project: Project;
  featured: boolean;
  kind: 'Project' | 'Focus study';
  parentSlug?: string;
  overview: string[];
  focus: string[];
  scope: CaseStudySection[];
  approach: CaseStudySection[];
  exploration: string;
};

const project = (slug: string)=>{
  const match = projects.find(item=>item.slug === slug);
  if(!match)throw new Error(`Missing project: ${slug}`);
  return match;
};

export const projectCaseStudies: ProjectCaseStudy[] = [
  {
    slug:'my-lpg-hub', discipline:'engineering', title:'My LPG Hub', featuredTitle:'My LPG Hub.',
    category:'Product, Marketplace', summary:'An LPG marketplace connecting vendors, customers, and delivery operations.',
    preview:'marketplace', project:project('my-lpg-hub'), featured:true, kind:'Project',
    overview:[
      'My LPG Hub brings the different sides of an LPG marketplace into one digital experience. Its scope connects the people looking for a refill with vendors and the delivery operations behind the service.',
      'The engineering focus is the relationship between those journeys: a useful customer experience depends on the information and operational steps that support it.',
    ],
    focus:['Marketplace','Laravel','Operations'],
    scope:[
      {title:'A connected marketplace',description:'A shared platform for vendors, customers, and the operations that connect them.'},
      {title:'Customer and vendor journeys',description:'A product structure built around the different needs of the people using the marketplace.'},
      {title:'Operational workflows',description:'The movement from a customer need to the vendor and delivery activity required to support it.'},
    ],
    approach:[
      {title:'Map the participants',description:'Understand what the customer, vendor, and delivery operation each need from the same experience.'},
      {title:'Connect the workflow',description:'Think through how information passes between the marketplace and its operational processes.'},
      {title:'Keep the interface useful',description:'Make the next step clear without exposing unnecessary complexity to the customer.'},
    ],
    exploration:'Visit the live marketplace to explore its public experience and how the product presents its service.',
  },
  {
    slug:'authentication-verification', discipline:'engineering', title:'Authentication & Verification', featuredTitle:'Authentication\n& Verification.',
    category:'Backend, Security', summary:'Sign-up, sign-in, and email verification flows for a dependable first interaction.',
    preview:'auth', project:project('authentication-verification'), featured:true, kind:'Project',
    overview:[
      'Authentication is often the first interaction between a person and a digital product. This project explores the connected steps of creating an account, signing in, and verifying an email address.',
      'Its focus is a coherent account-entry workflow, where the state of an account and the next action remain understandable throughout the journey.',
    ],
    focus:['Backend','Authentication','Email verification'],
    scope:[
      {title:'Account registration',description:'The sign-up portion of the authentication workflow.'},
      {title:'Sign-in flow',description:'The returning-user journey into an account.'},
      {title:'Email verification',description:'The relationship between registering an account and verifying its email address.'},
    ],
    approach:[
      {title:'Connect the account states',description:'Treat registration, sign-in, and verification as parts of the same user journey.'},
      {title:'Make the next step clear',description:'Use a deliberate sequence so people understand what is needed to continue.'},
      {title:'Inspect the implementation',description:'Use the source repository to examine how the experiment is structured.'},
    ],
    exploration:'The source repository is the best place to inspect the implementation and the authentication flows included in this project.',
  },
  {
    slug:'booking-system', discipline:'engineering', title:'Booking System', featuredTitle:'Booking\nSystem.',
    category:'Web, Workflow', summary:'An appointment interface exploring the steps from choosing a date to making a booking.',
    preview:'booking', project:project('booking-system'), featured:true, kind:'Project',
    overview:[
      'This booking-system experiment looks at appointment scheduling as a sequence of decisions rather than a single form. It explores the interface and workflow involved in making a booking.',
      'The emphasis is on clarity: helping someone understand where they are in the journey and what information is needed next.',
    ],
    focus:['Web','Scheduling interface','User experience'],
    scope:[
      {title:'Scheduling interface',description:'An interface for exploring appointment scheduling.'},
      {title:'Booking workflow',description:'The connected steps that take a visitor through a booking journey.'},
      {title:'Interaction design',description:'Attention to the choices, instructions, and transitions within that journey.'},
    ],
    approach:[
      {title:'Break down the decisions',description:'Understand the information and choices involved before asking someone to complete a booking.'},
      {title:'Keep the flow understandable',description:'Give each step a clear purpose within the wider appointment journey.'},
      {title:'Explore through implementation',description:'Use a working interface experiment to investigate how the workflow fits together.'},
    ],
    exploration:'Explore the repository for the interface and workflow experiment. This case study does not represent a live appointment provider.',
  },
  {
    slug:'raywills-career', discipline:'engineering', title:'Raywills Career', category:'Product, Career platform',
    summary:'A career and skills platform connecting talent, hiring, and professional learning.',
    preview:'marketplace', project:project('raywills-career'), featured:false, kind:'Project',
    overview:[
      'Raywills Career is a platform project at the intersection of talent, hiring, and professional learning. It brings these connected areas into one product context.',
      'The product challenge is to give people a clear way to understand the opportunities and learning experiences relevant to their next professional step.',
    ],
    focus:['HR Tech','Talent','Platform'],
    scope:[
      {title:'Talent and opportunity',description:'A platform context that connects people with hiring and professional opportunities.'},
      {title:'Skills and learning',description:'Professional learning as part of the broader career journey.'},
      {title:'A connected platform',description:'A product structure that brings these related areas together rather than treating them as unrelated tasks.'},
    ],
    approach:[
      {title:'Understand the career journey',description:'Consider how skills, learning, and hiring relate to the person using the product.'},
      {title:'Organize the experience',description:'Make the platform context understandable across its connected areas.'},
      {title:'Connect the next step',description:'Keep the relationship between an opportunity and a useful next action clear.'},
    ],
    exploration:'Visit Raywills Career to explore the public platform and its current presentation of career and learning opportunities.',
  },
  {
    slug:'gleegx-tv', discipline:'engineering', title:'GleegX TV', category:'Publishing, Backend',
    summary:'A digital content-platform project exploring publishing and backend workflows.',
    preview:'content', project:project('gleegx-tv'), featured:false, kind:'Project',
    overview:[
      'GleegX TV is a content-platform project exploring the connection between publishing and the backend workflows that support a digital content experience.',
      'Its engineering focus sits behind the visible content: how a web application organizes publishing activity and supports the experience around it.',
    ],
    focus:['Content','Web application','Backend'],
    scope:[
      {title:'Content publishing',description:'A digital platform context for publishing and presenting content.'},
      {title:'Backend workflows',description:'The application workflows supporting that publishing experience.'},
      {title:'Web application structure',description:'The relationship between the visible content experience and the systems behind it.'},
    ],
    approach:[
      {title:'Start from the content journey',description:'Consider what publishing requires before shaping the surrounding interface.'},
      {title:'Connect the backend',description:'Think through the workflows that make the content experience possible.'},
      {title:'Explore the source',description:'Use the repository to examine the application experiment in more detail.'},
    ],
    exploration:'Explore the source repository for the content-platform project and its backend workflow experiments.',
  },
  {
    slug:'gleegx-media', discipline:'marketing', title:'GleegX Media', category:'Digital marketing, Growth',
    summary:'Connected digital marketing work across search, content, and lead generation.',
    preview:'campaign', project:project('gleegx-media'), featured:false, kind:'Project',
    overview:[
      'GleegX Media brings together the marketing focus areas represented in this portfolio: SEO, content, and lead generation for brands and businesses.',
      'The three featured studies explore different parts of this connected work. They belong to the same brand, from being discovered to telling a useful story and opening a conversation.',
    ],
    focus:['SEO','Content','Lead generation'],
    scope:[
      {title:'Search and discovery',description:'Search and organic discovery as routes to reaching a relevant audience.'},
      {title:'Content and storytelling',description:'Content strategy and the stories that make a brand understandable.'},
      {title:'Lead generation',description:'A path from audience attention to a relevant enquiry or conversation.'},
    ],
    approach:[
      {title:'Understand the audience',description:'Start with the people a brand needs to reach and the questions they bring.'},
      {title:'Connect the message',description:'Keep the offer, content, and next action aligned across the journey.'},
      {title:'Look at the whole experience',description:'Treat discovery, content, and enquiry as connected parts of marketing.'},
    ],
    exploration:'Visit GleegX Media to explore the public brand, or open one of the focus studies below for a closer look at a particular area.',
  },
  {
    slug:'gleegx-search-discovery', discipline:'marketing', title:'Search & Discovery', featuredTitle:'Search &\ndiscovery.',
    category:'GleegX Media / SEO', summary:'Search and organic discovery work within the GleegX Media marketing portfolio.',
    preview:'search', project:project('gleegx-media'), featured:true, kind:'Focus study', parentSlug:'gleegx-media',
    overview:[
      'This focus study looks at the search and discovery part of the GleegX Media marketing portfolio. It sits within the wider work on digital marketing, SEO, and lead generation.',
      'The central question is how to connect what an audience is looking for with a clear and useful brand experience once they arrive.',
    ],
    focus:['SEO','Organic discovery','Content strategy'],
    scope:[
      {title:'Search intent',description:'The relationship between audience questions and the information a brand presents.'},
      {title:'Useful content',description:'Content that helps someone understand an offer in the context of what they are searching for.'},
      {title:'A clear onward journey',description:'The next step after discovery, including understanding the service and making an enquiry.'},
    ],
    approach:[
      {title:'Begin with the question',description:'Think about the need behind the search rather than starting only with a keyword.'},
      {title:'Connect the information',description:'Bring search intent and relevant content into the same plan.'},
      {title:'Consider the destination',description:'Discovery is useful when the resulting page helps the visitor understand what to do next.'},
    ],
    exploration:'Explore the wider GleegX Media project for the other connected marketing focus areas and the public brand.',
  },
  {
    slug:'gleegx-content-storytelling', discipline:'marketing', title:'Content & Storytelling', featuredTitle:'Content &\nstorytelling.',
    category:'GleegX Media / Content', summary:'Content strategy and digital storytelling that connect a brand with the people it serves.',
    preview:'content', project:project('gleegx-media'), featured:true, kind:'Focus study', parentSlug:'gleegx-media',
    overview:[
      'This study explores content and storytelling within GleegX Media. It connects the brand message with the questions and interests of the people the work needs to reach.',
      'The emphasis is on clarity and relevance: content should help someone understand the brand and its offer, not simply fill a publishing schedule.',
    ],
    focus:['Content strategy','Brand messaging','Storytelling'],
    scope:[
      {title:'A clear brand message',description:'An understandable connection between what a brand offers and the people it serves.'},
      {title:'Relevant content',description:'Topics and stories considered in the context of audience needs.'},
      {title:'Consistency',description:'A coherent message across the content experience and the next action it supports.'},
    ],
    approach:[
      {title:'Know who it is for',description:'Ground the message in the audience rather than writing for everyone at once.'},
      {title:'Make the story understandable',description:'Use clear language to connect the offer with a meaningful audience need.'},
      {title:'Connect content and action',description:'Consider where a piece of content fits in the wider discovery-to-enquiry journey.'},
    ],
    exploration:'This is one focus study within the GleegX Media project. Explore the wider project for search and lead-generation context.',
  },
  {
    slug:'gleegx-campaigns-connections', discipline:'marketing', title:'Campaigns & Connections', featuredTitle:'Campaigns &\nconnections.',
    category:'GleegX Media / Lead generation', summary:'Lead generation initiatives and a clear path from audience attention to an enquiry.',
    preview:'campaign', project:project('gleegx-media'), featured:true, kind:'Focus study', parentSlug:'gleegx-media',
    overview:[
      'This focus study covers the lead-generation side of the GleegX Media portfolio. It looks at the relationship between the audience, the message, and the action a campaign invites someone to take.',
      'The work is considered alongside search and content, so a campaign has a useful destination and a clear reason for the audience to continue the conversation.',
    ],
    focus:['Lead generation','Campaign strategy','Customer journey'],
    scope:[
      {title:'Audience and offer',description:'A relevant connection between the people being reached and the value being presented.'},
      {title:'The path to enquiry',description:'The steps between noticing a message, understanding an offer, and opening a conversation.'},
      {title:'Connected campaign planning',description:'Campaign thinking considered alongside the search and content experience.'},
    ],
    approach:[
      {title:'Clarify the next action',description:'Define what the audience is being invited to do and why it is relevant.'},
      {title:'Align the journey',description:'Connect the message, the destination, and the enquiry experience.'},
      {title:'Learn from the response',description:'Use the audience response to inform the next message and conversation.'},
    ],
    exploration:'Explore this study in the context of GleegX Media, or visit the public brand to see how its offer is presented.',
  },
];

export const projectCollectionPath = (discipline: Discipline)=>`/${discipline}/projects`;
export const projectDetailsPath = (discipline: Discipline, slug: string)=>`${projectCollectionPath(discipline)}/${slug}`;
export const baseProjectDetailsPath = (item: Project)=>projectDetailsPath(item.category === 'Growth' ? 'marketing' : 'engineering', item.slug);
export const projectsForDiscipline = (discipline: Discipline)=>projectCaseStudies.filter(item=>item.discipline === discipline);
export const findCaseStudy = (discipline: Discipline, slug?: string)=>projectCaseStudies.find(item=>item.discipline === discipline && item.slug === slug);
export const caseStudyForPath = (pathname: string)=>{
  const match = /^\/(engineering|marketing)\/projects\/([^/]+)\/?$/.exec(pathname);
  return match ? findCaseStudy(match[1] as Discipline, match[2]) : undefined;
};
