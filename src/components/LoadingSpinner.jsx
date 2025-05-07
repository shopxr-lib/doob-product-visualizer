import { useProductContext } from "../context/ProductContext";

const LoadingSpinner = () => {
  const { isLoading } = useProductContext();

  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div
        className="w-16 h-16 border-4 border-gray-300 border-dotted duration-500 rounded-full border-t-gray-500"
        style={{ animation: "spin 3s linear infinite" }}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
