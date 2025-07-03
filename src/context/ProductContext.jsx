import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import productsData from "../data/productsData";
import { debounce } from "lodash";
import { useGLTF } from "@react-three/drei";

// Memory management utilities
const memoryManager = {
  // Track loaded models
  loadedModels: new Set(),

  // Clear unused models from cache
  clearUnusedModels: (currentModelPath) => {
    // Get all cached models
    const cache = useGLTF.cache;

    // Clear models that aren't the current one
    for (const [path, model] of cache.entries()) {
      if (path !== currentModelPath) {
        // Dispose of the model
        if (model && model.scene) {
          model.scene.traverse((child) => {
            if (child.isMesh) {
              if (child.geometry) child.geometry.dispose();
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach((mat) => {
                    if (mat.map) mat.map.dispose();
                    if (mat.normalMap) mat.normalMap.dispose();
                    if (mat.roughnessMap) mat.roughnessMap.dispose();
                    if (mat.metalnessMap) mat.metalnessMap.dispose();
                    if (mat.aoMap) mat.aoMap.dispose();
                    if (mat.emissiveMap) mat.emissiveMap.dispose();
                    mat.dispose();
                  });
                } else {
                  if (child.material.map) child.material.map.dispose();
                  if (child.material.normalMap)
                    child.material.normalMap.dispose();
                  if (child.material.roughnessMap)
                    child.material.roughnessMap.dispose();
                  if (child.material.metalnessMap)
                    child.material.metalnessMap.dispose();
                  if (child.material.aoMap) child.material.aoMap.dispose();
                  if (child.material.emissiveMap)
                    child.material.emissiveMap.dispose();
                  child.material.dispose();
                }
              }
            }
          });
        }

        // Remove from cache
        cache.delete(path);
        memoryManager.loadedModels.delete(path);
      }
    }

    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  },

  // Preload next likely models (adjacent colors)
  preloadAdjacentModels: (currentProduct, currentSize, currentColor) => {
    const product = productsData[currentProduct];
    const colors = product.colors[currentSize];
    const currentIndex = colors.indexOf(currentColor);

    // Preload previous and next colors
    const adjacentColors = [];
    if (currentIndex > 0) adjacentColors.push(colors[currentIndex - 1]);
    if (currentIndex < colors.length - 1)
      adjacentColors.push(colors[currentIndex + 1]);

    // Preload adjacent models
    adjacentColors.forEach((color) => {
      const modelPath = product.getModelPath(currentSize, color);
      if (!memoryManager.loadedModels.has(modelPath)) {
        useGLTF.preload(modelPath);
        memoryManager.loadedModels.add(modelPath);
      }
    });
  },
};

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
  const updateProduct = useCallback((productId) => {
    const newProductInfo = productsData[productId];
    setCurrentProduct(productId);
    setSelectedSize(newProductInfo.sizes[0]);
    setSelectedColor(newProductInfo.colors[newProductInfo.sizes[0]][0]);
    setShowDimensions(false);

    // Clear cache when switching products
    const newModelPath = newProductInfo.getModelPath(
      newProductInfo.sizes[0],
      newProductInfo.colors[newProductInfo.sizes[0]][0]
    );
    memoryManager.clearUnusedModels(newModelPath);
  }, []);

  //* Function to update the size
  const updateSize = useCallback(
    (size) => {
      setSelectedSize(size);
      const availableColors = productsData[currentProduct].colors[size];
      if (!availableColors.includes(selectedColor)) {
        setSelectedColor(availableColors[0]);
      }

      // Clear cache when switching sizes
      const newModelPath = productsData[currentProduct].getModelPath(
        size,
        selectedColor
      );
      memoryManager.clearUnusedModels(newModelPath);
    },
    [currentProduct, selectedColor]
  );

  //* Enhanced color update function with memory management
  const updateColor = useCallback(
    debounce((color) => {
      setSelectedColor(color);

      // Memory management for iOS
      const currentModelPath = productsData[currentProduct].getModelPath(
        selectedSize,
        color
      );

      // Clear unused models from cache (keep only current and adjacent)
      memoryManager.clearUnusedModels(currentModelPath);

      // Preload adjacent colors for smoother experience
      setTimeout(() => {
        memoryManager.preloadAdjacentModels(
          currentProduct,
          selectedSize,
          color
        );
      }, 1000);
    }, 500), // Increased debounce time for iOS
    [currentProduct, selectedSize]
  );

  // Ensure the debounced function is cleaned up
  useEffect(() => {
    return () => {
      updateColor.cancel();
    };
  }, [updateColor]);

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

  // Memory cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all models from cache when component unmounts
      const cache = useGLTF.cache;
      cache.clear();
      memoryManager.loadedModels.clear();
    };
  }, []);

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
