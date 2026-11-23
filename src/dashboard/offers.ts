export type PortfolioOffer = {
  id: string;
  title: string;
  description: string;
  label: string;
  actionLabel: string;
  path: string;
};

export const portfolioOffers: PortfolioOffer[] = [
  {
    id: 'product-planning-worksheet',
    title: 'Start with a clearer product idea',
    description: 'Use the free, editable product planning worksheet to define your audience, core journey, and first useful release.',
    label: 'Free resource',
    actionLabel: 'Get the worksheet',
    path: '/digital-products/digital-product-planning-worksheet',
  },
  {
    id: 'dedicated-learning-cohort',
    title: 'Learn together as a team',
    description: 'Discuss a dedicated training batch for your team or community, shaped around your learning goals and availability.',
    label: 'Team & community',
    actionLabel: 'Discuss a cohort',
    path: '/contact?topic=Cohort+training&item=Dedicated+cohort+training',
  },
  {
    id: 'discovery-conversation',
    title: 'Make room for your next idea',
    description: 'Explore a project, marketing challenge, or collaboration in a discovery conversation with Godswill.',
    label: 'Work together',
    actionLabel: 'Explore booking',
    path: '/book',
  },
];
