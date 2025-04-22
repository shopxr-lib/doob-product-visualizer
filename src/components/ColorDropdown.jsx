import { useRef, useEffect } from "react";
import { useProductContext } from "../context/ProductContext";

// Helper function to get color hex code (for display purposes)
const getColorHex = (colorName) => {
  const colorMap = {
    "Wine Red": "#722F37",
    "Chili Red": "#C41E3A",
    "Apple Green": "#8DB600",
    "Caribbean Blue": "#00C4D0",
    "Candy Pink": "#E4717A",
    "Apricot Crush": "#FB8A8A",
    "Pewter Blue": "#8BA8B7",
    "Sage Green": "#B2AC88",
    "Chalk Violet": "#7D6B7D",
    "Winter Wheat": "#F5DEB3",
    "Ash Grey": "#B2BEB5",
    "Jet Black": "#343434",
    "Beach Sand": "#E0CDA9",
    Driftwood: "#A89A7C",
    Seashell: "#FFF5EE",
    "Tidal Blue": "#007BA7",
    Seagrass: "#83A686",
  };

  return colorMap[colorName] || "#CCCCCC";
};

const ColorDropdown = () => {
  const {
    productsData,
    currentProduct,
    selectedSize,
    selectedColor,
    showColorDropdown,
    updateColor,
    toggleColorDropdown,
  } = useProductContext();

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (showColorDropdown) toggleColorDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColorDropdown, toggleColorDropdown]);

  if (!showColorDropdown) return null;

  const availableColors = productsData[currentProduct].colors[selectedSize];

  return (
    <div
      ref={dropdownRef}
      className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20 bg-white rounded-lg shadow-lg w-72 max-h-80 overflow-y-auto"
    >
      <div className="p-2">
        {availableColors.map((color) => (
          <div
            key={color}
            className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-full ${
              selectedColor === color ? "bg-gray-100" : ""
            }`}
            onClick={() => {
              updateColor(color);
              toggleColorDropdown();
            }}
          >
            <div
              className="w-6 h-6 rounded-full mr-3"
              style={{ backgroundColor: getColorHex(color) }}
            ></div>
            <span className="text-gray-800">{color}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorDropdown;
