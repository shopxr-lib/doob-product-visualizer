import { FaCube } from "react-icons/fa";

const ARButton = () => {
  return (
    <div className="w-full flex justify-center mt-4">
      <button className="flex items-center justify-center px-6 py-3 bg-[#B1DFE0] rounded-md shadow-md hover:bg-[#99e4e5] transition-colors cursor-pointer gap-2">
        <img src="/assets/icons/AR_Icon.png" width={30} alt="" />
        <span className="font-medium text-md">See in your space</span>
      </button>
    </div>
  );
};

export default ARButton;
