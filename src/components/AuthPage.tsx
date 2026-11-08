import {useState} from 'react';
import {Link} from 'react-router-dom';
import { LockKeyhole} from 'lucide-react';
import {brand} from '../brand';
import BrandLogo from './BrandLogo';

export default function AuthPage({mode}:{mode:'login'|'signup'}){
  const signup=mode==='signup';
  const [visible,setVisible]=useState(false);
  return <section className="auth-page"><div className="auth-card"><Link to="/" className="auth-mark" aria-label={`${brand.fullName} home`}><BrandLogo markOnly/></Link><span className="auth-eyebrow">{brand.auth.eyebrow}</span><h1>{signup?'Create your account':'Welcome back'}</h1><p className="auth-description">{signup?brand.auth.signupDescription:brand.auth.loginDescription}</p><div className="auth-notice" role="note"><LockKeyhole size={18}/><p>Account access is coming soon. {signup?'Registration':'Login'} will be available when accounts launch.</p></div><form onSubmit={event=>event.preventDefault()} aria-label={signup?'Sign up preview':'Login preview'}>
    {signup&&<div className="auth-field"><label htmlFor="account-name">Full name</label><input id="account-name" name="name" autoComplete="name" placeholder="Your full name" required/></div>}
    <div className="auth-field"><label htmlFor="account-email">Email address</label><input id="account-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required/></div>
    <div className="auth-field"><label htmlFor="account-password">Password</label><input id="account-password" name="password" type={visible?'text':'password'} autoComplete={signup?'new-password':'current-password'} minLength={8} placeholder={signup?'At least 8 characters':'Enter your password'} required/></div>
    <label className="auth-show-password"><input type="checkbox" checked={visible} onChange={event=>setVisible(event.target.checked)}/>Show password</label>
    <button className="auth-submit" disabled type="submit">{signup?'Sign up':'Log in'} — coming soon </button>
    <p className="auth-privacy">This preview does not send or save your details.</p>
  </form><p className="auth-switch">{signup?'Already have an account?':'New here?'} <Link to={signup?'/login':'/signup'}>{signup?'Log in':'Sign up'}</Link></p></div><Link className="auth-back" to="/">Back to home</Link></section>;
}
