import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Lock, Check, Crosshair, Gauge, Target, Zap } from 'lucide-react';
import { WEAPONS, RANGE_DISTANCES } from '../../data/mockData';

const WeaponSelect = ({ 
  currentWeapon, 
  onSelectWeapon, 
  unlockedWeapons, 
  playerLevel,
  onClose 
}) => {
  const weaponList = Object.values(WEAPONS);
  
  // Group weapons by category
  const categories = {
    'rimfire': { name: 'Rimfire (.22)', weapons: [] },
    'centerfire': { name: 'Centerfire', weapons: [] },
    'tactical': { name: 'Tactical/Military', weapons: [] },
    'lever-action': { name: 'Lever Action', weapons: [] },
    'carbine': { name: 'Carbine', weapons: [] },
    'bolt-action': { name: 'Bolt Action', weapons: [] },
    'semi-auto': { name: 'Semi-Auto', weapons: [] },
    'anti-material': { name: 'Heavy', weapons: [] },
    'pistol': { name: 'Pistol/PDW', weapons: [] }
  };
  
  weaponList.forEach(weapon => {
    if (categories[weapon.category]) {
      categories[weapon.category].weapons.push(weapon);
    }
  });

  const isUnlocked = (weapon) => unlockedWeapons.includes(weapon.id);
  const canUnlock = (weapon) => playerLevel >= weapon.unlockLevel;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-stone-900 rounded-xl border border-stone-700 max-w-5xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-stone-900 border-b border-stone-700 p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Crosshair className="w-6 h-6 text-amber-500" />
              Armory
            </h2>
            <p className="text-stone-400 text-sm">Select your weapon for training</p>
          </div>
          <Button onClick={onClose} variant="outline" className="border-stone-600 text-stone-300">
            Close
          </Button>
        </div>
        
        {/* Current Weapon */}
        {currentWeapon && (
          <div className="p-4 bg-stone-800/50 border-b border-stone-700">
            <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">Currently Equipped</p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-stone-700 rounded-lg flex items-center justify-center">
                <Crosshair className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{currentWeapon.name}</h3>
                <p className="text-amber-400 text-sm">{currentWeapon.caliber}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Weapon Categories */}
        <div className="p-4 space-y-6">
          {Object.entries(categories).map(([catId, category]) => {
            if (category.weapons.length === 0) return null;
            
            return (
              <div key={catId}>
                <h3 className="text-lg font-semibold text-stone-300 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  {category.name}
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.weapons.map(weapon => {
                    const unlocked = isUnlocked(weapon);
                    const available = canUnlock(weapon);
                    const isSelected = currentWeapon?.id === weapon.id;
                    
                    return (
                      <Card 
                        key={weapon.id}
                        className={`bg-stone-800/50 border-stone-700 transition-all cursor-pointer ${
                          isSelected ? 'ring-2 ring-amber-500 border-amber-500' : 
                          unlocked ? 'hover:border-amber-600/50 hover:bg-stone-800' : 
                          'opacity-60'
                        }`}
                        onClick={() => unlocked && onSelectWeapon(weapon)}
                      >
                        <CardHeader className="pb-2 pt-3 px-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-white text-sm flex items-center gap-2">
                                {weapon.name}
                                {isSelected && <Check className="w-4 h-4 text-green-400" />}
                              </CardTitle>
                              <CardDescription className="text-amber-400 text-xs">
                                {weapon.caliber}
                              </CardDescription>
                            </div>
                            {!unlocked && (
                              <div className="flex items-center gap-1">
                                <Lock className="w-4 h-4 text-stone-500" />
                                <span className="text-xs text-stone-500">Lvl {weapon.unlockLevel}</span>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="px-3 pb-3">
                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                            <div className="flex items-center gap-1">
                              <Target className="w-3 h-3 text-stone-500" />
                              <span className="text-stone-400">Range:</span>
                              <span className="text-white">{weapon.effectiveRange}yd</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-stone-500" />
                              <span className="text-stone-400">Dmg:</span>
                              <span className="text-white">{weapon.damage}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Gauge className="w-3 h-3 text-stone-500" />
                              <span className="text-stone-400">Mag:</span>
                              <span className="text-white">{weapon.magazineSize}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-stone-400">Velocity:</span>
                              <span className="text-white">{weapon.muzzleVelocity}fps</span>
                            </div>
                          </div>
                          
                          {/* Recoil bar */}
                          <div className="mb-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-stone-500">Recoil</span>
                              <span className="text-stone-400">{(weapon.recoil * 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-1.5 bg-stone-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  weapon.recoil > 0.6 ? 'bg-red-500' : 
                                  weapon.recoil > 0.4 ? 'bg-orange-500' : 
                                  weapon.recoil > 0.2 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${weapon.recoil * 100}%` }}
                              />
                            </div>
                          </div>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {weapon.fireMode === 'full-auto' && (
                              <Badge variant="outline" className="text-xs border-red-500/50 text-red-400">
                                Full-Auto
                              </Badge>
                            )}
                            {weapon.effectiveRange >= 500 && (
                              <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                                Long Range
                              </Badge>
                            )}
                            {weapon.damage >= 100 && (
                              <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-400">
                                High Power
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeaponSelect;
