import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string; // for additional custom styles
}

const Button: React.FC<ButtonProps> = ({ label, onClick, type = 'button', className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-blue-500 text-white font-bold py-2 px-4 rounded transition duration-200 hover:bg-blue-600 ${className}`}
    >
      {label}
    </button>
  );
};

export default Button;
