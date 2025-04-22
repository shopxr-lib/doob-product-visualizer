// src/components/InfoToggle.jsx
import { useState } from "react";
import { BsQuestionCircle } from "react-icons/bs";
import { useProductContext } from "../context/ProductContext";

const InfoToggle = () => {
  const { toggleInfoModal } = useProductContext();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="absolute top-4 right-4 z-10 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={toggleInfoModal}
    >
      <div
        className={`flex items-center transition-all duration-300 ${
          isHovered ? "pl-3 pr-2 bg-white rounded-full shadow-md" : ""
        }`}
      >
        {isHovered && (
          <span className="mr-2 whitespace-nowrap">How to use</span>
        )}
        <div className="p-2 bg-white rounded-full shadow-md flex items-center justify-center">
          <BsQuestionCircle size={20} className="text-gray-600" />
        </div>
      </div>
    </div>
  );
};

export default InfoToggle;
