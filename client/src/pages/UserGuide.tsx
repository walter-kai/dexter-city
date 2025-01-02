import React from 'react';

const UserGuide: React.FC = () => {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-semibold mb-8">User Guide</h1>
      <div className="space-y-8">
        <div className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg p-6 shadow-md">
          <div className="mr-6">
            {/* Placeholder for image */}
            <img src="placeholder-image-1.jpg" alt="Build or choose a bot" className="w-12 h-12" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-medium text-gray-800">1. Build a bot or choose one from the shop</h2>
            <p className="text-gray-600">Choose to build your own custom bot or select one from the shop to get started.</p>
          </div>
        </div>

        <div className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg p-6 shadow-md">
          <div className="mr-6">
            {/* Placeholder for image */}
            <img src="placeholder-image-2.jpg" alt="Set your budget" className="w-12 h-12" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-medium text-gray-800">2. Set your budget</h2>
            <p className="text-gray-600">Set a budget that works for you, whether it’s a fixed amount or a recurring plan.</p>
          </div>
        </div>

        <div className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg p-6 shadow-md">
          <div className="mr-6">
            {/* Placeholder for image */}
            <img src="placeholder-image-3.jpg" alt="Confirm your choices" className="w-12 h-12" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-medium text-gray-800">3. Confirm your choices</h2>
            <p className="text-gray-600">Review your selections and make sure everything looks good before moving forward.</p>
          </div>
        </div>

        <div className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg p-6 shadow-md">
          <div className="mr-6">
            {/* Placeholder for image */}
            <img src="placeholder-image-4.jpg" alt="Done" className="w-12 h-12" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-medium text-gray-800">4. Done</h2>
            <p className="text-gray-600">Your setup is complete! You're all set to start using the app.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;
