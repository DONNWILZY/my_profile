import {brand} from '../brand';
import './brand-logo.css';

type BrandLogoProps = {
  variant?: 'default' | 'inverse';
  markOnly?: boolean;
  className?: string;
};

/** The enclosing link supplies the accessible name for this decorative lockup. */
export default function BrandLogo({variant = 'default', markOnly = false, className = ''}: BrandLogoProps) {
  return (
    <span className={`brand-logo brand-logo--${variant}${markOnly ? ' brand-logo--mark' : ''}${className ? ` ${className}` : ''}`} aria-hidden="true">
      <img className="brand-logo__mark" src={`${import.meta.env.BASE_URL}${brand.assets.mark}`} alt="" width="40" height="40" />
      {!markOnly && <span className="brand-logo__wordmark">{brand.name}<span className="brand-logo__dot">.</span></span>}
    </span>
  );
}
