import { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Text } from "@react-three/drei";
import { useProductContext } from "../context/ProductContext";
import LoadingSpinner from "./LoadingSpinner";
import * as THREE from "three";

// Model component that handles the actual 3D model
const Model = ({ modelPath, showDimensions }) => {
  const { scene: originalScene } = useGLTF(modelPath);
  const modelRef = useRef();
  const [modelDimensions, setModelDimensions] = useState(null);
  const [isAnimating, setAnimating] = useState(false);

  // Center the model and extract dimensions
  useEffect(() => {
    if (!originalScene) return;
    let finalBox = new THREE.Box3();

    const clone = originalScene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.geometry.computeBoundingBox();
        finalBox.union(
          child.geometry.boundingBox.clone().applyMatrix4(child.matrixWorld)
        );
        // child.geometry.computeBoundingSphere();
      }
    });

    if (modelRef.current) {
      modelRef.current.clear(); // Clear prev childrend if any
      modelRef.current.add(clone); // Add new model

      // Apply any necessary transformations to position the model correctly
      modelRef.current.position.set(0, -0.2, 0);
      modelRef.current.rotation.set(0, 0, 0);

      // Wait a frame to let it attach to the scene
      requestAnimationFrame(() => {
        const box = new THREE.Box3().setFromObject(clone);
        const size = new THREE.Vector3();
        console.log("Model size:", size);
        box.getSize(size);
        const dimensionsInCm = {
          width: Math.round(size.x * 100),
          height: Math.round(size.y * 100),
          depth: Math.round(size.z * 100),
        };
        setModelDimensions(dimensionsInCm);
      });

      // Extract dimensions from the model
      // const box = new THREE.Box3().setFromObject(clone);
      // const size = new THREE.Vector3();
      // box.getSize(size);
      // const dimensionsInCm = {
      //   width: Math.round(size.x * 100),
      //   height: Math.round(size.y * 100),
      //   depth: Math.round(size.z * 100),
      // };

      // setModelDimensions(dimensionsInCm);

      // Start rotation animation for a short time
      setAnimating(true);
      setTimeout(() => setAnimating(false), 1000); // 2 seconds animation
    }
  }, [originalScene]);

  useFrame(() => {
    if (isAnimating && modelRef.current) {
      // Rotate the model smoothly
      modelRef.current.rotation.y += 0.04; // Adjust speed as necessary
    }
  });

  return (
    <group ref={modelRef}>
      {/* <primitive object={scene} scale={1} /> */}

      {/* Add dimension lines when showDimensions is true and dimensions are available */}
      {showDimensions && modelDimensions && (
        <group>
          {/* Width dimension line */}
          <DimensionLine
            start={[
              -modelDimensions.width / 200,
              -modelDimensions.height / 200 + 0.3,
              modelDimensions.depth / 200,
            ]}
            end={[
              modelDimensions.width / 200,
              -modelDimensions.height / 200 + 0.3,
              modelDimensions.depth / 200,
            ]}
            color="black"
            label={`${modelDimensions.width}cm`}
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
            label={`${modelDimensions.height}cm`}
          />

          {/* Depth dimension line */}
          <DimensionLine
            start={[
              -modelDimensions.width / 200,
              -modelDimensions.height / 200 + 0.3,
              -modelDimensions.depth / 200,
            ]}
            end={[
              -modelDimensions.width / 200,
              -modelDimensions.height / 200 + 0.3,
              modelDimensions.depth / 200,
            ]}
            color="black"
            label={`${modelDimensions.depth}cm`}
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

  // Create points for the line
  const points = [];
  points.push(new THREE.Vector3(...start));
  points.push(new THREE.Vector3(...end));

  // Create geometry from points
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  // Calculate midpoint for label position
  const midPoint = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ];

  useFrame(() => {
    // Make the label always face the camera
    if (labelRef.current) {
      labelRef.current.lookAt(camera.position);
    }
  });

  return (
    <group>
      {/* Use built-in line with dashed material */}
      <line geometry={lineGeometry}>
        <lineDashedMaterial
          attach="material"
          color={color}
          dashSize={0.05}
          gapSize={0.05}
          linewidth={2}
        />
      </line>

      {/* Label */}
      {label && (
        <group ref={labelRef} position={midPoint}>
          <mesh>
            <planeGeometry args={[0.4, 0.15]} />
            <meshBasicMaterial color="white" transparent opacity={0} />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            color="black"
            fontSize={0.07}
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

  return (
    <div className="absolute top-0 left-0 w-full h-full">
      <Suspense fallback={<LoadingSpinner />}>
        <Canvas
          shadows
          camera={{ position: [0, 0, 3], fov: 50 }}
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
