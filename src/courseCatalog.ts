export type CourseFormat = 'individual' | 'cohort';

export type Course = {
  slug: string;
  title: string;
  summary: string;
  discipline: 'Engineering' | 'Marketing' | 'Communication';
  format: CourseFormat;
  level: string;
  mark: string;
  overview: string;
  outcomes: string[];
  audience: string[];
  requirements: string[];
  modules: {title: string; description: string}[];
  relatedSlug?: string;
};

const webModules = [
  {title: 'Start with the web', description: 'Understand how browsers, servers, and requests work together. Set up your tools and plan a small web project.'},
  {title: 'Build an accessible interface', description: 'Structure a page with HTML, style responsive layouts with CSS, and add practical interaction with JavaScript.'},
  {title: 'Connect the moving parts', description: 'Explore APIs, data, forms, and the responsibilities of a backend. Practice handling loading, validation, and errors.'},
  {title: 'Ship a useful project', description: 'Bring the pieces together, review your work, and prepare a clear project walkthrough and deployment checklist.'},
];
const marketingModules = [
  {title: 'Understand your audience', description: 'Define the people you want to reach, their needs, and a clear message that connects your offer to those needs.'},
  {title: 'Plan content with purpose', description: 'Choose themes, formats, and channels. Turn a business goal into a practical content calendar.'},
  {title: 'Build for discovery', description: 'Explore search intent, useful page content, basic SEO, and a visitor journey with a clear next step.'},
  {title: 'Learn from the results', description: 'Choose meaningful measures, review what the numbers can tell you, and plan a small campaign experiment.'},
];

export const courses: Course[] = [
  {
    slug: 'web-development-foundations', title: 'Web Development Foundations',
    summary: 'Go from understanding the web to planning and building a useful, responsive project.',
    discipline: 'Engineering', format: 'individual', level: 'Beginner', mark: 'WEB',
    overview: 'An upcoming individual course for people who want a practical starting point in web development. The proposed outline connects the basics of an interface with the systems behind it, using a small project as a thread throughout.',
    outcomes: ['Explain how a web application fits together.', 'Build a responsive page with clear structure and accessible controls.', 'Work with forms, data, and basic API concepts.', 'Present a small project and a plan for improving it.'],
    audience: ['People starting their journey in software engineering.', 'Creators who want to understand how their website works.'],
    requirements: ['Access to a laptop and a reliable internet connection.', 'Comfort using a browser and managing files. No coding experience required.'],
    modules: webModules, relatedSlug: 'web-development-cohort',
  },
  {
    slug: 'digital-marketing-essentials', title: 'Digital Marketing Essentials',
    summary: 'Connect audience insight, content, search, and measurement into a focused marketing plan.',
    discipline: 'Marketing', format: 'individual', level: 'Beginner', mark: 'GROW',
    overview: 'An upcoming individual course for building a clear, practical approach to digital marketing. Work through an audience brief and a simple campaign plan rather than treating every channel as a separate task.',
    outcomes: ['Define an audience and a focused message.', 'Create a useful content plan tied to a business goal.', 'Understand the foundations of search visibility.', 'Choose measures that help you improve a campaign.'],
    audience: ['Small business owners and independent creators.', 'Aspiring marketers looking for a structured starting point.'],
    requirements: ['Access to a computer and the internet.', 'A real or practice business idea to use in the exercises.'],
    modules: marketingModules, relatedSlug: 'digital-marketing-cohort',
  },
  {
    slug: 'communicate-your-ideas', title: 'Communicate Your Ideas',
    summary: 'Shape a clear story, build a useful presentation, and speak with purpose.',
    discipline: 'Communication', format: 'individual', level: 'All levels', mark: 'TALK',
    overview: 'An upcoming individual course for people who want to make their ideas easier to understand. The proposed exercises take one idea from a rough outline to a focused presentation for a specific audience.',
    outcomes: ['Organize a message around what your audience needs.', 'Build a clear opening, supporting story, and next step.', 'Prepare simple visuals that support your message.', 'Practice delivering your idea and reflecting on feedback.'],
    audience: ['Professionals presenting projects or proposals.', 'Students, community members, and first-time speakers.'],
    requirements: ['An idea or topic you would like to present.', 'A way to record a short practice presentation.'],
    modules: [
      {title: 'Find the point', description: 'Clarify the audience, the purpose, and the single idea you want people to remember.'},
      {title: 'Shape the story', description: 'Turn your thoughts into a clear structure with examples and useful supporting details.'},
      {title: 'Design and deliver', description: 'Prepare simple presentation materials and practice a delivery style that fits your message.'},
      {title: 'Reflect and refine', description: 'Use a short recording and a feedback checklist to decide what to improve next.'},
    ],
  },
  {
    slug: 'web-development-cohort', title: 'Web Development Cohort',
    summary: 'Build alongside a learning group, with shared milestones and project review sessions.',
    discipline: 'Engineering', format: 'cohort', level: 'Beginner', mark: 'BUILD',
    overview: 'A planned batch training format based on Web Development Foundations. Learn with a group through guided sessions, practice tasks, and a shared project rhythm. Batch dates, delivery arrangements, and fees will be confirmed before enrollment opens.',
    outcomes: ['Practice web fundamentals through a guided project.', 'Share progress and questions with a learning group.', 'Use review sessions to improve your work.', 'Prepare a project walkthrough and next-step learning plan.'],
    audience: ['Beginners who prefer a structured group learning experience.', 'Teams or communities interested in a dedicated training batch.'],
    requirements: ['A laptop, internet access, and time for practice between sessions.', 'Availability for the agreed batch schedule once dates are confirmed.'],
    modules: webModules, relatedSlug: 'web-development-foundations',
  },
  {
    slug: 'digital-marketing-cohort', title: 'Digital Marketing Cohort',
    summary: 'Develop a campaign plan with a group through guided practice, discussion, and feedback.',
    discipline: 'Marketing', format: 'cohort', level: 'Beginner', mark: 'REACH',
    overview: 'A planned batch training format based on Digital Marketing Essentials. Bring a real or practice brand and work through a campaign brief with a learning group. Batch dates, delivery arrangements, and fees will be confirmed before enrollment opens.',
    outcomes: ['Turn a business goal into a focused campaign brief.', 'Build a content and search plan with guided practice.', 'Discuss your choices and refine them through feedback.', 'Leave with a clear plan for measuring your next experiment.'],
    audience: ['Aspiring marketers who enjoy learning with others.', 'Business teams and communities planning a group training experience.'],
    requirements: ['A computer, internet access, and a real or practice brand.', 'Availability for the agreed batch schedule once dates are confirmed.'],
    modules: marketingModules, relatedSlug: 'digital-marketing-essentials',
  },
];

export function coursePath(course: Course) {
  return course.format === 'cohort' ? `/courses/cohorts/${course.slug}` : `/courses/${course.slug}`;
}

export function courseForPath(path: string) {
  return courses.find(course => coursePath(course) === path.replace(/\/+$/, ''));
}

export function courseEnquiryPath(course: Course) {
  const params = new URLSearchParams({topic: course.format === 'cohort' ? 'Cohort training' : 'Courses', item: course.title});
  return `/contact?${params.toString()}`;
}
