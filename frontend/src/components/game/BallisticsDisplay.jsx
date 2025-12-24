import React from 'react';
import { RANGE_DISTANCES } from '../../data/mockData';

const BallisticsDisplay = ({ weapon, currentDistance, show }) => {
  if (!show || !weapon) return null;
  
  // Calculate bullet drop at current distance
  const getBulletDrop = (distance) => {
    if (!weapon.bulletDrop) return 0;
    return weapon.bulletDrop[distance] || 0;
  };
  
  // Calculate hold-over in MOA (minute of angle)
  // 1 MOA = ~1 inch at 100 yards
  const getMOA = (distance) => {
    const dropInches = getBulletDrop(distance);
    // MOA = (drop in inches / distance in yards) * 100
    return distance > 0 ? ((dropInches / distance) * 100).toFixed(1) : 0;
  };
  
  // Calculate mil-dots (1 mil = 3.6 inches at 100 yards)
  const getMils = (distance) => {
    const dropInches = getBulletDrop(distance);
    return distance > 0 ? (dropInches / (distance * 0.036)).toFixed(1) : 0;
  };

  return (
    <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-stone-700">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-amber-400 font-semibold text-sm">{weapon.caliber} Ballistics</h4>
        <span className="text-xs text-stone-500">{weapon.muzzleVelocity} fps</span>
      </div>
      
      {/* Current distance highlight */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded px-2 py-1 mb-2">
        <div className="flex justify-between items-center">
          <span className="text-amber-400 font-mono text-sm">{currentDistance} yards</span>
          <div className="text-right">
            <span className="text-white font-mono text-sm">
              {getBulletDrop(currentDistance)}" drop
            </span>
            <span className="text-stone-500 text-xs ml-2">
              {getMOA(currentDistance)} MOA
            </span>
          </div>
        </div>
      </div>
      
      {/* Drop table */}
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {RANGE_DISTANCES.filter(d => d <= weapon.maxRange).map(distance => {
          const drop = getBulletDrop(distance);
          const isActive = distance === currentDistance;
          const isEffective = distance <= weapon.effectiveRange;
          
          return (
            <div 
              key={distance}
              className={`flex justify-between text-xs py-0.5 px-1 rounded ${
                isActive ? 'bg-amber-500/20 text-white' : 
                isEffective ? 'text-stone-300' : 'text-stone-500'
              }`}
            >
              <span className="font-mono w-16">{distance}yd</span>
              <span className="font-mono">{drop > 0 ? `-${drop}"` : '0"'}</span>
              <span className="text-stone-500 w-12 text-right">{getMils(distance)}mil</span>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-2 pt-2 border-t border-stone-700 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-stone-500">Effective</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-stone-500 rounded-full" />
          <span className="text-stone-500">Max range</span>
        </div>
      </div>
    </div>
  );
};

export default BallisticsDisplay;
