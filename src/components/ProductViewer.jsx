import { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Text } from "@react-three/drei";
import { useProductContext } from "../context/ProductContext";
import LoadingSpinner from "./LoadingSpinner";
import * as THREE from "three";
import gsap from "gsap";
import "@google/model-viewer";

// Model component that handles the actual 3D model
const Model = ({ modelPath, showDimensions }) => {
  const { scene: originalScene } = useGLTF(modelPath);
  const { dimensionUnit } = useProductContext();
  const modelRef = useRef();
  const [modelDimensions, setModelDimensions] = useState(null);
  const firstLoadRef = useRef(true); // Track if it's first time model loading

  // Center the model and extract dimensions
  useEffect(() => {
    if (!originalScene) return;

    const clone = originalScene.clone(true);
    let finalBox = new THREE.Box3();

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
      if (firstLoadRef.current) {
        gsap.fromTo(
          modelRef.current.scale,
          { x: 0, y: 0, z: 0 },
          {
            x: 1,
            y: 1,
            z: 1,
            duration: 1.5,
            ease: "back.out(1.7)",
          }
        );

        gsap.fromTo(
          modelRef.current.rotation,
          { y: Math.PI },
          { y: 0, duration: 1.5, ease: "power2.out" }
        );

        firstLoadRef.current = false;
      } else {
        // Only rotate the model when a new one is selected
        gsap.fromTo(
          modelRef.current.rotation,
          { y: 0 },
          {
            y: Math.PI * 2,
            duration: 1.2,
            ease: "power1.out",
            onComplete: () => {
              // Face the front toward camera (reset Y)
              modelRef.current.rotation.y = 0;
            },
          }
        );
      }

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
  }, [originalScene]);

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

// Improved DimensionLine component for dimension lines
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

// GLB to USDZ converter using model-viewer's built-in functionality
const convertGlbToUsdz = async (glbUrl) => {
  try {
    // Get or create model-viewer element for conversion
    let converterModelViewer = document.getElementById(
      "converter-model-viewer"
    );
    if (!converterModelViewer) {
      converterModelViewer = document.createElement("model-viewer");
      converterModelViewer.id = "converter-model-viewer";
      converterModelViewer.style.width = "0";
      converterModelViewer.style.height = "0";
      converterModelViewer.style.position = "absolute";
      converterModelViewer.style.opacity = "0";
      converterModelViewer.setAttribute("ar", "");
      converterModelViewer.setAttribute(
        "ar-modes",
        "webxr scene-viewer quick-look"
      );
      document.body.appendChild(converterModelViewer);
    }

    // Set the source to the GLB file
    converterModelViewer.src = glbUrl;

    // Create a promise that resolves when the model loads
    await new Promise((resolve, reject) => {
      const onLoad = () => {
        converterModelViewer.removeEventListener("load", onLoad);
        converterModelViewer.removeEventListener("error", onError);
        clearTimeout(timeoutId);
        resolve();
      };

      const onError = (error) => {
        converterModelViewer.removeEventListener("load", onLoad);
        converterModelViewer.removeEventListener("error", onError);
        clearTimeout(timeoutId);
        reject(new Error(`Failed to load model: ${error}`));
      };

      converterModelViewer.addEventListener("load", onLoad);
      converterModelViewer.addEventListener("error", onError);

      // Set a timeout in case the model never loads
      const timeoutId = setTimeout(() => {
        converterModelViewer.removeEventListener("load", onLoad);
        converterModelViewer.removeEventListener("error", onError);
        reject(new Error("Model loading timed out"));
      }, 15000); // 15 seconds timeout
    });

    // Generate USDZ using model-viewer
    console.log("Model loaded, converting to USDZ...");
    const usdzUrl = await converterModelViewer.exportModel("usdz");
    console.log("USDZ conversion successful:", usdzUrl);

    // Cache the result
    try {
      localStorage.setItem(
        `usdz-cache-${btoa(glbUrl)}`,
        JSON.stringify({
          usdzUrl,
          timestamp: Date.now(),
        })
      );
    } catch (e) {
      console.warn("Failed to cache model in localStorage", e);
    }

    return usdzUrl;
  } catch (error) {
    console.error("Error converting GLB to USDZ:", error);

    // Try to get from cache if available
    try {
      const cachedData = localStorage.getItem(`usdz-cache-${btoa(glbUrl)}`);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        console.log("Using cached USDZ model");
        return parsed.usdzUrl;
      }
    } catch (e) {
      console.warn("Failed to retrieve cached model", e);
    }

    return null;
  }
};

// Check if device is iOS
const isIOS = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

// Main ProductViewer component
const ProductViewer = () => {
  const { getCurrentModelPath, showDimensions, setIsLoading } =
    useProductContext();

  const modelPath = getCurrentModelPath();
  console.log("modelPath:", modelPath);
  const [usdzUrl, setUsdzUrl] = useState(null);

  //* Add model-viewer element for AR
  useEffect(() => {
    const isIOSDevice = isIOS();
    const fullModelPath = `https://doob.shopxr.org${modelPath}`;

    //* Create model-viewer element
    let modelViewerElement = document.querySelector("model-viewer");
    if (!modelViewerElement) {
      modelViewerElement = document.createElement("model-viewer");
      modelViewerElement.id = "ar-model-viewer";
      modelViewerElement.setAttribute("ar", "");
      modelViewerElement.setAttribute(
        "ar-modes",
        "webxr scene-viewer quick-look"
      );
      modelViewerElement.setAttribute("ar-scale", "fixed");
      modelViewerElement.setAttribute("camera-controls", "");
      modelViewerElement.setAttribute("auto-rotate", "false");

      // Attributes to help with AR initialization
      modelViewerElement.setAttribute("seamless-poster", "");
      modelViewerElement.setAttribute("shadow-intensity", "1");
      modelViewerElement.setAttribute("environment-image", "neutral");
      modelViewerElement.setAttribute("ar-placement", "floor");

      // Make sure it's clickable but not visible
      modelViewerElement.style.display = "block";
      modelViewerElement.style.width = "1px";
      modelViewerElement.style.height = "1px";
      modelViewerElement.style.position = "absolute";
      modelViewerElement.style.bottom = "0";
      modelViewerElement.style.right = "0";
      modelViewerElement.style.opacity = "0.01"; // Not fully invisible to ensure clickability
      modelViewerElement.style.pointerEvents = "auto";

      document.body.appendChild(modelViewerElement);

      // Debug event listeners
      modelViewerElement.addEventListener("ar-status", (event) => {
        console.log("AR Status:", event.detail.status);
        if (event.detail.status === "failed") {
          console.error("AR Failed:", event.detail);
        } else if (event.detail.status === "session-started") {
          console.log("AR Session Started");
        }
      });
    }

    // Always update the source when model changes
    modelViewerElement.src = fullModelPath;
    console.log("Setting model-viewer src to:", fullModelPath);

    // For iOS, convert GLB to USDZ on-the-fly using model-viewer's converter
    if (isIOSDevice) {
      // Check local storage first
      const cachedData = localStorage.getItem(
        `usdz-cache-${btoa(fullModelPath)}`
      );

      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          // Check if cache is still valid (not expired)
          const maxAge = 7 * 24 * 60 * 60 * 1000; // 1 week
          if (Date.now() - parsed.timestamp < maxAge) {
            console.log("Using cached USDZ URL:", parsed.usdzUrl);
            setUsdzUrl(parsed.usdzUrl);
            modelViewerElement.setAttribute("ios-src", parsed.usdzUrl);
            return;
          }
        } catch (e) {
          console.warn("Failed to parse cached USDZ data", e);
        }
      }

      // No valid cache, convert on-the-fly
      console.log("iOS device detected, converting GLB to USDZ...");
      convertGlbToUsdz(fullModelPath)
        .then((generatedUsdzUrl) => {
          if (generatedUsdzUrl) {
            console.log("Setting iOS src to generated USDZ:", generatedUsdzUrl);
            setUsdzUrl(generatedUsdzUrl);
            modelViewerElement.setAttribute("ios-src", generatedUsdzUrl);
          } else {
            // Fallback to static USDZ if conversion fails
            const usdzPath = modelPath.replace(".glb", ".usdz");
            console.log("Conversion failed, falling back to static USDZ path");
            modelViewerElement.setAttribute(
              "ios-src",
              `https://doob.shopxr.org${usdzPath}`
            );
          }
        })
        .catch((error) => {
          console.error("USDZ conversion error:", error);
          // Fallback to static USDZ if conversion fails
          const usdzPath = modelPath.replace(".glb", ".usdz");
          modelViewerElement.setAttribute(
            "ios-src",
            `https://doob.shopxr.org${usdzPath}`
          );
        });
    } else {
      // For non-iOS devices, use the static path (if needed)
      const usdzPath = modelPath.replace(".glb", ".usdz");
      modelViewerElement.setAttribute(
        "ios-src",
        `https://doob.shopxr.org${usdzPath}`
      );
    }

    // Handle the AR URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const arMode = urlParams.get("ar");
    if (arMode === "true") {
      console.log("AR URL parameter detected");
      // We'll let the ARButton component handle actual AR activation
      // to ensure the model is fully loaded first
    }

    return () => {};
  }, [modelPath]);

  return (
    <div className="absolute top-0 left-0 w-full h-full">
      <Suspense fallback={<LoadingSpinner />}>
        <Canvas
          shadows
          camera={{ position: [-1.5, 0.6, 3], fov: 40 }}
          onCreated={() => setIsLoading(false)}
          className="w-full h-full"
        >
          {/* Environment light */}
          <Environment preset="apartment" />

          {/* Add some ambient and directional lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

          {/* The 3D model */}
          <Model modelPath={modelPath} showDimensions={showDimensions} />

          {/* Camera controls */}
          <ControlledOrbitControls />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default ProductViewer;
