import { createContext, useState, useContext, useEffect } from "react";
import productsData from "../data/productsData";

//* Creating Context
const ProductContext = createContext();

//* Creating Context Provider
export const ProductProvider = ({ children, initialProduct = "plop" }) => {
  //* Getting the product data based on initial product
  const productInfo = productsData[initialProduct];

  //* Set initial states
  const [currentProduct, setCurrentProduct] = useState(initialProduct);
  const [selectedSize, setSelectedSize] = useState(productInfo.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(
    productInfo.colors[productInfo.sizes[0]][0]
  );

  const [showDimensions, setShowDimensions] = useState(false);
  const [dimensionUnit, setDimensionUnit] = useState("cm");
  const [isLoading, setIsLoading] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  //* Initialize state from URL parameters if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const modelParam = urlParams.get("model");
    const arMode = urlParams.get("ar");

    if (arMode === "true" && modelParam) {
      try {
        // Decode base64-encoded model path
        const modelPath = atob(decodeURIComponent(modelParam));

        // Find matching product, size, and color by iterating through productsData
        let foundProductId = null;
        let foundSize = null;
        let foundColor = null;

        Object.entries(productsData).forEach(([productId, product]) => {
          Object.entries(product.colors).forEach(([size, colors]) => {
            colors.forEach((color) => {
              const generatedPath = product.getModelPath(size, color);
              if (generatedPath === modelPath) {
                foundProductId = productId;
                foundSize = size;
                foundColor = color;
              }
            });
          });
        });

        if (foundProductId && foundSize && foundColor) {
          setCurrentProduct(foundProductId);
          setSelectedSize(foundSize);
          setSelectedColor(foundColor);
        } else {
          console.warn(
            "Could not match modelPath to product, size, or color:",
            modelPath
          );
        }
      } catch (error) {
        console.error("Error decoding model path from URL:", error);
      }
    }
  }, []);

  //* Function to update the product
  const updateProduct = (productId) => {
    const newProductInfo = productsData[productId];
    setCurrentProduct(productId);
    setSelectedSize(productInfo.sizes[0]);
    setSelectedColor(productInfo.colors[productInfo.sizes[0]][0]);
    setShowDimensions(false);
  };

  //* Function to update the size
  const updateSize = (size) => {
    setSelectedSize(size);
    //* Make sure the color is available for this size
    const availableColors = productsData[currentProduct].colors[size];
    if (!availableColors.includes(selectedColor)) {
      setSelectedColor(availableColors[0]);
    }
  };

  //* Function to update color
  const updateColor = (color) => {
    setSelectedColor(color);
  };

  useEffect(() => {
    setShowDimensions(false);
  }, [currentProduct, selectedSize, selectedColor]);

  //* Function to show/hide color dropdown
  const toggleColorDropdown = () => {
    setShowColorDropdown((prev) => !prev);
  };

  //* Function to show/hide info modal
  const toggleInfoModal = () => {
    setShowInfoModal((prev) => !prev);
  };

  //* Get current model path
  const getCurrentModelPath = () => {
    return productsData[currentProduct].getModelPath(
      selectedSize,
      selectedColor
    );
  };

  //* Get current dimensions
  const getCurrentDimensions = () => {
    return productsData[currentProduct].dimensions[selectedSize];
  };

  //* Context Values
  const value = {
    productsData,
    currentProduct,
    selectedSize,
    selectedColor,
    showDimensions,
    setShowDimensions,
    dimensionUnit,
    setDimensionUnit,
    isLoading,
    showColorDropdown,
    showInfoModal,
    updateProduct,
    updateSize,
    updateColor,
    setIsLoading,
    toggleColorDropdown,
    toggleInfoModal,
    getCurrentDimensions,
    getCurrentModelPath,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};

//* Custom hook to use the product context
export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return context;
};
