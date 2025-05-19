import { useRef, useEffect } from "react";
import { useProductContext } from "../context/ProductContext";

// Helper function to get color hex code (for display purposes)
const getColorHex = (colorName) => {
  const colorMap = {
    "Wine Red": "#901D2A",
    "Chili Red": "#DB3518",
    "Apple Green": "#C1E603",
    "Caribbean Blue": "#01CBFB",
    "Candy Pink": "#F145A7",
    "Apricot Crush": "#F4A26B",
    "Pewter Blue": "#88AEBE",
    "Sage Green": "#AAB7A6",
    "Chalk Violet": "#9785AC",
    "Winter Wheat": "#EFDFC2",
    "Ash Grey": "#7D7978",
    "Jet Black": "#272727",
    "Beach Sand": "#DBCBB1",
    Driftwood: "#88857B",
    Seashell: "#BDBDBD",
    "Tidal Blue": "#264357",
    Seagrass: "#535943",
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
