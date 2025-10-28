import React from "react";

export default function ProgressLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="flex flex-col items-center">
        <div className="loader mb-4" />
        <div className="text-white font-semibold text-lg">
          Đang xử lý thanh toán...
        </div>
      </div>
      <style>
        {`
          .loader {
            border: 4px solid #fff;
            border-top: 4px solid #222;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}
      </style>
    </div>
  );
}
