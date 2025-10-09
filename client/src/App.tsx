import { useState } from "react";
import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";
import Home from "./pages/Home";
import Products from "./pages/Products.tsx";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Blog from "./pages/Blog";
import Login from "./pages/Login";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [cartItemCount, setCartItemCount] = useState(2);

  const handleNavigate = (page: string, productId?: string) => {
    setCurrentPage(page);
    if (productId) {
      setSelectedProductId(productId);
    }
    window.scrollTo(0, 0);
  };

  const handleAddToCart = (item: any) => {
    setCartItemCount((prev) => prev + 1);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home onNavigate={handleNavigate} />;
      case "products":
        return <Products onNavigate={handleNavigate} />;
      case "product-details":
        return (
          <ProductDetails
            productId={selectedProductId}
            onNavigate={handleNavigate}
            onAddToCart={handleAddToCart}
          />
        );
      case "cart":
        return <Cart onNavigate={handleNavigate} />;
      case "orders":
        return <Orders onNavigate={handleNavigate} />;
      case "blog":
        return <Blog onNavigate={handleNavigate} />;
      case "login":
        return <Login onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onNavigate={handleNavigate}
        currentPage={currentPage}
        cartItemCount={cartItemCount}
      />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
    </div>
  );
}

export default App;
