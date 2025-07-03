import React, { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Text } from "@react-three/drei";
import { useProductContext } from "../context/ProductContext";
import LoadingSpinner from "./LoadingSpinner";
import * as THREE from "three";
import gsap from "gsap";
import "@google/model-viewer";

// To track model-viewer instances
let modelViewerInstance = null;

// FlatErrorText component to render flat 2D text
const FlatErrorText = () => {
  const { camera } = useThree();
  const textRef = useRef();

  useFrame(() => {
    if (textRef.current) {
      textRef.current.lookAt(camera.position); // Ensure text always faces the camera
    }
  });

  return (
    <Text
      ref={textRef}
      position={[0, 0, 0]} // Center the text in the scene
      color="red"
      fontSize={0.08}
      anchorX="center"
      anchorY="middle"
      maxWidth={10} // Prevents stretching
      rotation={[0, 0, 0]} // Reset rotation
    >
      Failed to load model. Please try another model.
    </Text>
  );
};

// ErrorBoundary component to catch and handle errors in the Model component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    // Update state to render fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details to console
    console.error("Error in Model component:", error);
    console.error("Error Info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI: Display error message in 3D scene
      return <FlatErrorText />;
    }

    return this.props.children;
  }
}

// Enhanced cleanup utility
const disposeObject = (obj) => {
  if (!obj) return;

  if (obj.geometry) {
    obj.geometry.dispose();
  }

  if (obj.material) {
    if (Array.isArray(obj.material)) {
      obj.material.forEach((material) => {
        if (material.map) material.map.dispose();
        if (material.normalMap) material.normalMap.dispose();
        if (material.roughnessMap) material.roughnessMap.dispose();
        if (material.metalnessMap) material.metalnessMap.dispose();
        if (material.aoMap) material.aoMap.dispose();
        if (material.emissiveMap) material.emissiveMap.dispose();
        material.dispose();
      });
    } else {
      if (obj.material.map) obj.material.map.dispose();
      if (obj.material.normalMap) obj.material.normalMap.dispose();
      if (obj.material.roughnessMap) obj.material.roughnessMap.dispose();
      if (obj.material.metalnessMap) obj.material.metalnessMap.dispose();
      if (obj.material.aoMap) obj.material.aoMap.dispose();
      if (obj.material.emissiveMap) obj.material.emissiveMap.dispose();
      obj.material.dispose();
    }
  }

  if (obj.children) {
    obj.children.forEach((child) => disposeObject(child));
  }
};

// Model component that handles the actual 3D model
const Model = ({ modelPath, showDimensions }) => {
  const { scene: originalScene } = useGLTF(modelPath);
  const { dimensionUnit, setIsLoading } = useProductContext();
  const modelRef = useRef();
  const [modelDimensions, setModelDimensions] = useState(null);
  const firstLoadRef = useRef(true); // Track if it's first time model loading

  // Center the model and extract dimensions
  useEffect(() => {
    if (!originalScene) return;

    // Signal that model has loaded
    setIsLoading(false);

    const clone = originalScene.clone(true);
    let finalBox = new THREE.Box3();

    // Enhanced cleanup of previous model
    if (modelRef.current && modelRef.current.children.length > 0) {
      modelRef.current.traverse((child) => {
        disposeObject(child);
      });
      modelRef.current.clear();
    }

    clone.traverse((child) => {
      if (child.isMesh && child.visible) {
        child.geometry.computeBoundingBox();
        const box = child.geometry.boundingBox.clone();
        box.applyMatrix4(child.matrixWorld);
        finalBox.union(box);
      }
    });

    if (modelRef.current) {
      modelRef.current.clear(); // Clear prev childrend if any
      modelRef.current.add(clone); // Add new model

      // Apply any necessary transformations to position the model correctly
      modelRef.current.position.set(0, -0.25, 0);
      modelRef.current.rotation.set(0, 0, 0);
      modelRef.current.scale.set(1, 1, 1);

      // Animate appearance (scale + rotation) on first load
      // if (firstLoadRef.current) {
      //   gsap.fromTo(
      //     modelRef.current.scale,
      //     { x: 0, y: 0, z: 0 },
      //     {
      //       x: 1,
      //       y: 1,
      //       z: 1,
      //       duration: 1.5,
      //       ease: "back.out(1.7)",
      //     }
      //   );

      //   gsap.fromTo(
      //     modelRef.current.rotation,
      //     { y: Math.PI },
      //     { y: 0, duration: 1.5, ease: "power2.out" }
      //   );

      //   firstLoadRef.current = false;
      // } else {
      // Only rotate the model when a new one is selected
      //   gsap.fromTo(
      //     modelRef.current.rotation,
      //     { y: 0 },
      //     {
      //       y: Math.PI * -2,
      //       duration: 1.2,
      //       ease: "power1.out",
      //       onComplete: () => {
      // Face the front toward camera (reset Y)
      //         modelRef.current.rotation.y = 0;
      //       },
      //     }
      //   );
      // }

      // Wait a frame to let it attach to the scene
      requestAnimationFrame(() => {
        const size = new THREE.Vector3();
        finalBox.getSize(size);

        const dimensionsInCm = {
          width: (size.x * 100).toFixed(0),
          height: (size.y * 100).toFixed(0),
          depth: (size.z * 100).toFixed(0),
        };

        setModelDimensions(dimensionsInCm);
      });
    }

    // Enhanced cleanup function
    return () => {
      if (modelRef.current) {
        modelRef.current.traverse((child) => {
          disposeObject(child);
        });
        modelRef.current.clear();
      }
    };
  }, [originalScene, setIsLoading]);

  // Convert cm to inches
  const convertToInches = (cm) => {
    return (parseFloat(cm) * 0.393701).toFixed(0);
  };

  // Get the dimension value with the appropriate unit
  const getDimensionValue = (value) => {
    if (dimensionUnit === "inches") {
      return `${convertToInches(value)}in`;
    }
    return `${value}cm`;
  };

  return (
    <group ref={modelRef}>
      {/* Add dimension lines when showDimensions is true and dimensions are available */}
      {showDimensions && modelDimensions && (
        <group>
          {/* Width dimension line */}
          <DimensionLine
            start={[
              -modelDimensions.width / 200,
              -modelDimensions.height / 200 + 0.3,
              modelDimensions.depth / 200 + 0.1,
            ]}
            end={[
              modelDimensions.width / 200,
              -modelDimensions.height / 200 + 0.3,
              modelDimensions.depth / 200 + 0.1,
            ]}
            color="black"
            label={getDimensionValue(modelDimensions.width)}
          />

          {/* Height dimension line */}
          <DimensionLine
            start={[
              -modelDimensions.width / 200,
              -modelDimensions.height / 200 + 0.3,
              -modelDimensions.depth / 200,
            ]}
            end={[
              -modelDimensions.width / 200,
              modelDimensions.height / 200 + 0.3,
              -modelDimensions.depth / 200,
            ]}
            color="black"
            label={getDimensionValue(modelDimensions.height)}
          />

          {/* Depth dimension line */}
          <DimensionLine
            start={[
              -modelDimensions.width / 200,
              -modelDimensions.height / 200 + 0.3,
              -modelDimensions.depth / 200 + 0.05,
            ]}
            end={[
              -modelDimensions.width / 200,
              -modelDimensions.height / 200 + 0.3,
              modelDimensions.depth / 200 + 0.05,
            ]}
            color="black"
            label={getDimensionValue(modelDimensions.depth)}
          />
        </group>
      )}
    </group>
  );
};

// DimensionLine component for dimension lines
const DimensionLine = ({ start, end, color, label }) => {
  const { camera } = useThree();
  const labelRef = useRef();

  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const direction = endVec.clone().sub(startVec).normalize();
  const midPoint = startVec.clone().add(endVec).multiplyScalar(0.6);

  // Main line geometry
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    startVec,
    endVec,
  ]);

  useFrame(() => {
    if (labelRef.current) {
      labelRef.current.lookAt(camera.position);
    }
  });

  // Create perpendicular caps at exact endpoints
  const capLength = 0.02;
  const up = new THREE.Vector3(0, 1, 0);

  // For horizontal lines, we need to adjust our perpendicular direction
  let sideDir;

  // Calculate the appropriate perpendicular direction based on line orientation
  const isVertical = Math.abs(direction.y) > 0.9;
  const isHorizontalX = Math.abs(direction.x) > 0.9;

  if (isVertical) {
    // For vertical lines, use Z axis for perpendicular
    sideDir = new THREE.Vector3(0, 0, 1).normalize();
  } else if (isHorizontalX) {
    // For horizontal lines along X axis, use Y axis for perpendicular
    sideDir = new THREE.Vector3(0, 1, 0).normalize();
  } else {
    // For other lines (like along Z axis), cross with up vector
    sideDir = new THREE.Vector3().crossVectors(direction, up).normalize();
  }

  // Create caps for both endpoints
  const caps = [startVec, endVec].map((point, i) => {
    const capStart = point
      .clone()
      .add(sideDir.clone().multiplyScalar(-capLength / 2));
    const capEnd = point
      .clone()
      .add(sideDir.clone().multiplyScalar(capLength / 2));
    const capGeometry = new THREE.BufferGeometry().setFromPoints([
      capStart,
      capEnd,
    ]);
    return (
      <line key={i} geometry={capGeometry}>
        <lineBasicMaterial attach="material" color={color} />
      </line>
    );
  });

  return (
    <group>
      {/* Full-length dimension line from start to end */}
      <line geometry={lineGeometry}>
        <lineBasicMaterial attach="material" color={color} />
      </line>

      {/* Caps at exact start and end */}
      {caps}

      {/* Label floating in center with invisible background for click blocking */}
      {label && (
        <group ref={labelRef} position={midPoint}>
          <mesh>
            <planeGeometry args={[0.4, 0.15]} />
            <meshBasicMaterial color="white" transparent opacity={0} />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            color={color}
            fontSize={0.04}
            fontWeight="bold"
            anchorX="center"
            anchorY="middle"
          >
            {label}
          </Text>
        </group>
      )}
    </group>
  );
};

// Camera controls with limits
const ControlledOrbitControls = () => {
  return (
    <OrbitControls
      minDistance={1} // Prevent zooming in too close
      maxDistance={5} // Prevent zooming out too far
      enablePan={false} // Disable panning
      enableDamping={true} // Enable smooth camera movement
      dampingFactor={0.1}
      rotateSpeed={0.6}
    />
  );
};

// Main ProductViewer component
const ProductViewer = () => {
  const { getCurrentModelPath, showDimensions, setIsLoading } =
    useProductContext();

  const modelPath = getCurrentModelPath();
  // console.log("modelPath:", modelPath);

  // Compute effectiveModelPath for both canvas and model-viewer
  const [effectiveModelPath, setEffectiveModelPath] = useState(modelPath);
  const [shouldClearURL, setShouldClearURL] = useState(false);

  // Set loading state to true initially when model path changes
  useEffect(() => {
    // Set loading state when model path changes
    setIsLoading(true);

    // Check if the model parameter is present in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const modelParam = urlParams.get("model");
    const arMode = urlParams.get("ar");
    const modelId = urlParams.get("modelId");

    // Log the current state for debugging
    // console.log("Current application state:");
    // console.log("- Current model path:", modelPath);
    // console.log("- AR mode:", arMode === "true" ? "Yes" : "No");
    // console.log("- URL model param:", modelParam || "None");
    // console.log("- URL modelId:", modelId || "None");

    // Use the model from URL parameter if available and we're in AR mode
    let computedEffectiveModelPath = modelPath;
    if (arMode === "true") {
      if (modelParam) {
        try {
          // Decode base64-encoded model path
          computedEffectiveModelPath = atob(decodeURIComponent(modelParam));
          // console.log(
          //   "Using decoded model from URL parameter:",
          //   computedEffectiveModelPath
          // );
        } catch (error) {
          console.error("Error decoding model path:", error);
        }
      } else if (modelId) {
        // Fallback for older sessionStorage-based QR codes
        const storedModelPath = sessionStorage.getItem(`model_${modelId}`);
        if (storedModelPath) {
          computedEffectiveModelPath = storedModelPath;
          // console.log(
          //   "Using model from session storage:",
          //   computedEffectiveModelPath
          // );
        } else {
          console.warn(
            "No model path found in session storage for modelId:",
            modelId
          );
        }
      }
    }

    setEffectiveModelPath(computedEffectiveModelPath);

    // Create a preloader to load the model if it's not in the cache
    useGLTF.preload(computedEffectiveModelPath);

    // Defer URL clearing until model-viewer is loaded
    if (arMode || modelId || modelParam) {
      setShouldClearURL(true);
    }
  }, [modelPath, setIsLoading]);

  //* Add model-viewer element for AR
  // FIXED: Better model-viewer management
  useEffect(() => {
    const isIOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    };

    const isAndroid = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return /Android/.test(userAgent);
    };

    // Clean up existing model-viewer before creating new one
    if (modelViewerInstance && document.body.contains(modelViewerInstance)) {
      // Remove all event listeners first
      const clonedNode = modelViewerInstance.cloneNode(false);
      modelViewerInstance.parentNode.replaceChild(
        clonedNode,
        modelViewerInstance
      );
      modelViewerInstance = null;
    }

    // Create new model-viewer instance
    modelViewerInstance = document.createElement("model-viewer");
    modelViewerInstance.id = "ar-model-viewer";
    document.body.appendChild(modelViewerInstance);

    // Set up model-viewer attributes
    modelViewerInstance.setAttribute("ar", "");
    modelViewerInstance.setAttribute(
      "ar-modes",
      "webxr scene-viewer quick-look"
    );
    modelViewerInstance.setAttribute("ar-scale", "fixed");
    modelViewerInstance.setAttribute("camera-controls", "");
    modelViewerInstance.setAttribute("auto-rotate", "false");
    modelViewerInstance.setAttribute("seamless-poster", "");
    modelViewerInstance.setAttribute("shadow-intensity", "1");
    modelViewerInstance.setAttribute("environment-image", "neutral");
    modelViewerInstance.setAttribute("ar-placement", "floor");

    // Style the model-viewer
    modelViewerInstance.style.display = "block";
    modelViewerInstance.style.width = "1px";
    modelViewerInstance.style.height = "1px";
    modelViewerInstance.style.position = "absolute";
    modelViewerInstance.style.bottom = "0";
    modelViewerInstance.style.right = "0";
    modelViewerInstance.style.opacity = "0.01";
    modelViewerInstance.style.pointerEvents = "auto";

    // Set model paths
    const baseUrl = "https://doob.shopxr.org";
    const fullModelPath = `${baseUrl}${effectiveModelPath}`;
    modelViewerInstance.src = fullModelPath;

    // Handle iOS USDZ
    if (isIOS()) {
      const usdzPath = effectiveModelPath.replace(".glb", ".usdz");
      const fullUsdzPath = `${baseUrl}${usdzPath}`;
      fetch(fullUsdzPath, { method: "HEAD" })
        .then((response) => {
          if (response.ok) {
            modelViewerInstance.setAttribute("ios-src", fullUsdzPath);
          }
        })
        .catch((error) => {
          console.error("Error checking USDZ file:", error);
        });
    }

    // Handle Android return URL
    if (isAndroid()) {
      const returnUrl = window.location.href;
      modelViewerInstance.setAttribute("link", returnUrl);
    }

    // Event listeners
    const handleARStatusChange = (event) => {
      if (
        event.detail.status === "session-ended" ||
        event.detail.status === "not-presenting"
      ) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("ar")) {
          urlParams.delete("ar");
          const newUrl =
            window.location.pathname +
            (urlParams.toString() ? "?" + urlParams.toString() : "");
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    };

    const handleARStatus = (event) => {
      if (event.detail.status === "failed") {
        console.error("AR Failed:", event.detail);
      }
    };

    const handleLoad = () => {
      if (shouldClearURL) {
        const urlParams = new URLSearchParams(window.location.search);
        if (!urlParams.get("ar")) {
          const newUrl = `${window.location.pathname}`;
          window.history.replaceState({}, document.title, newUrl);
          setShouldClearURL(false);
        }
      }
    };

    const handleError = (error) => {
      console.error("Model-viewer error:", error);
    };

    // Add event listeners
    modelViewerInstance.addEventListener("ar-status", handleARStatusChange);
    modelViewerInstance.addEventListener("ar-status", handleARStatus);
    modelViewerInstance.addEventListener("load", handleLoad);
    modelViewerInstance.addEventListener("error", handleError);

    // Cleanup function
    return () => {
      if (modelViewerInstance && document.body.contains(modelViewerInstance)) {
        // Remove event listeners by replacing with clone
        const clonedNode = modelViewerInstance.cloneNode(false);
        modelViewerInstance.parentNode.replaceChild(
          clonedNode,
          modelViewerInstance
        );
        modelViewerInstance = null;
      }
    };
  }, [effectiveModelPath, shouldClearURL]);

  return (
    <div className="absolute top-0 left-0 w-full h-full">
      <Canvas
        shadows
        camera={{ position: [-1.5, 0.6, 3], fov: 40 }}
        className="w-full h-full"
      >
        {/* Environment light */}
        <Environment preset="city" />

        {/* Add some ambient and directional lighting */}
        <ambientLight intensity={0} />
        <directionalLight
          position={[10, 10, 20]}
          intensity={0.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        <directionalLight position={[-1, 0, 1.6]} intensity={1.5} />

        <Suspense fallback={null}>
          {/* The 3D model */}
          <ErrorBoundary>
            <Model
              modelPath={effectiveModelPath}
              showDimensions={showDimensions}
            />
          </ErrorBoundary>
        </Suspense>

        {/* Camera controls */}
        <ControlledOrbitControls />
      </Canvas>

      <LoadingSpinner />
    </div>
  );
};

export default ProductViewer;
