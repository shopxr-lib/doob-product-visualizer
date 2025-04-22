import { useState, useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

//* Custom hook to load 3D models
const useModelLoader = (modelPath) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  //* R3F useLoader to load model
  const model = useLoader(
    GLTFLoader,
    modelPath,
    (loader) => {
      loader.setDRACOLoader = () => {};
    },
    (xhr) => {
      //* Loading progress callback
      console.log(`${(xhr.loaded / xhr.total) * 100}% loaded.`);
    }
  );

  useEffect(() => {
    if (model) {
      setIsLoading(false);
    }

    //* cleanup
    return () => {
      setIsLoading(true);
      setError(null);
    };
  }, [model]);

  return { model, isLoading, error };
};

export default useModelLoader;
