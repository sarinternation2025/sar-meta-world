import React from 'react';

const NavIcon = ({ icon, label }) => {
  return (
    <button className="flex flex-col items-center space-y-1 text-gray-400 hover:text-cyan-400 transition-colors">
      <span className="text-2xl">{icon}</span>
      <span className="text-xs">{label}</span>
    </button>
  );
};

export default NavIcon;
