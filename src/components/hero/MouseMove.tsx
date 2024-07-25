import React, { ReactNode, useState } from "react";

interface MouseMoveProps {
  className?: string;
  penColor?: string;
  bgColor?: string;
}

const MouseMove: React.FC<MouseMoveProps> = ({ 
  className = '', 
  penColor = 'white', 
  bgColor = 'rgb(24 24 27)' // zinc-900
}) => {
  return (
    <MouseMoveLineDrawing className={className} penColor={penColor} bgColor={bgColor}>
      <div className="w-full h-full" style={{ backgroundColor: bgColor }}></div>
    </MouseMoveLineDrawing>
  );
};

const MAX_POINTS = 30;

interface MouseMoveLineDrawingProps {
  children?: ReactNode;
  className?: string;
  penColor?: string;
  bgColor?: string;
}

const MouseMoveLineDrawing: React.FC<MouseMoveLineDrawingProps> = ({ 
  children, 
  className = '', 
  penColor = 'white', 
  bgColor = 'rgb(24 24 27)' 
}) => {
  const [points, setPoints] = useState<string[]>([]);

  return (
    <div
      className={`relative ${className}`}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setPoints((pv) => {
          const pointBuffer = [...pv, `${x} ${y}`];

          if (pointBuffer.length > MAX_POINTS) {
            pointBuffer.shift();
          }

          return pointBuffer;
        });
      }}
    >
      {children}
      <svg
        className="pointer-events-none absolute left-0 top-0 h-full w-full"
        viewBox="0 0 100% 100%"
      >
        <polyline
          className={`stroke-current`}
          style={{ stroke: penColor }}
          fill="none"
          strokeWidth="2"
          strokeDasharray="0"
          strokeLinecap="round"
          points={`${points.join(", ")}`}
        ></polyline>
      </svg>
    </div>
  );
};

export default MouseMove;