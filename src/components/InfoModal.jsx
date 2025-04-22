// src/components/InfoModal.jsx (continued)
import { useRef, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { useProductContext } from "../context/ProductContext";

const InfoModal = () => {
  const { showInfoModal, toggleInfoModal } = useProductContext();
  const modalRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        if (showInfoModal) toggleInfoModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showInfoModal, toggleInfoModal]);

  if (!showInfoModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">How to Use</h2>
          <button
            onClick={toggleInfoModal}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FaTimes />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">View the Product</h3>
            <p>
              Click and drag to rotate the 3D model. Use the scroll wheel to
              zoom in and out.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Change Size</h3>
            <p>
              Select from the available sizes below the product visualization.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Change Color</h3>
            <p>
              Click on the top bar to select from available colors for the
              current size.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">View Dimensions</h3>
            <p>
              Click the ruler icon in the top right to view product dimensions.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">AR View</h3>
            <p>
              Click "See in your space" to view the product in augmented reality
              (if your device supports it).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
