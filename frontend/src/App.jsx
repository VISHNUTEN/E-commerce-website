import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CartPage from './pages/CartPage';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Protected Route Wrapper
function ProtectedRoute({ token, children }) {
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const [cartCount, setCartCount] = useState(0);
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');

  // Persist token
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      setCartCount(0); // clear count on logout
    }
  }, [token]);

  // Fetch initial cart count
  const fetchCartCount = () => {
    if (!token) return;
    fetch('http://localhost:5000/api/cart', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          setToken(''); // Definitive auth failure
          throw new Error("Auth failed");
        }
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then(data => {
        if (data.data) {
          const totalItems = data.data.reduce((acc, item) => acc + item.quantity, 0);
          setCartCount(totalItems);
        }
      })
      .catch(err => {
        console.error("Error fetching cart", err);
      });
  };

  useEffect(() => {
    fetchCartCount();
  }, [token]);

  const handleLogout = () => {
    setToken('');
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar cartCount={cartCount} token={token} handleLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={token ? <Navigate to="/shop" /> : <LandingPage />} />
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="/signup" element={<Signup setToken={setToken} />} />
            <Route
              path="/shop"
              element={
                <ProtectedRoute token={token}>
                  <Home updateCartCount={fetchCartCount} token={token} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute token={token}>
                  <CartPage updateCartCount={fetchCartCount} token={token} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
