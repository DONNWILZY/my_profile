import {Link, useLocation, useParams, useSearchParams} from 'react-router-dom';
import {brandAsset} from '../brand';
import {digitalProducts, type DigitalProduct} from '../digitalProductsData';
import {useDashboard} from '../dashboard/DashboardProvider';
import './offerings.css';

function ProductPreview({product}: {product: DigitalProduct}) {
  return <div className={`digital-preview digital-preview-${product.preview}`} aria-hidden="true">
    <div className="digital-preview-bar"><span>{product.category === 'Resource' ? 'THE PRODUCT BRIEF' : product.title}</span><span className="digital-preview-dots"><i/><i/><i/></span></div>
    {product.preview === 'lpg' ? <>
      <div className="digital-preview-heading"><span>Everyday energy.</span><strong>Connected.</strong></div>
      <div className="digital-preview-grid">
        {['Customers', 'Vendors', 'Delivery'].map((label, index) => <div className="digital-preview-cell" key={label}><span>{String(index + 1).padStart(2, '0')}</span><strong>{label}</strong></div>)}
      </div>
      <div className="digital-preview-footer">A shared marketplace experience</div>
    </> : product.preview === 'career' ? <>
      <div className="digital-preview-heading"><span>Your next chapter.</span><strong>Build toward it.</strong></div>
      <div className="digital-preview-rows">
        {['Discover opportunities', 'Develop your skills', 'Connect with talent'].map((label, index) => <div className="digital-preview-row" key={label}><span className="digital-preview-row-mark">{['RC', 'SK', 'CT'][index]}</span><span>{label}</span><i/></div>)}
      </div>
    </> : <div className="digital-preview-sheet">
      <span className="digital-preview-document-label">A WORKING DOCUMENT</span>
      <strong>From idea<br/>to first release.</strong>
      {['The person', 'The problem', 'The first useful version'].map((label, index) => <div className="digital-preview-document-row" key={label}><span>0{index + 1}</span>{label}<i/></div>)}
      <span className="digital-preview-document-note">Make room for the right questions.</span>
    </div>}
  </div>;
}

function ProductCard({product}: {product: DigitalProduct}) {
  const location = useLocation();
  return <Link to={`/digital-products/${product.slug}`} state={{from: location.pathname + location.search}} className="offering-card">
    <div className="offering-card-art"><ProductPreview product={product}/></div>
    <div className="offering-card-body">
      <div className="offering-card-meta"><span className="offering-chip">{product.category}</span><span className="offering-status">{product.status}</span></div>
      <h3>{product.title}</h3>
      <p>{product.summary}</p>
      <span className="offering-card-link">View product details</span>
    </div>
  </Link>;
}

export function DigitalProducts() {
  const [params, setParams] = useSearchParams();
  const selected = params.get('type');
  const category = selected === 'Platform' || selected === 'Resource' ? selected : 'All';
  const setCategory = (value: 'All' | 'Platform' | 'Resource') => {
    const next = new URLSearchParams(params);
    if (value === 'All') next.delete('type'); else next.set('type', value);
    setParams(next, {replace: true});
  };
  const visibleProducts = digitalProducts.filter(product => category === 'All' || product.category === category);

  return <div className="offering-page digital-products-page">
    <div className="offering-wrap">
      <section className="offering-hero">
        <div>
          <p className="offering-eyebrow">Digital products</p>
          <h1 className="offering-title">Useful ideas.<br/>Built to be used.</h1>
          <p className="offering-lead">Explore platforms that connect people with services and opportunities, alongside practical resources for your next product idea.</p>
          <div className="offering-actions"><button type="button" className="btn-primary" onClick={() => document.getElementById('product-catalog')?.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'})}>Explore the collection</button><Link className="btn-light" to="/contact?topic=Digital%20products">Discuss a product idea</Link></div>
        </div>
        <div className="offering-hero-art"><ProductPreview product={digitalProducts[2]}/></div>
      </section>

      <section id="product-catalog" className="offering-catalog" aria-labelledby="products-heading">
        <div className="offering-section-heading">
          <div><p className="offering-eyebrow">The collection</p><h2 id="products-heading">Platforms & resources</h2><p>Get to know each product, then explore the platform or download the resource.</p></div>
          <div className="offering-filters" role="group" aria-label="Filter digital products">{(['All', 'Platform', 'Resource'] as const).map(filter => <button key={filter} type="button" className="offering-filter" aria-pressed={category === filter} onClick={() => setCategory(filter)}>{filter === 'All' ? 'All products' : `${filter}s`}</button>)}</div>
        </div>
        <p className="offering-result-count" aria-live="polite">{visibleProducts.length} {visibleProducts.length === 1 ? 'product' : 'products'}</p>
        <div className="offering-grid">{visibleProducts.map(product => <ProductCard product={product} key={product.slug}/>)}</div>
      </section>

      <section className="offering-callout">
        <div><p className="offering-eyebrow">Have something in mind?</p><h2>Let's give your idea a clear direction.</h2><p>Share the problem you want to solve, who it is for, and where you are in the process.</p></div>
        <Link className="btn-primary" to="/contact?topic=Digital%20products">Start a conversation</Link>
      </section>
    </div>
  </div>;
}

export function DigitalProductDetails() {
  const {slug} = useParams();
  const location = useLocation();
  const {state, toggleProduct} = useDashboard();
  const product = digitalProducts.find(item => item.slug === slug);

  if (!product) return <div className="offering-page"><div className="offering-wrap offering-empty offering-missing"><p className="offering-eyebrow">Digital products</p><h1 className="offering-title">Product not found.</h1><p className="offering-lead">This product is not in the current collection. Explore the available platforms and resources.</p><Link className="btn-primary" to="/digital-products">Browse digital products</Link></div></div>;

  const relatedProducts = digitalProducts.filter(item => item.slug !== product.slug);
  const saved = state.savedProductSlugs.includes(product.slug);
  const from = (location.state as {from?: unknown} | null)?.from;
  const back = typeof from === 'string' && (from === '/digital-products' || from.startsWith('/digital-products?')) ? from : '/digital-products';

  return <div className="offering-page digital-product-details">
    <div className="offering-wrap">
      <nav className="offering-breadcrumb" aria-label="Breadcrumb"><Link to={back}>Digital products</Link><span>/</span><span aria-current="page">{product.title}</span></nav>
      <section className="offering-hero">
        <div>
          <div className="offering-card-meta"><span className="offering-chip">{product.category}</span><span className="offering-status">{product.status}</span></div>
          <h1 className="offering-title">{product.title}</h1>
          <p className="offering-lead">{product.summary}</p>
          <div className="offering-actions">
            {product.website && <a href={product.website} target="_blank" rel="noopener noreferrer" className="btn-primary">Visit platform<span className="sr-only"> (opens in a new tab)</span></a>}
            {product.download && <a href={brandAsset(product.download)} download="digital-product-planning-worksheet.md" className="btn-primary">Download worksheet</a>}
            <Link className="btn-light" to={`/contact?topic=Digital%20products&item=${encodeURIComponent(product.title)}`}>Ask about this product</Link>
            <button type="button" className="btn-light" aria-pressed={saved} onClick={() => toggleProduct(product.slug)}>{saved ? 'Saved to my resources' : 'Save to my resources'}</button>
            {saved && <Link to="/dashboard/resources" className="offering-text-link">Open my resources</Link>}
          </div>
          {product.fileLabel && <p className="offering-file-label">{product.fileLabel}. No account required.</p>}
        </div>
        <div className="offering-hero-art"><ProductPreview product={product}/></div>
      </section>

      <div className="offering-detail-layout">
        <div className="offering-detail-copy">
          <section><p className="offering-eyebrow">An introduction</p><h2>{product.category === 'Resource' ? 'A little structure goes a long way.' : 'A closer look at the product.'}</h2>{product.description.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>
          <section><p className="offering-eyebrow">Inside the {product.category.toLowerCase()}</p><h2>{product.category === 'Resource' ? 'What you can work through' : 'What it brings together'}</h2><div className="offering-list">{product.features.map((feature, index) => <article key={feature.title}><span className="offering-list-number">0{index + 1}</span><div><h3>{feature.title}</h3><p>{feature.description}</p></div></article>)}</div></section>
        </div>
        <aside className="offering-panel">
          <p className="offering-eyebrow">At a glance</p><h2>{product.category === 'Resource' ? 'Start with the right questions.' : 'Explore it for yourself.'}</h2>
          <dl className="offering-facts"><div><dt>Type</dt><dd>{product.category}</dd></div><div><dt>Access</dt><dd>{product.status}</dd></div>{product.fileLabel && <div><dt>Format</dt><dd>{product.fileLabel}</dd></div>}</dl>
          <h3>Who it is for</h3><p>{product.audience}</p>
          {product.projectSlug && <Link className="offering-card-link" to={`/engineering/projects/${product.projectSlug}`}>Read the engineering case study</Link>}
          {product.download && <p>You can copy, edit, and reuse this worksheet for your own project planning.</p>}
        </aside>
      </div>

      <section className="offering-related" aria-labelledby="related-products-heading">
        <div className="offering-section-heading"><div><p className="offering-eyebrow">Keep exploring</p><h2 id="related-products-heading">More from the collection</h2></div><Link className="btn-light" to="/digital-products">All digital products</Link></div>
        <div className="offering-grid">{relatedProducts.map(item => <ProductCard key={item.slug} product={item}/>)}</div>
      </section>
    </div>
  </div>;
}
