import React, { useState } from "react";

interface ProductGalleryProps {
  images: string[];
  mainImage?: string;
  className?: string;
}

export default function ProductGallery({
  images,
  mainImage,
  className,
}: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  const allImages = mainImage
    ? [mainImage, ...images.filter((img) => img !== mainImage)]
    : images;

  return (
    <div className={className}>
      {/* Ảnh chính bo góc nhẹ hơn */}
      <div
        className="bg-gray-100 rounded-xl overflow-hidden mb-6 flex items-center justify-center shadow-lg"
        style={{ height: 520, width: "100%" }}
      >
        <img
          src={allImages[selected]}
          alt="Ảnh sản phẩm"
          className="object-cover w-full h-full transition-all duration-500"
        />
      </div>
      {/* Thumbnail lớn hơn, mờ dần, nằm dưới */}
      <div className="flex justify-center space-x-5">
        {allImages.map((img, idx) => (
          <button
            key={img + idx}
            onClick={() => setSelected(idx)}
            className={`rounded-xl overflow-hidden border-2 transition-all duration-200 bg-white
              ${
                selected === idx
                  ? "border-black opacity-100"
                  : "border-transparent opacity-40 hover:opacity-80"
              }
            `}
            style={{ width: 88, height: 66 }}
            type="button"
          >
            <img
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              className="object-cover w-full h-full"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
