import React from 'react';
import { Target, Crosshair, Award, Clock, Zap } from 'lucide-react';

const HUD = ({ 
  score, 
  accuracy, 
  combo, 
  timeLeft, 
  targetsHit, 
  totalTargets,
  currentScenario,
  vitalHits,
  bodyHits
}) => {
  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 border-b-2 border-amber-600/50 px-6 py-3">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Score Section */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">Score</p>
              <p className="text-2xl font-bold text-white font-mono">{score.toLocaleString()}</p>
            </div>
          </div>
          
          {combo > 1 && (
            <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/50 animate-pulse">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-bold">{combo}x COMBO</span>
            </div>
          )}
        </div>

        {/* Center - Scenario Info */}
        <div className="text-center">
          <p className="text-amber-400 font-semibold text-lg">{currentScenario?.name || 'Practice Range'}</p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="text-stone-400">
              <Target className="w-4 h-4 inline mr-1" />
              {targetsHit}/{totalTargets}
            </span>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex items-center gap-6">
          {/* Time */}
          <div className="flex items-center gap-2">
            <Clock className={`w-5 h-5 ${timeLeft && timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-stone-400'}`} />
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">Time</p>
              <p className={`text-xl font-mono font-bold ${timeLeft && timeLeft < 10 ? 'text-red-400' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>

          {/* Accuracy */}
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-stone-400" />
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">Accuracy</p>
              <p className={`text-xl font-mono font-bold ${
                accuracy >= 80 ? 'text-green-400' : 
                accuracy >= 50 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {accuracy.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Hit Types */}
          <div className="flex gap-2">
            <div className="bg-red-500/20 px-2 py-1 rounded border border-red-500/50">
              <p className="text-xs text-red-400">VITAL</p>
              <p className="text-lg font-bold text-red-400 font-mono">{vitalHits}</p>
            </div>
            <div className="bg-orange-500/20 px-2 py-1 rounded border border-orange-500/50">
              <p className="text-xs text-orange-400">BODY</p>
              <p className="text-lg font-bold text-orange-400 font-mono">{bodyHits}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HUD;
