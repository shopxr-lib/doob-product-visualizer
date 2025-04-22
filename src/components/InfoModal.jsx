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
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 bg-opacity-50 z-50">
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 h-[80vh] overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={toggleInfoModal}
          className="absolute top-3 right-4 p-2 rounded-full hover:bg-gray-100 cursor-pointer z-10"
        >
          <FaTimes color="#aaaaaa" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto h-full px-6 pt-6 pb-4 flex flex-col items-center text-center space-y-4">
          <h2 className="text-2xl font-semibold mb-4">How to Use?</h2>

          <div className="flex flex-col justify-center items-center">
            <h3 className="font-semibold mb-2 text-lg">
              1. Object Manipulation
            </h3>
            <p className="text-left">
              <span className="font-semibold">Slide: </span>Tap and hold the
              object, then slide your finger across the screen.
            </p>
            <img
              src="https://cdn.shopify.com/s/files/1/0570/3932/3314/files/Tap_and_drag_icon_d711627b-0def-469b-85b6-01bea128833c.png?v=1699207071"
              alt="tap-hold-finger"
              className="max-w-[80%] max-h-[80%] px-[10%] py-3"
            />
          </div>

          <div className="flex flex-col justify-center items-center">
            <h3 className="font-semibold mb-2 text-lg">2. Object Rotation</h3>
            <p className="text-left">
              <span className="font-semibold">Rotate: </span>While one finger is
              tapped on the object, use two fingers to rotate it on the screen.
            </p>
            <img
              src="https://cdn.shopify.com/s/files/1/0570/3932/3314/files/Tap_and_rotate_icon_7e74b253-482a-46ea-9404-77bc36f9b5ed.png?v=1699207072"
              alt="tap-hold-rotate-finger"
              className="max-w-[80%] max-h-[80%] px-[10%] py-3"
            />
          </div>

          <div className="mt-3">
            <h3 className="font-semibold mb-2 text-lg">Side Note</h3>
            <p className="text-left">
              <span className="font-semibold">(a) Optimal Lighting: </span>
              Ensure adequate lighting in the environment for optimal
              performance.
            </p>
            <p className="my-3 text-left">
              <span className="font-semibold">(b) Changing Elevation: </span>
              When transitioning the object between different heights or
              surfaces, continue moving the phone and the object on the screen
              until it successfully recognizes the new height or surface.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
