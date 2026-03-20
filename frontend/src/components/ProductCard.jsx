import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product, updateCartCount, showToast, token }) {
    const [isAdding, setIsAdding] = useState(false);
    const navigate = useNavigate();

    const handleAddToCart = async () => {
        setIsAdding(true);
        try {
            const response = await fetch('http://localhost:5000/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ product_id: product.id, quantity: 1 })
            });

            if (response.ok) {
                updateCartCount();
                showToast(`Added ${product.name} to cart`);
                navigate('/cart');
            }
        } catch (err) {
            console.error("Error adding to cart", err);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="product-card">
            <div className="product-image-container">
                <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
            </div>
            <div className="product-info">
                <h3 className="product-title">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                <div className="product-price">₹{product.price.toFixed(2)}</div>

                <button
                    className="btn btn-primary"
                    onClick={handleAddToCart}
                    disabled={isAdding}
                >
                    <ShoppingBag size={18} />
                    {isAdding ? 'Adding...' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
}
