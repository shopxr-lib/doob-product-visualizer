// src/pages/Toonacan.jsx
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

const Toonacan = () => {
  return (
    <ProductProvider initialProduct="toonacan">
      <div className="h-screen w-full overflow-hidden relative bg-gray-200">
        {/* Full-screen product viewer */}
        <ProductViewer />

        {/* UI elements layered on top with z-index */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
          {/* Top bar and its dropdown - keep them together for proper alignment */}
          <div className="relative pointer-events-auto">
            <TopBar />
            <ColorDropdown />
          </div>

          {/* Controls that need pointer events */}
          <div className="absolute top-6 right-6 flex flex-col space-y-4 pointer-events-auto">
            <InfoToggle />
            <DimensionToggle />
          </div>

          {/* Modal needs pointer events */}
          <div className="pointer-events-auto">
            <InfoModal />
          </div>

          {/* Bottom section elements */}
          <div className="absolute bottom-0 left-0 w-full pointer-events-auto">
            <div className="flex flex-col items-center pb-3">
              <SizeCarousel />
              <div className="flex items-center justify-center mt-2">
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

export default Toonacan;
