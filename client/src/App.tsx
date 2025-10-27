import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/authContext";
import { ProductProvider } from "./contexts/productContext";
import { OrderProvider } from "./contexts/orderContext";
import { BlogProvider } from "./contexts/blogContext";
import { WishlistProvider } from "./contexts/wishlistContext";
import { CartProvider } from "./contexts/cartContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
// import Orders from "./pages/Orders.tsx";
import OrderInfo from "./pages/OrderInfo";
import Blog from "./pages/Blog";
import Login from "./pages/Login";
import Profile from "./pages/Profile.tsx";
import Loading from "./components/Loading";
import OrderHistory from "./pages/OrderHistory";
import { ToastContainer } from "./components/Toast";
import { useNavigate } from "react-router-dom";
import BlogDetail from "./pages/BlogDetail";
import WishList from "./pages/WishList";
import { OrderHistoryProvider } from "./contexts/orderHistoryContext.tsx";
import OrderDetail from "./pages/OrderDetail";
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loading />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <Loading />;

  return (
    <>
      <ToastContainer /> {/* Đặt ở đây để Toast luôn hiển thị trên mọi trang */}
      <Header user={user} onLogout={logout} />
      <main className="flex-1 min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:blog_id" element={<BlogDetail />} />{" "}
          <Route path="/login" element={<Login />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/cart" element={<Cart onNavigate={navigate} />} />
          {/* <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/order-history"
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route path="/order-info" element={<OrderInfo />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/wishlist" element={<WishList />} />
          <Route path="/order-detail/:orderId" element={<OrderDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <AuthProvider>
        <Router>
          <ProductProvider>
            <OrderProvider>
              <BlogProvider>
                <WishlistProvider>
                  <CartProvider>
                    <OrderHistoryProvider>
                      <AppContent />
                    </OrderHistoryProvider>
                  </CartProvider>
                </WishlistProvider>
              </BlogProvider>
            </OrderProvider>
          </ProductProvider>
        </Router>
      </AuthProvider>
    </div>
  );
}
