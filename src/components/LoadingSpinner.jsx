import { useProductContext } from "../context/ProductContext";

const LoadingSpinner = () => {
  const { isLoading } = useProductContext();

  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black"></div>
    </div>
  );
};

export default LoadingSpinner;
