import { useState } from 'react';
import { ShoppingBag, Heart, Truck, RotateCcw, Shield } from 'lucide-react';

interface ProductDetailsProps {
  productId: string;
  onNavigate: (page: string) => void;
  onAddToCart?: (item: any) => void;
}

export default function ProductDetails({ productId, onNavigate, onAddToCart }: ProductDetailsProps) {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = {
    id: productId,
    name: 'Air Max Performance Running Shoes',
    price: 179.99,
    discountPrice: 149.99,
    category: 'Running',
    description: 'Experience ultimate comfort and performance with our flagship running shoes. Engineered with advanced cushioning technology and breathable materials, these shoes are designed to help you reach your peak performance. The lightweight construction and responsive midsole provide exceptional energy return with every stride.',
    images: [
      'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1407354/pexels-photo-1407354.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/2529147/pexels-photo-2529147.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
    sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
    colors: [
      { name: 'Black/White', hex: '#000000' },
      { name: 'Navy/Blue', hex: '#1e3a8a' },
      { name: 'Red/Black', hex: '#dc2626' },
      { name: 'White/Gray', hex: '#ffffff' },
    ],
    features: [
      'Advanced cushioning technology',
      'Breathable mesh upper',
      'Durable rubber outsole',
      'Lightweight construction',
      'Enhanced energy return',
    ],
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      size: selectedSize,
      color: product.colors[selectedColor].name,
      image: product.images[0],
      quantity: 1,
    };

    if (onAddToCart) {
      onAddToCart(cartItem);
    }

    alert('Added to cart!');
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="bg-gray-100 aspect-square overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`bg-gray-100 aspect-square overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-black' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 uppercase tracking-wider mb-2">{product.category}</p>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>

              <div className="flex items-center space-x-3">
                {product.discountPrice ? (
                  <>
                    <span className="text-3xl font-bold">${product.discountPrice.toFixed(2)}</span>
                    <span className="text-xl text-gray-500 line-through">${product.price.toFixed(2)}</span>
                    <span className="bg-black text-white text-sm font-semibold px-3 py-1">
                      Save ${(product.price - product.discountPrice).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
                )}
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Select Color</span>
                <span className="text-sm text-gray-600">{product.colors[selectedColor].name}</span>
              </div>
              <div className="flex space-x-3">
                {product.colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(index)}
                    className={`w-12 h-12 border-2 transition-colors ${
                      selectedColor === index ? 'border-black' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <span className="font-semibold block mb-3">Select Size</span>
              <div className="grid grid-cols-3 gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-center border-2 font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-black text-white py-4 font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
              <button className="w-14 h-14 border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h3 className="font-semibold text-lg">Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-black rounded-full mt-2" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-start space-x-4">
                <Truck className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Free Shipping</h4>
                  <p className="text-sm text-gray-600">Free standard shipping on orders over $150</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <RotateCcw className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Easy Returns</h4>
                  <p className="text-sm text-gray-600">60-day return policy for unworn items</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Shield className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">2-Year Warranty</h4>
                  <p className="text-sm text-gray-600">Manufacturer warranty included</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
