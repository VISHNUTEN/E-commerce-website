import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Store } from 'lucide-react';

export default function Navbar({ cartCount, token, handleLogout }) {
    const location = useLocation();

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <Store size={28} />
                <span>Vishnu's Store</span>
            </Link>

            <div className="navbar-links">
                <Link
                    to={token ? "/shop" : "/"}
                    className={`nav-item ${location.pathname === '/' || location.pathname === '/shop' ? 'active' : ''}`}
                >
                    Products
                </Link>

                {token ? (
                    <>
                        <Link
                            to="/cart"
                            className={`nav-item ${location.pathname === '/cart' ? 'active' : ''}`}
                        >
                            <ShoppingCart size={20} />
                            Cart
                            {cartCount > 0 && (
                                <span className="cart-badge">{cartCount}</span>
                            )}
                        </Link>
                        <button onClick={handleLogout} className="btn-logout" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className={`nav-item ${location.pathname === '/login' ? 'active' : ''}`}>
                            Login
                        </Link>
                        <Link to="/signup" className={`nav-item ${location.pathname === '/signup' ? 'active' : ''}`}>
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
