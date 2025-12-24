import React from 'react';
import { Target, Crosshair, Award, Clock, Zap, Star } from 'lucide-react';
import { LEVELS } from '../../data/mockData';

const HUD = ({ 
  score, 
  accuracy, 
  combo, 
  timeLeft, 
  targetsHit, 
  totalTargets,
  currentScenario,
  vitalHits,
  bodyHits,
  playerLevel
}) => {
  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const levelData = LEVELS[currentScenario?.level || 1];

  return (
    <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 border-b-2 border-amber-600/50 px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left - Score & Combo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider">Score</p>
              <p className="text-xl font-bold text-white font-mono leading-none">{score.toLocaleString()}</p>
            </div>
          </div>
          
          {combo > 1 && (
            <div className="flex items-center gap-1.5 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/50 animate-pulse">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-bold text-sm">{combo}x</span>
            </div>
          )}
        </div>

        {/* Center - Scenario Info */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <p className="text-amber-400 font-semibold">{currentScenario?.name || 'Practice Range'}</p>
            <span className="text-stone-600">•</span>
            <span className="text-stone-400 text-sm">Level {currentScenario?.level || 1}</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {targetsHit}/{totalTargets}
            </span>
            <span>|</span>
            <span>Req: {levelData?.requiredAccuracy || 50}% acc</span>
          </div>
        </div>

        {/* Right - Stats */}
        <div className="flex items-center gap-4">
          {/* Level Badge */}
          <div className="flex items-center gap-1 bg-stone-700/50 px-2 py-1 rounded">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-semibold text-sm">Lvl {playerLevel}</span>
          </div>
          
          {/* Time */}
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${timeLeft !== null && timeLeft < 15 ? 'text-red-400 animate-pulse' : 'text-stone-400'}`} />
            <div>
              <p className="text-xs text-stone-500">Time</p>
              <p className={`text-lg font-mono font-bold leading-none ${
                timeLeft !== null && timeLeft < 15 ? 'text-red-400' : 'text-white'
              }`}>
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>

          {/* Accuracy */}
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-stone-400" />
            <div>
              <p className="text-xs text-stone-500">Accuracy</p>
              <p className={`text-lg font-mono font-bold leading-none ${
                accuracy >= 70 ? 'text-green-400' : 
                accuracy >= 50 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {accuracy.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Hit Types */}
          <div className="flex gap-1.5">
            <div className="bg-red-500/20 px-2 py-1 rounded border border-red-500/30">
              <p className="text-[10px] text-red-400 uppercase">Vital</p>
              <p className="text-base font-bold text-red-400 font-mono leading-none">{vitalHits}</p>
            </div>
            <div className="bg-orange-500/20 px-2 py-1 rounded border border-orange-500/30">
              <p className="text-[10px] text-orange-400 uppercase">Body</p>
              <p className="text-base font-bold text-orange-400 font-mono leading-none">{bodyHits}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HUD;
