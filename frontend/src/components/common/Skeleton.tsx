import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'rect' | 'circle';
  animation?: 'glow' | 'wave';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

export default function Skeleton({
  variant = 'text',
  animation = 'glow',
  width,
  height,
  className = '',
  count = 1,
}: SkeletonProps) {
  const elements = Array.from({ length: count });

  const getStyle = () => {
    const style: React.CSSProperties = {};
    if (width !== undefined) {
      style.width = typeof width === 'number' ? `${width}px` : width;
    }
    if (height !== undefined) {
      style.height = typeof height === 'number' ? `${height}px` : height;
    }
    if (variant === 'circle') {
      style.borderRadius = '50%';
    }
    return style;
  };

  const getShapeClass = () => {
    switch (variant) {
      case 'circle':
        return 'd-inline-block bg-secondary opacity-25';
      case 'rect':
        return 'w-100 d-block bg-secondary opacity-25 rounded-3';
      case 'text':
      default:
        return 'placeholder w-100';
    }
  };

  return (
    <>
      {elements.map((_, index) => (
        <span
          key={index}
          className={`${animation === 'glow' ? 'placeholder-glow' : 'placeholder-wave'} ${className} d-inline-block w-100`}
        >
          <span
            className={`${getShapeClass()}`}
            style={getStyle()}
          />
        </span>
      ))}
    </>
  );
}
