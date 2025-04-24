import { FaChevronDown } from "react-icons/fa";
import { useProductContext } from "../context/ProductContext";

const TopBar = () => {
  const { productsData, currentProduct, selectedColor, toggleColorDropdown } =
    useProductContext();

  return (
    <div
      className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 cursor-pointer"
      onClick={toggleColorDropdown}
    >
      <div className="flex items-center px-6 sm:px-10 md:px-16 lg:px-20 py-2 bg-[#B1DFE0] rounded-full shadow-md">
        <span className="font-medium text-gray-800 text-sm sm:text-base">
          {productsData[currentProduct].name} / {selectedColor}
        </span>
        <FaChevronDown className="ml-2 sm:ml-4 text-gray-600 text-xs sm:text-sm" />
      </div>
    </div>
  );
};

export default TopBar;
