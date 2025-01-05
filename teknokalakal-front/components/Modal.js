import React from "react";

const Modal = ({ children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
      {children}
    </div>
  </div>
);

export default Modal;
