import { Search, ShoppingBag, User, Heart, Menu, X } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  cartItemCount?: number;
}

export default function Header({
  onNavigate,
  currentPage,
  cartItemCount = 0,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navLinks = [
    { name: "New & Featured", page: "home" },
    { name: "Men", page: "products", filter: "men" },
    { name: "Women", page: "products", filter: "women" },
    { name: "Kids", page: "products", filter: "kids" },
    { name: "Sale", page: "products", filter: "sale" },
    { name: "Blog", page: "blog" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-200">
      {/* <div className="bg-gray-100 py-2 px-6 text-right text-xs">
        <span className="text-gray-700">Free shipping on orders over $150</span>
      </div> */}

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
            onClick={() => onNavigate("home")}
          >
            <div className="w-12 h-12  flex items-center justify-center">
              {/* <span className="text-white font-bold text-xl">
               
              </span> */}
              <img src="/assets/img/logo/logo_PantheraShop.png" alt="" />
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => onNavigate(link.page)}
                className={`text-sm font-medium transition-colors hover:text-black ${
                  currentPage === link.page
                    ? "text-black border-b-2 border-black"
                    : "text-gray-600"
                }`}
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

            <button className="hidden md:block p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Heart className="w-5 h-5" />
            </button>

            <button
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => onNavigate("cart")}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>

            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => onNavigate("login")}
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 py-4">
          <nav className="flex flex-col space-y-4 px-6">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  onNavigate(link.page);
                  setIsMenuOpen(false);
                }}
                className={`text-left text-base font-medium transition-colors ${
                  currentPage === link.page ? "text-black" : "text-gray-600"
                }`}
              >
                {link.name}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
