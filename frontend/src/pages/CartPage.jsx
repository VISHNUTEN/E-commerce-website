import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart, ArrowRight, CreditCard } from 'lucide-react';

export default function CartPage({ updateCartCount, token }) {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkingOut, setCheckingOut] = useState(false);

    const fetchCartItems = () => {
        fetch('http://localhost:5000/api/cart', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setCartItems(data.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching cart items", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchCartItems();
    }, []);

    const handleRemove = async (cartId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/cart/${cartId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchCartItems();
                updateCartCount();
            }
        } catch (err) {
            console.error("Error removing item", err);
        }
    };

    const handleCheckout = async () => {
        setCheckingOut(true);
        try {
            // Simulate network delay for effect
            await new Promise(r => setTimeout(r, 1500));

            const response = await fetch('http://localhost:5000/api/checkout', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setCartItems([]);
                updateCartCount();
                alert('Checkout Successful! Thank you for your purchase.');
            }
        } catch (err) {
            console.error("Checkout failed", err);
        } finally {
            setCheckingOut(false);
        }
    };

    const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    if (loading) {
        return (
            <div className="loader-container">
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div>
            <header className="page-header">
                <h1 className="page-title">Your Cart</h1>
            </header>

            {cartItems.length === 0 ? (
                <div className="cart-container empty-cart">
                    <ShoppingCart size={48} />
                    <h2>Your cart is empty</h2>
                    <p style={{ marginTop: '0.5rem', marginBottom: '2rem' }}>
                        Looks like you haven't added anything to your cart yet.
                    </p>
                    <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto' }}>
                        Continue Shopping <ArrowRight size={18} />
                    </Link>
                </div>
            ) : (
                <div className="cart-container">
                    <div className="cart-list">
                        {cartItems.map(item => (
                            <div key={item.cart_id} className="cart-item">
                                <img src={item.image} alt={item.name} className="cart-item-img" />
                                <div className="cart-item-details">
                                    <h3 className="cart-item-title">{item.name}</h3>
                                    <div className="cart-item-price">
                                        ₹{item.price.toFixed(2)} × {item.quantity}
                                    </div>
                                </div>
                                <div className="cart-item-total" style={{ fontWeight: 600, fontSize: '1.25rem' }}>
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                </div>
                                <button
                                    className="btn btn-danger btn-icon-only"
                                    onClick={() => handleRemove(item.cart_id)}
                                    title="Remove from cart"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <div>
                            <div style={{ color: 'var(--text-muted)' }}>Total Amount</div>
                            <div className="cart-total">₹{total.toFixed(2)}</div>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={handleCheckout}
                            disabled={checkingOut}
                            style={{ padding: '1rem 1rem', fontSize: '1.125rem' }}
                        >
                            <CreditCard size={20} />
                            {checkingOut ? 'Processing...' : 'Proceed to Checkout'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
