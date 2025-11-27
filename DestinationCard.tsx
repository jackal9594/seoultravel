import React from 'react';
import { Destination } from '../types';

interface DestinationCardProps {
  destination: Destination;
  onClick: (dest: Destination) => void;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ destination, onClick }) => {
  return (
    <div 
      onClick={() => onClick(destination)}
      className="bg-white rounded-2xl overflow-hidden shadow-md mb-4 active:scale-95 transition-transform duration-200 cursor-pointer"
    >
      <div className="relative h-48 w-full">
        <img 
          src={destination.imageUrl} 
          alt={destination.name} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-orange-500 flex items-center shadow-sm">
          ★ {destination.rating}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-1">{destination.name}</h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">{destination.description}</p>
        <div className="flex flex-wrap gap-2">
          {destination.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-lg font-medium">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;