import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "../src/user/contexts/authContext";
import { ProductProvider } from "../src/user/contexts/productContext";
import { OrderProvider } from "../src/user/contexts/orderContext";
import { BlogProvider } from "../src/user/contexts/blogContext";
import { WishlistProvider } from "../src/user/contexts/wishlistContext";
import { CartProvider } from "../src/user/contexts/cartContext";
import Header from "./user/components/Header.tsx";
import Footer from "./user/components/Footer.tsx";
import Home from "../src/user/pages/Home";
import Products from "../src/user/pages/Products";
import ProductDetails from "../src/user/pages/ProductDetails";
import Cart from "../src/user/pages/Cart";
// import Orders from "./pages/Orders.tsx";
import OrderInfo from "../src/user/pages/OrderInfo";
import Blog from "../src/user/pages/Blog";
import Login from "../src/user/pages/Login";
import Profile from "../src/user/pages/Profile.tsx";
import Loading from "./user/components/Loading.tsx";
import OrderHistory from "../src/user/pages/OrderHistory";
import { ToastContainer } from "./user/components/Toast.tsx";
import { useNavigate } from "react-router-dom";
import BlogDetail from "../src/user/pages/BlogDetail";
import WishList from "../src/user/pages/WishList";
import { OrderHistoryProvider } from "../src/user/contexts/orderHistoryContext.tsx";
import OrderDetail from "../src/user/pages/OrderDetail";
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
