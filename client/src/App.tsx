import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "../src/shared/contexts/authContext";
import { ProductProvider } from "../src/shared/contexts/productContext";
import { OrderProvider } from "../src/shared/contexts/orderContext";
import { BlogProvider } from "../src/shared/contexts/blogContext";
import { WishlistProvider } from "../src/shared/contexts/wishlistContext";
import { CartProvider } from "../src/shared/contexts/cartContext";
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
import { ToastContainer } from "./shared/components/Toast.tsx";
import { useNavigate } from "react-router-dom";
import BlogDetail from "../src/user/pages/BlogDetail";
import WishList from "../src/user/pages/WishList";
import { OrderHistoryProvider } from "../src/shared/contexts/orderHistoryContext.tsx";
import OrderDetail from "../src/user/pages/OrderDetail";

// Admin imports
import AdminLayout from "./admin/components/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import UserList from "./admin/pages/UserList";
import ProductList from "./admin/pages/ProductList";
import OrderList from "./admin/pages/OrderList";
import AdminOrderDetail from "./admin/pages/OrderDetail";
import InventoryList from "./admin/pages/InventoryList";
import CategoryPage from "./admin/pages/CategoryPage";
import { AdminProvider } from "./admin/contexts/adminContext";
import { ProductProvider as AdminProductProvider } from "./admin/contexts/productContext";
import { InventoryProvider } from "./admin/contexts/inventoryContext";
import { SupplierProvider } from "./admin/contexts/supplierContext";
import { OrderProvider as AdminOrderProvider } from "./admin/contexts/orderContext";
import { VoucherProvider } from "./admin/contexts/voucherContext";
import SupplierList from "./admin/pages/SupplierList";
import ProductImagePage from "./admin/pages/ProductImagePage";
import VoucherList from "./admin/pages/VoucherList";
import { ProductImageProvider } from "./admin/contexts/product_imageContext";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loading />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Admin Protected Route - check if user is admin
function AdminProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <Loading />;

  // Kiểm tra user có role_id === 0 (admin) không
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role_id !== 0) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppContent() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <Loading />;

  return (
    <>
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
                      <ToastContainer /> {/* Toast cho toàn bộ app */}
                      <Routes>
                        {/* Admin Routes */}
                        <Route
                          path="/admin/*"
                          element={
                            <AdminProtectedRoute>
                              <AdminRoutes />
                            </AdminProtectedRoute>
                          }
                        />
                        {/* User Routes */}
                        <Route path="/*" element={<AppContent />} />
                      </Routes>
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

// Admin Routes Component
function AdminRoutes() {
  const { logout, user } = useAuth();

  return (
    <AdminProvider>
      <AdminProductProvider>
        <InventoryProvider>
          <SupplierProvider>
            <ProductImageProvider>
              <AdminOrderProvider>
                <VoucherProvider>
                  <AdminLayout onLogout={logout} adminName={user?.user_name}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/users" element={<UserList />} />
                      <Route path="/products" element={<ProductList />} />
                      <Route path="/categories" element={<CategoryPage />} />
                      <Route path="/orders" element={<OrderList />} />
                      <Route
                        path="/orders/:orderId"
                        element={<AdminOrderDetail />}
                      />
                      <Route path="/inventory" element={<InventoryList />} />
                      <Route path="/suppliers" element={<SupplierList />} />
                      <Route
                        path="/product-images"
                        element={<ProductImagePage />}
                      />
                      <Route path="/vouchers" element={<VoucherList />} />
                      <Route
                        path="*"
                        element={<Navigate to="/admin" replace />}
                      />
                    </Routes>
                  </AdminLayout>
                </VoucherProvider>
              </AdminOrderProvider>
            </ProductImageProvider>
          </SupplierProvider>
        </InventoryProvider>
      </AdminProductProvider>
    </AdminProvider>
  );
}
