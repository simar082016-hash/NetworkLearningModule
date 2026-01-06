import React from 'react';
import { MousePointer2 } from 'lucide-react';

export interface RemoteUser {
  id: string;
  name: string;
  color: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

interface Props {
  users: RemoteUser[];
}

const CollaborationOverlay: React.FC<Props> = ({ users }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {users.map(user => (
        <div 
          key={user.id}
          className="absolute transition-all duration-700 ease-in-out flex flex-col items-start"
          style={{ 
            left: `${user.x}%`, 
            top: `${user.y}%` 
          }}
        >
          <MousePointer2 
            className="w-5 h-5 drop-shadow-md" 
            style={{ color: user.color, fill: user.color }} 
          />
          <span 
            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white whitespace-nowrap ml-3 -mt-1 shadow-lg"
            style={{ backgroundColor: user.color }}
          >
            {user.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CollaborationOverlay;
