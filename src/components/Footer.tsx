import {Link} from 'react-router-dom';
import {brand} from '../brand';
import BrandLogo from './BrandLogo';

export default function Footer(){
  return <footer className="bg-navy text-white">
    <div className="container-wide py-16">
      <div className="flex flex-col justify-between gap-12 md:flex-row">
        <div className="max-w-md">
          <Link to="/" aria-label={`${brand.fullName} home`} className="mb-7 inline-flex"><BrandLogo variant="inverse"/></Link>
          <p className="font-display text-3xl font-extrabold">{brand.footerHeadline}</p>
          <p className="mt-4 text-blue-100/80">{brand.shortDescription}</p>
          <Link to="/contact" className="btn-primary mt-7">Start a conversation</Link>
        </div>
        <div className="flex flex-wrap gap-12">
          <div>
            <p className="mb-5 text-xs uppercase tracking-widest text-blue-200">Explore</p>
            <div className="flex flex-col gap-3 text-sm">{[['/portfolio','Work'],['/training','Training'],['/community','Community'],['/blog','Insights'],['/book','Booking']].map(([to,label])=><Link key={to} to={to} className="hover:text-blue-300">{label}</Link>)}</div>
          </div>
          <div>
            <p className="mb-5 text-xs uppercase tracking-widest text-blue-200">Connect</p>
            <div className="flex flex-col gap-3 text-sm">{brand.socials.map(social=><a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-300">{social.name}</a>)}</div>
          </div>
        </div>
      </div>
      <div className="mt-16 flex flex-col justify-between gap-3 border-t border-white/15 pt-6 text-sm text-blue-100/70 sm:flex-row">
        <span>&copy; {new Date().getFullYear()} {brand.fullName}. All rights reserved.</span>
        <span>{brand.tagline}</span>
      </div>
    </div>
  </footer>;
}
