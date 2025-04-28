import { useState, useEffect } from "react";
import { useProductContext } from "../context/ProductContext";
import QRCode from "react-qr-code";

const ARButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { getCurrentModelPath } = useProductContext();

  //* Check if the device is mobile
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const arMode = urlParams.get("ar");

    const checkMobile = () => {
      const userAgent = navigator.userAgent || window.opera;
      const isMobileDevice = /android|iphone|ipad|ipod|windows phone/i.test(
        userAgent.toLowerCase()
      );
      setIsMobile(isMobileDevice);
    };

    checkMobile();

    if (arMode === "true" && isMobile) {
      //* Automatically activate AR when page loads from QR scan
      setTimeout(() => {
        const modelViewer = document.querySelector("model-viewer");
        if (modelViewer) {
          modelViewer.activateAR();
        }
      }, 1000);
    }

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [isMobile]);

  const handleARClick = () => {
    if (isMobile) {
      // On mobile, trigger AR view through model-viewer
      const modelViewer = document.querySelector("model-viewer");
      if (modelViewer) {
        if (modelViewer.canActivateAR) {
          modelViewer.activateAR();
        } else {
          alert("AR is not available on this device or browser.");
        }
      }
    } else {
      // On desktop, show QR code modal
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="w-full flex justify-center">
        <button
          onClick={handleARClick}
          className="flex items-center justify-center px-4 py-2 bg-[#B1DFE0] rounded-md shadow-md hover:bg-[#99e4e5] transition-colors cursor-pointer gap-2"
        >
          <img src="/assets/icons/AR_Icon.png" width={30} alt="" />
          <span className="font-medium text-md">See in your space</span>
        </button>
      </div>

      {/* QR Code Modal for Desktop */}
      {showModal && !isMobile && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4 text-center">
              View in AR
            </h3>
            <p className="mb-4 text-center">
              Scan this QR code with your mobile device to view this product in
              your space
            </p>
            <div className="flex justify-center mb-4">
              <QRCode
                value={`http://192.168.0.103:5173${window.location.pathname}`} // View the AR in local server without deploy
                // value={`${window.location.origin}${window.location.pathname}?ar=true`}
                size={200}
                level="H"
              />
            </div>
            <button
              onClick={closeModal}
              className="w-full py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ARButton;
