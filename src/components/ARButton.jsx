import { useState, useEffect } from "react";
import { useProductContext } from "../context/ProductContext";
import QRCode from "react-qr-code";

const ARButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isARSupported, setIsARSupported] = useState(false);
  const { getCurrentModelPath } = useProductContext();
  const [hasAttemptedARActivation, setHasAttemptedARActivation] =
    useState(false);

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
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  //* Handle AR activation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const arMode = urlParams.get("ar");

    //* Check if AR is supported
    const checkARSupportAndActivate = () => {
      const modelViewer = document.querySelector("model-viewer");
      if (modelViewer) {
        setIsARSupported(!!modelViewer.canActivateAR);
        console.log("AR supported:", !!modelViewer.canActivateAR);

        if (arMode === "true" && isMobile && !hasAttemptedARActivation) {
          console.log("Attempting to auto-activate AR from URL param");
          setHasAttemptedARActivation(true); // Prevent multiple attempts
          setTimeout(() => {
            try {
              if (!modelViewer.canActivateAR) {
                console.warn("AR not supported on this device");
                return;
              }
              console.log("Triggering AR activation");
              modelViewer.activateAR();
            } catch (error) {
              console.error("Error auto-activating AR:", error);
            }
          }, 2500); // Increased delay to ensure model-viewer is ready
        }
      } else {
        console.warn("model-viewer element not found");
      }
    };

    const handleARStatus = (event) => {
      const status = event.detail.status;
      console.log("AR Status Update:", status);
      if (status === "failed") {
        console.error("AR Failed:", event.detail);
      } else if (status === "session-started") {
        console.log("AR Session Started");
      }
    };

    // Check for model-viewer and set up event listener
    let modelViewerElement = document.querySelector("model-viewer");
    if (modelViewerElement) {
      // Wait for model-viewer to load before checking AR support
      modelViewerElement.addEventListener("load", checkARSupportAndActivate);
      modelViewerElement.addEventListener("ar-status", handleARStatus);
    }

    // Poll for model-viewer if not yet available
    const checkInterval = setInterval(() => {
      modelViewerElement = document.querySelector("model-viewer");
      if (
        modelViewerElement &&
        !modelViewerElement.hasAttribute("data-ar-checked")
      ) {
        modelViewerElement.setAttribute("data-ar-checked", "true");
        modelViewerElement.addEventListener("load", checkARSupportAndActivate);
        modelViewerElement.addEventListener("ar-status", handleARStatus);
        checkARSupportAndActivate();
      }
    }, 500);

    return () => {
      clearInterval(checkInterval);
      if (modelViewerElement) {
        modelViewerElement.removeEventListener(
          "load",
          checkARSupportAndActivate
        );
        modelViewerElement.removeEventListener("ar-status", handleARStatus);
      }
    };
  }, [isMobile, modelPath, hasAttemptedARActivation]);

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

  //* Generate QR code URL with full model path
  const getQRCodeURL = () => {
    const baseURL = `${window.location.origin}${window.location.pathname}`;
    // Encode model path in base64 to obfuscate it
    const encodedModelPath = encodeURIComponent(btoa(modelPath));
    // Include a timestamp to ensure URL is unique and not cached (important!)
    const timestamp = Date.now();
    return `${baseURL}?ar=true&model=${encodedModelPath}&t=${timestamp}`;
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
