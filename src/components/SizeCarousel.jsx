import { useRef } from "react";
import { useProductContext } from "../context/ProductContext";

const SizeCarousel = () => {
  const { productsData, currentProduct, selectedSize, updateSize } =
    useProductContext();
  const carouselRef = useRef(null);

  const availableSizes = productsData[currentProduct].sizes;

  return (
    <div className="w-full flex justify-center items-center mt-4">
      <div
        ref={carouselRef}
        className="flex space-x-3 overflow-x-auto py-2 px-4 scrollbar-hide"
      >
        {availableSizes.map((size) => (
          <button
            key={size}
            className={`px-5 py-2 rounded-full transition-all cursor-pointer ${
              selectedSize === size
                ? "bg-[#B1DFE0] text-gray-700 font-medium"
                : "bg-gray-100 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => updateSize(size)}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SizeCarousel;
