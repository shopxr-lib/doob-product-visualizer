import { ProductProvider } from "../context/ProductContext";
import TopBar from "../components/TopBar";
import ProductViewer from "../components/ProductViewer";
import SizeCarousel from "../components/SizeCarousel";
import ARButton from "../components/ARButton";
import ColorDropdown from "../components/ColorDropdown";
import DimensionToggle from "../components/DimensionToggle";
import InfoToggle from "../components/InfoToggle";
import InfoModal from "../components/InfoModal";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import { useEffect } from "react";

const Oomph = () => {
  // Fix for mobile viewport height issues
  useEffect(() => {
    // Set CSS variable for viewport height that accounts for mobile browser UI
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    // Set initial value
    setViewportHeight();

    // Update on resize
    window.addEventListener("resize", setViewportHeight);

    // Clean up
    return () => window.removeEventListener("resize", setViewportHeight);
  }, []);

  return (
    <ProductProvider initialProduct="oomph">
      <div
        className="w-full overflow-hidden relative bg-gray-200"
        style={{ height: "calc(var(--vh, 1vh) * 100)" }}
      >
        {/* Full-screen product viewer */}
        <ProductViewer />

        {/* UI elements layered on top with z-index */}
        <div className="absolute inset-0 flex flex-col pointer-events-none z-10">
          <div className="shrink-0">
            {/* Top bar and its dropdown - keep them together for proper alignment */}
            <div className="relative pointer-events-auto">
              <TopBar />
              <ColorDropdown />
            </div>

            {/* Controls that need pointer events */}
            <div className="absolute top-6 right-3 flex flex-col space-y-4 pointer-events-auto">
              <InfoToggle />
              <DimensionToggle />
            </div>
          </div>

          <div className="flex-grow">
            {/* Modal needs pointer events */}
            <div className="pointer-events-auto">
              <InfoModal />
            </div>
          </div>

          {/* Bottom section elements */}
          <div className="shrink-0 w-full pointer-events-auto">
            <div className="flex flex-col items-center">
              <SizeCarousel />
              <div className="py-2">
                <ARButton />
              </div>
              <Footer />
            </div>
          </div>
        </div>

        <LoadingSpinner />
      </div>
    </ProductProvider>
  );
};

export default Oomph;
