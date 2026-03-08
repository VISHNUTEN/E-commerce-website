import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Store } from 'lucide-react';

export default function Navbar({ cartCount }) {
    const location = useLocation();

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <Store size={28} />
                <span>VibeStore</span>
            </Link>

            <div className="navbar-links">
                <Link
                    to="/"
                    className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
                >
                    Products
                </Link>
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
            </div>
        </nav>
    );
}
