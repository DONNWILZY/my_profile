export type DigitalProduct = {
  slug: string;
  title: string;
  category: 'Platform' | 'Resource';
  summary: string;
  status: string;
  preview: 'lpg' | 'career' | 'worksheet';
  description: string[];
  audience: string;
  features: {title: string; description: string}[];
  website?: string;
  download?: string;
  fileLabel?: string;
  projectSlug?: string;
};

export const digitalProducts: DigitalProduct[] = [
  {
    slug: 'my-lpg-hub',
    title: 'My LPG Hub',
    category: 'Platform',
    summary: 'A digital marketplace connecting LPG customers, vendors, and delivery operations.',
    status: 'External platform',
    preview: 'lpg',
    description: [
      'My LPG Hub brings the moving parts of an LPG marketplace into a shared digital experience. It connects the needs of customers with the vendors and delivery operations that serve them.',
      'Explore the platform directly, or read the engineering case study for more context on the product and its scope.',
    ],
    audience: 'LPG customers, vendors, and teams working across LPG distribution and delivery.',
    features: [
      {title: 'Marketplace experience', description: 'A focused space for connecting LPG demand with service providers.'},
      {title: 'Connected operations', description: 'A product direction that considers customers, vendors, and delivery together.'},
      {title: 'Product context', description: 'A dedicated case study explores the problem, scope, and engineering approach.'},
    ],
    website: 'https://mylpg.site/',
    projectSlug: 'my-lpg-hub',
  },
  {
    slug: 'raywills-career',
    title: 'Raywills Career',
    category: 'Platform',
    summary: 'A career and skills platform bringing talent, hiring, and professional learning together.',
    status: 'External platform',
    preview: 'career',
    description: [
      'Raywills Career explores how a digital platform can connect professional development with access to opportunity. Its focus brings talent, hiring, and learning into the same product conversation.',
      'Visit the platform to explore its current experience. The engineering case study provides a closer look at the project and its underlying product focus.',
    ],
    audience: 'People developing their careers and teams connecting with professional talent.',
    features: [
      {title: 'Career development', description: 'A platform direction centered on professional progress and useful skills.'},
      {title: 'Talent and opportunity', description: 'A shared product space for talent discovery and hiring needs.'},
      {title: 'Learning in context', description: 'Professional learning considered alongside the next step in a career.'},
    ],
    website: 'https://raywillscareer.online/',
    projectSlug: 'raywills-career',
  },
  {
    slug: 'digital-product-planning-worksheet',
    title: 'Digital Product Planning Worksheet',
    category: 'Resource',
    summary: 'A practical, editable worksheet for turning a product idea into a clear first release.',
    status: 'Ready to download',
    preview: 'worksheet',
    description: [
      'Start with the person you are helping, define the problem, and outline the smallest useful version of your idea. This worksheet gives those decisions a simple structure before you start building.',
      'Download the Markdown file and open it in your preferred notes or text editor. Work through it on your own or use it as the starting point for a product discussion with your team.',
    ],
    audience: 'Founders, builders, and small teams preparing a new digital product or feature.',
    features: [
      {title: 'A clear product brief', description: 'Prompts for your audience, their problem, and the change your product should make.'},
      {title: 'A focused first release', description: 'Space to map a core journey, set boundaries, and decide what can wait.'},
      {title: 'Validation and launch checks', description: 'Questions for gathering feedback and preparing a useful, accessible release.'},
    ],
    download: 'resources/digital-product-planning-worksheet.md',
    fileLabel: 'Editable Markdown worksheet',
  },
];

export function digitalProductForPath(pathname: string): DigitalProduct | undefined {
  const match = /^\/digital-products\/([^/]+)\/?$/.exec(pathname);
  return match ? digitalProducts.find(product => product.slug === match[1]) : undefined;
}
