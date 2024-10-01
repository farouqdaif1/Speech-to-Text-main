import React from "react";

const PermissionModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-[9999]">
            <div className="absolute inset-0 z-[9999]" onClick={onClose}></div>
            <div className="relative bg-white p-5 rounded-lg max-w-md w-full mx-4 sm:mx-0 z-[10000] shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-center sm:text-left">
                    Permission Denied
                </h2>
                <p className="text-center sm:text-left">
                    We need access to your microphone to start recording. Please grant
                    permission and try again.
                </p>
                <button
                    className="mt-4 bg-blue-500 text-white py-2 px-4 rounded w-full sm:w-auto"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default PermissionModal;
