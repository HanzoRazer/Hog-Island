import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Trophy, Target, Crosshair, RotateCcw, Home, Star, Zap } from 'lucide-react';

const GameOver = ({ 
  score, 
  stats, 
  scenario, 
  isNewHighScore,
  onRestart, 
  onMainMenu 
}) => {
  const getGrade = () => {
    if (stats.accuracy >= 90 && stats.vitalHits >= stats.hits * 0.5) return { grade: 'S', color: 'text-amber-400', label: 'MARKSMAN' };
    if (stats.accuracy >= 80) return { grade: 'A', color: 'text-green-400', label: 'EXPERT' };
    if (stats.accuracy >= 70) return { grade: 'B', color: 'text-blue-400', label: 'PROFICIENT' };
    if (stats.accuracy >= 50) return { grade: 'C', color: 'text-stone-300', label: 'ADEQUATE' };
    return { grade: 'D', color: 'text-red-400', label: 'NEEDS TRAINING' };
  };

  const gradeInfo = getGrade();
  const passed = stats.accuracy >= 50;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center p-4">
      <Card className="bg-stone-800/90 border-stone-700 w-full max-w-lg backdrop-blur-sm">
        <CardHeader className="text-center border-b border-stone-700 pb-6">
          <div className="mb-4">
            {passed ? (
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
                <Trophy className="w-10 h-10 text-white" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-stone-600 to-stone-700">
                <Target className="w-10 h-10 text-stone-400" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-3xl text-white mb-2">
            {passed ? 'Scenario Complete!' : 'Training Failed'}
          </CardTitle>
          <p className="text-stone-400">{scenario?.name}</p>
          
          {isNewHighScore && (
            <div className="mt-4 inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full border border-amber-500/50 animate-pulse">
              <Star className="w-5 h-5" />
              NEW HIGH SCORE!
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Grade Display */}
          <div className="text-center">
            <div className={`text-8xl font-black ${gradeInfo.color}`}>
              {gradeInfo.grade}
            </div>
            <p className={`text-sm uppercase tracking-widest ${gradeInfo.color}`}>
              {gradeInfo.label}
            </p>
          </div>

          {/* Score */}
          <div className="text-center bg-stone-900/50 rounded-lg p-4">
            <p className="text-stone-400 text-sm mb-1">FINAL SCORE</p>
            <p className="text-4xl font-bold text-white font-mono">
              {score.toLocaleString()}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-stone-900/50 rounded-lg p-3 text-center">
              <Crosshair className="w-5 h-5 text-stone-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white font-mono">{stats.accuracy.toFixed(1)}%</p>
              <p className="text-xs text-stone-500 uppercase">Accuracy</p>
            </div>
            <div className="bg-stone-900/50 rounded-lg p-3 text-center">
              <Target className="w-5 h-5 text-stone-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white font-mono">{stats.hits}/{stats.totalShots}</p>
              <p className="text-xs text-stone-500 uppercase">Hits/Shots</p>
            </div>
            <div className="bg-red-500/10 rounded-lg p-3 text-center border border-red-500/20">
              <p className="text-2xl font-bold text-red-400 font-mono">{stats.vitalHits}</p>
              <p className="text-xs text-red-400/70 uppercase">Vital Hits</p>
            </div>
            <div className="bg-orange-500/10 rounded-lg p-3 text-center border border-orange-500/20">
              <p className="text-2xl font-bold text-orange-400 font-mono">{stats.bodyHits}</p>
              <p className="text-xs text-orange-400/70 uppercase">Body Hits</p>
            </div>
          </div>

          {/* Best Combo */}
          {stats.maxCombo > 1 && (
            <div className="flex items-center justify-center gap-2 text-amber-400">
              <Zap className="w-5 h-5" />
              <span className="font-bold">Best Combo: {stats.maxCombo}x</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onMainMenu}
              variant="outline"
              className="flex-1 border-stone-600 text-stone-300 hover:bg-stone-700"
            >
              <Home className="w-4 h-4 mr-2" />
              Menu
            </Button>
            <Button
              onClick={onRestart}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameOver;
