import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Target, Crosshair, Play, Info, Lock, Gauge, Timer, ChevronRight, Star } from 'lucide-react';
import { PRACTICE_SCENARIOS, LEVELS, WEAPONS } from '../../data/mockData';
import WeaponSelect from './WeaponSelect';
import LevelProgress from './LevelProgress';

const MainMenu = ({ 
  onStartScenario, 
  playerStats, 
  currentWeapon,
  onSelectWeapon 
}) => {
  const [showWeaponSelect, setShowWeaponSelect] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  
  const currentLevelData = LEVELS[playerStats.currentLevel];

  // Check if scenario is unlocked based on level
  const isScenarioUnlocked = (scenario) => {
    return playerStats.currentLevel >= scenario.level;
  };

  // Get scenario difficulty color
  const getDifficultyColor = (level) => {
    const colors = {
      1: 'text-green-400 border-green-500/50',
      2: 'text-blue-400 border-blue-500/50',
      3: 'text-yellow-400 border-yellow-500/50',
      4: 'text-orange-400 border-orange-500/50',
      5: 'text-red-400 border-red-500/50'
    };
    return colors[level] || colors[1];
  };

  const handleStartScenario = (scenario) => {
    if (!currentWeapon) {
      setSelectedScenario(scenario);
      setShowWeaponSelect(true);
    } else {
      onStartScenario(scenario, currentWeapon);
    }
  };

  const handleWeaponSelected = (weapon) => {
    onSelectWeapon(weapon);
    setShowWeaponSelect(false);
    if (selectedScenario) {
      onStartScenario(selectedScenario, weapon);
      setSelectedScenario(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-green-900/10 to-transparent" />
      </div>
      
      {/* Texture overlay */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        opacity: 0.03
      }} />
      
      <div className="relative z-10 container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-3">
            <Crosshair className="w-10 h-10 text-amber-500" />
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 tracking-tight">
              HOG ISLAND
            </h1>
            <Target className="w-10 h-10 text-amber-500" />
          </div>
          <p className="text-stone-400 text-lg max-w-2xl mx-auto">
            Master your marksmanship. Learn ballistics. Prepare for the hunt.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-amber-600">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-amber-600" />
            <span className="text-sm uppercase tracking-widest">Training Range</span>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-amber-600" />
          </div>
        </div>

        {/* Level Progress */}
        <div className="mb-6">
          <LevelProgress 
            currentLevel={playerStats.currentLevel} 
            experience={playerStats.experience} 
          />
        </div>

        {/* Current Weapon & Quick Stats */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Current Weapon */}
          <Card className="bg-stone-800/50 border-stone-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-amber-500" />
                Current Weapon
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentWeapon ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-white">{currentWeapon.name}</p>
                    <p className="text-amber-400 text-sm">{currentWeapon.caliber}</p>
                    <p className="text-stone-500 text-xs mt-1">
                      Range: {currentWeapon.effectiveRange}yd • Mag: {currentWeapon.magazineSize}
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowWeaponSelect(true)}
                    variant="outline" 
                    size="sm"
                    className="border-amber-600/50 text-amber-400 hover:bg-amber-600/20"
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setShowWeaponSelect(true)}
                  className="w-full bg-amber-600 hover:bg-amber-500"
                >
                  Select Weapon
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-stone-800/50 border-stone-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                Career Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white font-mono">{playerStats.totalShots}</p>
                  <p className="text-xs text-stone-500">Shots</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold font-mono ${
                    playerStats.accuracy >= 70 ? 'text-green-400' : 
                    playerStats.accuracy >= 50 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {playerStats.accuracy.toFixed(1)}%
                  </p>
                  <p className="text-xs text-stone-500">Accuracy</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400 font-mono">{playerStats.vitalHits}</p>
                  <p className="text-xs text-stone-500">Vitals</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-400 font-mono">{playerStats.highScore.toLocaleString()}</p>
                  <p className="text-xs text-stone-500">High Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Weapons by Level */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Weapons Available at Level {playerStats.currentLevel}
          </h3>
          <div className="flex flex-wrap gap-2">
            {currentLevelData?.weapons.map(weaponId => {
              const weapon = WEAPONS[weaponId];
              if (!weapon) return null;
              const isUnlocked = playerStats.weaponsUnlocked.includes(weaponId);
              return (
                <Badge 
                  key={weaponId}
                  variant="outline"
                  className={`${isUnlocked ? 'border-green-500/50 text-green-400' : 'border-stone-600 text-stone-400'}`}
                >
                  {weapon.name}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Training Scenarios */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500" />
            Training Scenarios
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRACTICE_SCENARIOS.map((scenario) => {
              const isUnlocked = isScenarioUnlocked(scenario);
              const isCompleted = playerStats.scenariosCompleted.includes(scenario.id);
              
              return (
                <Card 
                  key={scenario.id}
                  className={`bg-stone-800/50 border-stone-700 transition-all duration-300 ${
                    !isUnlocked ? 'opacity-50' : 'hover:border-amber-600/50 hover:bg-stone-800/70 hover:scale-[1.02]'
                  } ${isCompleted ? 'ring-1 ring-green-500/30' : ''}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-white text-base">
                            {scenario.name}
                          </CardTitle>
                          {isCompleted && (
                            <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                              ✓ Done
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-stone-400 text-sm mt-1">
                          {scenario.description}
                        </CardDescription>
                      </div>
                      {!isUnlocked && (
                        <div className="flex items-center gap-1 text-stone-500">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Scenario stats */}
                    <div className="flex flex-wrap gap-3 text-xs text-stone-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        <span>{scenario.targetCount} targets</span>
                      </div>
                      {scenario.timeLimit && (
                        <div className="flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          <span>{Math.floor(scenario.timeLimit / 60)}:{(scenario.timeLimit % 60).toString().padStart(2, '0')}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Gauge className="w-3 h-3" />
                        <span>{scenario.distances[0]}-{scenario.distances[scenario.distances.length - 1]}yd</span>
                      </div>
                    </div>
                    
                    {/* Difficulty badge */}
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getDifficultyColor(scenario.level)}`}
                      >
                        Level {scenario.level} - {LEVELS[scenario.level]?.name}
                      </Badge>
                      
                      <Button
                        onClick={() => isUnlocked && handleStartScenario(scenario)}
                        disabled={!isUnlocked}
                        size="sm"
                        className={isUnlocked ? 'bg-amber-600 hover:bg-amber-500 text-white' : ''}
                      >
                        {isUnlocked ? (
                          <>
                            <Play className="w-3 h-3 mr-1" />
                            Start
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 mr-1" />
                            Locked
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Coming Soon: Main Hunt */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-stone-800/50 to-stone-900/50 border-amber-600/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                    <Crosshair className="w-5 h-5" />
                    The Hunt Begins Soon...
                  </h3>
                  <p className="text-stone-400 mt-1">
                    Complete training scenarios to unlock the full Hog Island experience. 
                    Face thousands of wild hogs across multiple terrains.
                  </p>
                </div>
                <ChevronRight className="w-8 h-8 text-amber-600/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-stone-500 text-sm bg-stone-800/50 px-4 py-2 rounded-full">
            <Info className="w-4 h-4" />
            <span>Master all 5 levels to become a true Hog Island hunter</span>
          </div>
        </div>
      </div>

      {/* Weapon Selection Modal */}
      {showWeaponSelect && (
        <WeaponSelect
          currentWeapon={currentWeapon}
          onSelectWeapon={handleWeaponSelected}
          unlockedWeapons={playerStats.weaponsUnlocked}
          playerLevel={playerStats.currentLevel}
          onClose={() => {
            setShowWeaponSelect(false);
            setSelectedScenario(null);
          }}
        />
      )}
    </div>
  );
};

export default MainMenu;
