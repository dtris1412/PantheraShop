import React, { useEffect, useState } from "react";
import { Search, ShoppingBag, User, Heart, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/authContext.tsx";
import { useWishlist } from "../contexts/wishlistContext";
import { useCart } from "../contexts/cartContext";
import HeaderSearchPopup from "./HeaderSearchPopup";

interface HeaderProps {
  user?: {
    name?: string;
    avatar?: string | null;
  } | null;
  onLogout?: () => void;
  cartItemCount?: number;
}

export default function Header({
  user,
  onLogout,
  cartItemCount = 0,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const { logout, isAuthenticated } = useAuth();
  const { count } = useWishlist();
  const { cartItemCount: cartCount } = useCart();

  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/", key: "home" },
    { name: "Products", path: "/products", key: "products" },
    { name: "Blog", path: "/blog", key: "blog" },
  ];

  const getKeyFromPath = (pathname: string): string | null => {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/products")) return "products";
    if (pathname.startsWith("/blog")) return "blog";
    if (pathname.startsWith("/wishlist")) return "wish";
    if (pathname.startsWith("/cart")) return "cart";
    if (pathname.startsWith("/profile") || pathname.startsWith("/login"))
      return "user";
    return null;
  };

  // sync selectedKey with current location
  useEffect(() => {
    setSelectedKey(getKeyFromPath(location.pathname));
  }, [location.pathname]);

  const handleNavClick = (linkKey: string, path: string) => {
    setSelectedKey(linkKey);
    setIsMenuOpen(false);
    navigate(path);
  };

  const handleIconClick = (iconKey: string, path: string) => {
    setSelectedKey(iconKey);
    navigate(path);
  };

  const handleUserClick = () => {
    if (isAuthenticated) {
      handleIconClick("user", "/profile");
    } else {
      handleIconClick("user", "/login");
    }
  };

  // Animation for search bar and popup
  // Focus input when popup opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        const input = document.getElementById("search-popup-input");
        input?.focus();
      }, 250);
    }
  }, [searchOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          <div
            className="flex items-center cursor-pointer"
            onClick={() => handleNavClick("home", "/")}
          >
            <img
              src="/assets/img/logo/logo_PantheraShop.png"
              alt="Logo"
              className="w-20 h-20"
            />
          </div>

          <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
            {navLinks.map((link) => {
              const active = selectedKey === link.key;
              return (
                <button
                  key={link.key}
                  onClick={() => handleNavClick(link.key, link.path)}
                  className={`relative text-sm font-medium hover:text-black pb-2 transition-colors ${
                    active ? "text-black" : "text-gray-600"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {link.name}
                  <span
                    className={`absolute left-0 right-0 bottom-0 h-[2px] bg-black transform transition-transform duration-300 ease-out origin-left ${
                      active ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-6">
            <div
              className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 cursor-pointer transition-all duration-300"
              onClick={() => setSearchOpen(true)}
              style={{
                boxShadow: searchOpen
                  ? "0 2px 8px rgba(0,0,0,0.08)"
                  : undefined,
              }}
            >
              <Search className="w-4 h-4 text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                readOnly // prevent typing here, use popup
                className="bg-transparent outline-none text-sm w-32 placeholder-gray-500 cursor-pointer"
              />
            </div>

            <button
              className="hidden md:inline-flex p-2 rounded-full"
              onClick={() => handleIconClick("wish", "/wishlist")}
              aria-pressed={selectedKey === "wish"}
            >
              <span
                className={`flex items-center justify-center w-9 h-9 rounded-full
      transition-all transition-transform transition-colors duration-300 ease-in-out
      ${
        selectedKey === "wish"
          ? "bg-black scale-110"
          : "bg-transparent scale-100"
      }
    `}
              >
                <Heart
                  className={`w-5 h-5 transition-colors duration-300 ease-in-out
        ${selectedKey === "wish" ? "text-white" : "text-gray-600"}
      `}
                />

                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {count}
                  </span>
                )}
              </span>
            </button>

            <button
              className="relative p-2 rounded-full"
              onClick={() => handleIconClick("cart", "/cart")}
              aria-pressed={selectedKey === "cart"}
            >
              <span
                className={`flex items-center justify-center w-9 h-9 rounded-full
      transition-all transition-transform transition-colors duration-300 ease-in-out
      ${
        selectedKey === "cart"
          ? "bg-black scale-110"
          : "bg-transparent scale-100"
      }
    `}
              >
                <ShoppingBag
                  className={`w-5 h-5 transition-colors duration-300 ease-in-out
        ${selectedKey === "cart" ? "text-white" : "text-gray-600"}
      `}
                />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </span>
            </button>

            <div className="relative group">
              <button
                className="p-2 rounded-full"
                onClick={handleUserClick}
                aria-pressed={selectedKey === "user"}
              >
                <span
                  className={`flex items-center justify-center w-9 h-9 rounded-full
        transition-all transition-transform transition-colors duration-300 ease-in-out
        ${
          selectedKey === "user"
            ? "bg-black scale-110"
            : "bg-transparent scale-100"
        }
      `}
                >
                  <User
                    className={`w-5 h-5 transition-colors duration-300 ease-in-out
          ${selectedKey === "user" ? "text-white" : "text-gray-600"}
        `}
                  />
                </span>
              </button>

              {isAuthenticated && (
                <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-md py-2 hidden group-hover:block">
                  <p className="px-4 py-2 text-sm text-gray-700">
                    {user?.name}
                  </p>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <HeaderSearchPopup
        open={searchOpen}
        value={searchQuery}
        onChange={setSearchQuery}
        onClose={() => setSearchOpen(false)}
      />
    </header>
  );
}
