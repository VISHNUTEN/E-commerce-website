import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Package } from 'lucide-react';

export default function Home({ updateCartCount, token }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setProducts(data.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching products", err);
                setLoading(false);
            });
    }, []);

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => {
            setToastMessage('');
        }, 3000);
    };

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
                <h1 className="page-title">Curated Premium Goods</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Discover the best technology and lifestyle products.
                </p>
            </header>

            <div className="product-grid">
                {products.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        updateCartCount={updateCartCount}
                        showToast={showToast}
                        token={token}
                    />
                ))}
            </div>

            {toastMessage && (
                <div className="toast">
                    <Package size={20} color="var(--accent-color)" />
                    {toastMessage}
                </div>
            )}
        </div>
    );
}
