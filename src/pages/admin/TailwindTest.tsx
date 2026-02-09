import React from 'react';

const TailwindTest: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-8">
      <div className="max-w-lg w-full bg-white rounded-2xl p-8 shadow-xl transform hover:scale-[1.01] transition-all duration-300">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">Tailwind Test ✅</h1>
        <p className="text-sm text-gray-600 mb-6">This card verifies utilities, gradients, rounded corners, shadow, hover, responsive classes and custom animations.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 rounded-lg bg-red-500 text-white shadow hover:bg-red-600 transition-colors">bg-red-500</div>
          <div className="p-4 rounded-lg bg-green-500 text-white shadow hover:bg-green-600 transition-colors">bg-green-500</div>
          <div className="p-4 rounded-lg bg-blue-500 text-white shadow hover:bg-blue-600 transition-colors">bg-blue-500</div>
          <div className="p-4 rounded-lg bg-indigo-500 text-white shadow hover:bg-indigo-600 transition-colors">bg-indigo-500</div>
        </div>

        <div className="mt-6">
          <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold shadow-lg hover:from-indigo-600 hover:to-pink-600 transition-colors">Gradient Button</div>
        </div>

        <div className="mt-6">
          <div className="mt-2 p-4 rounded-lg bg-white border custom-scrollbar overflow-auto max-h-40 animate-fade-in">
            <p className="text-sm text-gray-700">This box uses the <code>custom-scrollbar</code> utility and the <code>fade-in</code> animation from the Tailwind config.</p>
            <div className="h-24" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;
