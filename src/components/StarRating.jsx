import React, { useState } from 'react';

function StarRating({ rating, onRate, readonly, size }) {
  const [hovered, setHovered] = useState(0);
  const starSize = size || 28;

  return (
    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => !readonly && onRate && onRate(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{
            fontSize: `${starSize}px`,
            cursor: readonly ? 'default' : 'pointer',
            opacity: star <= (hovered || rating) ? 1 : 0.25,
            transition: 'opacity 0.15s, transform 0.15s',
            transform: star <= (hovered || rating) ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}

export default StarRating;