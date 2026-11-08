import {Link} from 'react-router-dom';
import {socials} from '../data';

export function Training(){
  return <div className="container-wide py-20">
    <div className="mb-10 max-w-3xl">
      <p className="eyebrow mb-4">Training</p>
      <h1 className="display text-4xl sm:text-5xl lg:text-6xl">Practical skills. Real possibilities.</h1>
      <p className="prose-copy mt-6">Explore training in technology, digital marketing, and communication. Get in touch to discuss your learning goals or a workshop for your team.</p>
    </div>
    <div className="grid gap-6 md:grid-cols-3">
      {[
        ['Software engineering','Web development, backend fundamentals, APIs, and building useful digital products.'],
        ['Digital marketing','Content strategy, SEO, audience development, and measuring campaign results.'],
        ['Digital skills & communication','Working with digital tools, presenting ideas clearly, and exploring opportunities in technology.'],
      ].map(([title,description])=><article key={title} className="rounded-3xl border border-slate-100 bg-white p-8">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>
      </article>)}
    </div>
    <div className="mt-10 rounded-3xl bg-blue-50 p-8 sm:p-10">
      <h2 className="font-display text-2xl font-bold">What would you like to learn?</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Share your experience level, the topics you want to explore, and whether you are learning individually or with a team.</p>
      <Link to="/contact" className="btn-primary mt-6">Enquire about training</Link>
    </div>
  </div>;
}

export function Community(){
  return <div className="container-wide py-20">
    <div className="mb-10 max-w-3xl">
      <p className="eyebrow mb-4">Community</p>
      <h1 className="display text-4xl sm:text-5xl lg:text-6xl">Good ideas grow through connection.</h1>
      <p className="prose-copy mt-6">Follow along, explore projects, and connect around technology, digital skills, and creative work.</p>
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      <section className="rounded-3xl bg-navy p-8 text-white sm:p-10">
        <h2 className="font-display text-2xl font-bold">Stay connected</h2>
        <p className="mt-4 text-sm leading-7 text-blue-100/80">Find me on these platforms to follow my work and join the conversation.</p>
        <div className="mt-7 flex flex-wrap gap-3">{socials.map(social=><a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/25 px-5 py-3 text-sm hover:bg-white/10">{social.name}</a>)}</div>
      </section>
      <section className="rounded-3xl border border-slate-100 bg-white p-8 sm:p-10">
        <h2 className="font-display text-2xl font-bold">Explore and exchange ideas</h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">Browse insights and past appearances, or get in touch about a collaboration or community event.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/blog" className="btn-light">Browse insights</Link>
          <Link to="/events" className="btn-light">Explore events</Link>
          <Link to="/contact" className="btn-light">Get in touch</Link>
        </div>
      </section>
    </div>
  </div>;
}
