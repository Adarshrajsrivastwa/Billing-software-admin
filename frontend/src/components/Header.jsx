import React from "react";
import { FiMenu } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 sm:left-64 h-[60px] flex items-center px-4 sm:px-6 lg:px-8 z-50 overflow-hidden"
      style={{
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(229, 231, 235, 0.5)",
      }}
    >
      {/* Animated top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-[length:200%_auto] animate-gradient" />

      <button className="text-gray-700 text-2xl mr-3 sm:hidden hover:text-purple-600 transition-colors">
        <FiMenu />
      </button>

      <div className="flex items-center gap-2 ml-auto">
        <div className="flex items-center gap-3">
          {/* Animated pulsing dot */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-semibold text-gray-700 hidden sm:block animate-fade-in">
            Welcome back, <span className="text-purple-600">@{user?.username || "Admin"}</span>
          </span>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </header>
  );
};

export default Header;
