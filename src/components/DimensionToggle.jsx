// src/components/DimensionToggle.jsx
import { useState, useRef, useEffect } from "react";
import { BsRulers } from "react-icons/bs";
import { useProductContext } from "../context/ProductContext";

const DimensionToggle = () => {
  const { showDimensions, setShowDimensions, dimensionUnit, setDimensionUnit } =
    useProductContext();
  const [isHovered, setIsHovered] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleClick = (e) => {
    setShowDropdown(!showDropdown);
  };

  const handleUnitClick = (unit) => {
    if (dimensionUnit !== unit) {
      // If changing units, update unit and ensure dimensions are shown
      setDimensionUnit(unit);
      setShowDimensions(true);
    } else {
      // If clicking the same unit, toggle dimensions on/off
      const newShowDimensions = !showDimensions;
      setShowDimensions(newShowDimensions);

      // Reset hover state when turning off dimensions
      if (!newShowDimensions) {
        setIsHovered(false);
      }
    }
    // Close the dropdown
    setShowDropdown(false);
  };

  return (
    <div
      className="absolute top-18 right-4 z-10 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={dropdownRef}
    >
      <div className="relative">
        <div
          className={`flex items-center transition-all duration-300 ${
            isHovered ? "pl-3 pr-2 bg-white rounded-full shadow-md" : ""
          }`}
          onClick={handleToggleClick}
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

        {/* Unit Dropdown */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-24 bg-white shadow-lg rounded-md overflow-hidden transition-all duration-300 origin-top-right z-20">
            <div className="py-1">
              <button
                className={`block w-full text-left px-4 py-2 text-sm ${
                  dimensionUnit === "cm" && showDimensions
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => handleUnitClick("cm")}
              >
                cm
              </button>
              <button
                className={`block w-full text-left px-4 py-2 text-sm ${
                  dimensionUnit === "inches" && showDimensions
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => handleUnitClick("inches")}
              >
                inches
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DimensionToggle;
