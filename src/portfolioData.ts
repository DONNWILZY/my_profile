import {type Project} from './data';
import {projectsForDiscipline, type Discipline, type PreviewKind} from './projectCatalog';
export type {Discipline,PreviewKind} from './projectCatalog';

export type PortfolioWork = {
  slug: string;
  project: Project;
  title: string;
  category: string;
  description: string;
  preview: PreviewKind;
};
type Capability = {title: string; detail: string; description: string};
type Approach = {title: string; quote: string; detail: string};
type DisciplineContent = {
  label: string;
  role: string;
  introduction: string;
  contactCopy: string;
  statement: string;
  statementCopy: string;
  capabilities: Capability[];
  focus: string[];
  workHeading: string;
  workDescription: string;
  work: PortfolioWork[];
  approaches: Approach[];
  enquiry: string;
};

const featuredWork = (discipline: Discipline): PortfolioWork[]=>projectsForDiscipline(discipline).filter(item=>item.featured).map(item=>({
  slug:item.slug,
  project:item.project,
  title:item.featuredTitle ?? item.title,
  category:item.category,
  description:item.summary,
  preview:item.preview,
}));

export const disciplinePortfolios: Record<Discipline, DisciplineContent> = {
  engineering: {
    label: 'Engineering portfolio',
    role: 'Software engineer & product builder',
    introduction: 'I turn complex workflows into dependable web products, backend systems, and APIs that feel simple to use.',
    contactCopy: 'Have a product to build, a system to improve, or a technical problem to work through? Let\'s find a useful starting point.',
    statement: 'Good software makes complex things feel simple.',
    statementCopy: 'I connect practical engineering with a clear understanding of the people using it. From the data layer to the final interaction, usefulness comes first.',
    capabilities: [
      {title: 'Product engineering.', detail: 'Web applications & platforms', description: 'Shape an idea into a clear, usable web product, with the workflows and foundations it needs to grow.'},
      {title: 'Backend systems.', detail: 'APIs, integrations & data', description: 'Connect the moving parts: application logic, databases, authentication, and the services behind the experience.'},
      {title: 'Technical strategy.', detail: 'Architecture & practical guidance', description: 'Make considered technical decisions, understand constraints, and plan the next useful step.'},
    ],
    focus: ['Laravel', 'Web applications', 'APIs', 'Authentication', 'Product thinking'],
    workHeading: 'Useful products.\nThoughtful engineering.',
    workDescription: 'A selection of platform, backend, and workflow projects. Open a project for its scope, approach, and links to the live product or source.',
    work: featuredWork('engineering'),
    approaches: [
      {title: 'Start with understanding', quote: 'Before choosing the technology, understand the people and the problem.', detail: 'Clarify the goal, the constraints, and the decisions the product needs to support.'},
      {title: 'Build with intention', quote: 'The best solution is the one people can understand, trust, and use.', detail: 'Keep the experience clear and the underlying systems dependable.'},
      {title: 'Keep learning', quote: 'A product is a conversation. Build, listen, and make the next version better.', detail: 'Use real feedback to decide what deserves attention next.'},
    ],
    enquiry: 'Engineering project',
  },
  marketing: {
    label: 'Marketing portfolio',
    role: 'Digital marketer & growth strategist',
    introduction: 'I bring strategy, search, and storytelling together to help brands become easier to find, understand, and connect with.',
    contactCopy: 'Working on your brand, your content, or your next campaign? Let\'s talk about the people you want to reach.',
    statement: 'Good marketing starts with a clear story and the right people.',
    statementCopy: 'I connect audience understanding with useful content and a thoughtful path from discovery to enquiry. Attention matters when it leads somewhere meaningful.',
    capabilities: [
      {title: 'Brand & content.', detail: 'Positioning, stories & consistency', description: 'Bring clarity to what you offer, who it serves, and the stories that help your audience understand it.'},
      {title: 'Search & discovery.', detail: 'SEO & organic visibility', description: 'Connect search intent, useful content, and a clear website experience so the right people can find you.'},
      {title: 'Campaign strategy.', detail: 'Acquisition & lead generation', description: 'Plan how a campaign moves from audience and message to a relevant next step and meaningful measurement.'},
    ],
    focus: ['Brand strategy', 'SEO', 'Content', 'Organic growth', 'Lead generation'],
    workHeading: 'One brand.\nConnected growth work.',
    workDescription: 'Three connected focus areas within GleegX Media, from discovery to content and lead generation.',
    work: featuredWork('marketing'),
    approaches: [
      {title: 'Know the audience', quote: 'A useful story begins with knowing who needs to hear it.', detail: 'Understand the questions, motivations, and context behind the audience.'},
      {title: 'Make the message clear', quote: 'Clarity gives people a reason to stop, understand, and take the next step.', detail: 'Connect the offer, the content, and the call to action in a way that feels natural.'},
      {title: 'Learn from the response', quote: 'Look beyond impressions. Learn what creates trust and moves the conversation forward.', detail: 'Use the response to refine the message, the channel, and the next campaign.'},
    ],
    enquiry: 'Marketing project',
  },
};
