import React, { useState } from "react";
import { Search, ShoppingBag, User, Heart, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext.tsx"; // 👈 thêm dòng này

interface HeaderProps {
  user?: {
    name?: string;
    avatar?: string | null; // Cho phép null
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
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth(); // lấy dữ liệu từ context

  const navLinks = [
    { name: "New & Featured", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Blog", path: "/blog" },
  ];

  const handleUserClick = () => {
    if (isAuthenticated) {
      navigate("/profile"); // vào trang profile nếu đã login
    } else {
      navigate("/login"); // nếu chưa đăng nhập thì vào trang login
    }
  };

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
            onClick={() => navigate("/")}
          >
            <img
              src="/assets/img/logo/logo_PantheraShop.png"
              alt="Logo"
              className="w-12 h-12"
            />
          </div>

          <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => navigate(link.path)}
                className="text-sm font-medium hover:text-black"
              >
                {link.name}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2">
              <Search className="w-4 h-4 text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-sm w-32 placeholder-gray-500"
              />
            </div>

            <button className="hidden md:block p-2 hover:bg-gray-100 rounded-full">
              <Heart className="w-5 h-5" />
            </button>

            <button
              className="relative p-2 hover:bg-gray-100 rounded-full"
              onClick={() => navigate("/cart")}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User icon */}
            <div className="relative group">
              <button
                className="p-2 hover:bg-gray-100 rounded-full"
                onClick={handleUserClick}
              >
                <User className="w-5 h-5" />
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
    </header>
  );
}
