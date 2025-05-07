import { useProductContext } from "../context/ProductContext";
import "./LoadingSpinner.css";

const LoadingSpinner = () => {
  const { isLoading } = useProductContext();

  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-transparent pointer-events-auto">
      <div className="absolute inset-0 bg-white opacity-20"></div>
      <div className="w-16 h-16 border-4 border-gray-300 border-dotted rounded-full slow-spin border-t-gray-500 z-50"></div>
    </div>
  );
};

export default LoadingSpinner;
