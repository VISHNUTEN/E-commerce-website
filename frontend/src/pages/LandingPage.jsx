import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, ShieldCheck, Zap } from 'lucide-react';

export default function LandingPage() {
    return (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Welcome to VibeStore
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
                Discover premium technology and lifestyle products. Join our community to start shopping.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '5rem' }}>
                <Link to="/signup" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem', width: 'auto' }}>
                    Get Started <ArrowRight size={20} />
                </Link>
                <Link to="/login" className="btn" style={{ padding: '1rem 2rem', fontSize: '1.125rem', width: 'auto', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
                    Sign In
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                    <ShoppingBag size={40} color="var(--accent-color)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Curated Products</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Only the best items hand-picked for quality.</p>
                </div>
                <div style={{ padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                    <ShieldCheck size={40} color="var(--accent-color)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Secure Checkout</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Safe and encrypted transactions for your peace of mind.</p>
                </div>
                <div style={{ padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                    <Zap size={40} color="var(--accent-color)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Fast Delivery</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Get your products delivered to you in record time.</p>
                </div>
            </div>
        </div>
    );
}
