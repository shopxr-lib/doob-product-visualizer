import { useState, useEffect } from "react";
import { useProductContext } from "../context/ProductContext";
import QRCode from "react-qr-code";

const ARButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isARSupported, setIsARSupported] = useState(false);
  const { getCurrentModelPath } = useProductContext();

  const modelPath = getCurrentModelPath();
  const modelName = modelPath.split("/").pop();
  console.log("model path ar button", modelPath);

  //* Check if the device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || window.opera;
      const isMobileDevice = /android|iphone|ipad|ipod|windows phone/i.test(
        userAgent.toLowerCase()
      );
      setIsMobile(isMobileDevice);
    };

    checkMobile();

    //* Check for URL parameters on component mount
    const urlParams = new URLSearchParams(window.location.search);
    const arMode = urlParams.get("ar");
    const modelParam = urlParams.get("model");

    // Check if AR is supported
    const checkARSupport = () => {
      const modelViewer = document.querySelector("model-viewer");
      if (modelViewer) {
        setIsARSupported(!!modelViewer.canActivateAR);
        console.log("AR supported:", !!modelViewer.canActivateAR);

        // Automatically trigger AR if URL parameter is present
        if (arMode === "true" && isMobile) {
          console.log("Auto-activating AR from URL param");
          setTimeout(() => {
            try {
              modelViewer.activateAR();
            } catch (error) {
              console.error("Error auto-activating AR:", error);
            }
          }, 1500);
        }
      }
    };

    // Check for model-viewer and set up event listener
    const modelViewerElement = document.querySelector("model-viewer");
    if (modelViewerElement) {
      // Wait for model-viewer to load before checking AR support
      modelViewerElement.addEventListener("load", checkARSupport);
    }

    // Set up interval to check for model-viewer in case it's not loaded yet
    const checkInterval = setInterval(() => {
      const modelViewer = document.querySelector("model-viewer");
      if (modelViewer && !modelViewer.hasAttribute("data-ar-checked")) {
        clearInterval(checkInterval);
        modelViewer.setAttribute("data-ar-checked", "true");
        checkARSupport();
      }
    }, 500);

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
      clearInterval(checkInterval);

      // Clean up event listener
      if (modelViewerElement) {
        modelViewerElement.removeEventListener("load", checkARSupport);
      }
    };
  }, [isMobile]);

  const handleARClick = () => {
    if (isMobile) {
      // On mobile, trigger AR view through model-viewer
      const modelViewer = document.querySelector("model-viewer");
      if (modelViewer) {
        console.log("Activating AR via button click");
        try {
          // Force a small delay before activating AR
          setTimeout(() => {
            modelViewer.activateAR();
          }, 300);
        } catch (error) {
          console.error("Error activating AR:", error);
          alert("Error activating AR. Please try again.");
        }
      } else {
        console.error("Model viewer element not found");
        alert("AR viewer not ready. Please try again in a moment.");
      }
    } else {
      // On desktop, show QR code modal
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  //* Generate QR code URL with model parameter
  const getQRCodeURL = () => {
    const baseURL = `${window.location.origin}${window.location.pathname}`;
    // Add both ar=true and the current model name as URL parameters
    return `${baseURL}?ar=true&model=${encodeURIComponent(modelPath)}`;
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
              View in AR Mode
            </h3>
            <p className="mb-4 text-center">
              Scan this QR code with your mobile device to view this product in
              your space
            </p>
            <div className="flex justify-center mb-4">
              <QRCode
                // value={`http://192.168.0.103:5173${window.location.pathname}`} // View the AR in local server without deploy
                value={getQRCodeURL()}
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
