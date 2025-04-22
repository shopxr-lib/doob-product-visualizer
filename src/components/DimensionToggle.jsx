// src/components/DimensionToggle.jsx
import { useState } from "react";
import { BsRulers } from "react-icons/bs";
import { useProductContext } from "../context/ProductContext";

const DimensionToggle = () => {
  const { toggleDimensions, showDimensions } = useProductContext();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="absolute top-24 right-4 z-10 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={toggleDimensions}
    >
      <div
        className={`flex items-center transition-all duration-300 ${
          isHovered ? "pl-3 pr-2 bg-white rounded-full shadow-md" : ""
        }`}
      >
        {isHovered && (
          <span className="mr-2 whitespace-nowrap">Show Dimensions</span>
        )}
        <div
          className={`p-2 rounded-full ${
            showDimensions ? "bg-gray-200" : "bg-white"
          } shadow-md flex items-center justify-center`}
        >
          <BsRulers
            size={20}
            className={showDimensions ? "text-blue-500" : "text-gray-600"}
          />
        </div>
      </div>
    </div>
  );
};

export default DimensionToggle;
