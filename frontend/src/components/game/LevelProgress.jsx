import React from 'react';
import { Progress } from '../ui/progress';
import { LEVELS, XP_PER_LEVEL } from '../../data/mockData';
import { Star, ChevronRight, Lock, Check } from 'lucide-react';

const LevelProgress = ({ currentLevel, experience, compact = false }) => {
  const currentLevelData = LEVELS[currentLevel];
  const nextLevel = currentLevel < 5 ? currentLevel + 1 : null;
  const currentXP = experience - (XP_PER_LEVEL[currentLevel] || 0);
  const xpNeeded = nextLevel ? XP_PER_LEVEL[nextLevel] - XP_PER_LEVEL[currentLevel] : 0;
  const progress = xpNeeded > 0 ? (currentXP / xpNeeded) * 100 : 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="text-amber-400 font-bold">Lvl {currentLevel}</span>
        </div>
        {nextLevel && (
          <div className="flex-1 max-w-[100px]">
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-stone-800/50 rounded-lg p-4 border border-stone-700">
      {/* Current Level */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-xl font-bold text-white">{currentLevel}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{currentLevelData?.name}</h3>
            <p className="text-sm text-stone-400">{currentLevelData?.description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white font-mono">{experience.toLocaleString()}</p>
          <p className="text-xs text-stone-500">Total XP</p>
        </div>
      </div>
      
      {/* Progress to next level */}
      {nextLevel && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-stone-400">Progress to Level {nextLevel}</span>
            <span className="text-amber-400">{currentXP.toLocaleString()} / {xpNeeded.toLocaleString()} XP</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      )}
      
      {/* Level roadmap */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-700">
        {Object.entries(LEVELS).map(([lvl, data]) => {
          const level = parseInt(lvl);
          const isCompleted = level < currentLevel;
          const isCurrent = level === currentLevel;
          const isLocked = level > currentLevel;
          
          return (
            <React.Fragment key={level}>
              <div className={`flex flex-col items-center ${
                isCurrent ? 'scale-110' : ''
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-500' :
                  isCurrent ? 'bg-amber-500 ring-2 ring-amber-400 ring-offset-2 ring-offset-stone-800' :
                  'bg-stone-700'
                }`}>
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : isLocked ? (
                    <Lock className="w-3 h-3 text-stone-500" />
                  ) : (
                    <span className="text-sm font-bold text-white">{level}</span>
                  )}
                </div>
                <span className={`text-xs mt-1 ${
                  isCurrent ? 'text-amber-400 font-semibold' :
                  isCompleted ? 'text-green-400' : 'text-stone-500'
                }`}>
                  {data.name}
                </span>
              </div>
              {level < 5 && (
                <ChevronRight className={`w-4 h-4 ${
                  level < currentLevel ? 'text-green-500' : 'text-stone-600'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default LevelProgress;
