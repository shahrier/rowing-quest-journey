import React from "react";

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-t-blue-500 border-b-blue-700 border-l-blue-300 border-r-blue-300 animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-semibold">
          RowQuest
        </div>
      </div>
    </div>
  );
}