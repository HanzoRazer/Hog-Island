import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Target, Crosshair, Trophy, Settings, Play, Info } from 'lucide-react';
import { PRACTICE_SCENARIOS } from '../../data/mockData';

const MainMenu = ({ onStartScenario, playerStats, onViewStats }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/30 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-green-900/20 to-transparent" />
      </div>
      
      {/* Fog effect */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxmaWx0ZXIgaWQ9Im5vaXNlIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-50" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Crosshair className="w-12 h-12 text-amber-500" />
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 tracking-tight">
              HOG ISLAND
            </h1>
            <Target className="w-12 h-12 text-amber-500" />
          </div>
          <p className="text-stone-400 text-xl max-w-2xl mx-auto leading-relaxed">
            A mystical island overrun by ferocious wild hogs. Master your marksmanship 
            before the hunt begins...
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-amber-600">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-600" />
            <span className="text-sm uppercase tracking-widest">Practice Range</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-600" />
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="flex justify-center gap-8 mb-10">
          <div className="text-center">
            <p className="text-3xl font-bold text-white font-mono">{playerStats.totalShots}</p>
            <p className="text-xs text-stone-500 uppercase tracking-wider">Shots Fired</p>
          </div>
          <div className="h-12 w-px bg-stone-700" />
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400 font-mono">{playerStats.accuracy.toFixed(1)}%</p>
            <p className="text-xs text-stone-500 uppercase tracking-wider">Accuracy</p>
          </div>
          <div className="h-12 w-px bg-stone-700" />
          <div className="text-center">
            <p className="text-3xl font-bold text-red-400 font-mono">{playerStats.vitalHits}</p>
            <p className="text-xs text-stone-500 uppercase tracking-wider">Vital Hits</p>
          </div>
          <div className="h-12 w-px bg-stone-700" />
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-400 font-mono">{playerStats.highScore.toLocaleString()}</p>
            <p className="text-xs text-stone-500 uppercase tracking-wider">High Score</p>
          </div>
        </div>

        {/* Scenario Selection */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Target className="w-6 h-6 text-amber-500" />
            Training Scenarios
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {PRACTICE_SCENARIOS.map((scenario, index) => {
              const isCompleted = playerStats.scenariosCompleted.includes(scenario.id);
              const isLocked = index > 0 && !playerStats.scenariosCompleted.includes(PRACTICE_SCENARIOS[index - 1].id);
              
              return (
                <Card 
                  key={scenario.id}
                  className={`bg-stone-800/50 border-stone-700 hover:border-amber-600/50 transition-all duration-300 ${
                    isLocked ? 'opacity-50' : 'hover:bg-stone-800/70 hover:scale-[1.02]'
                  } ${isCompleted ? 'ring-1 ring-green-500/30' : ''}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          {scenario.name}
                          {isCompleted && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                              ✓ Complete
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription className="text-stone-400 mt-1">
                          {scenario.description}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <span className="text-amber-400 font-mono text-sm">
                          {scenario.targetCount} targets
                        </span>
                        {scenario.timeLimit && (
                          <p className="text-stone-500 text-xs mt-1">
                            {Math.floor(scenario.timeLimit / 60)}:{(scenario.timeLimit % 60).toString().padStart(2, '0')} limit
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {scenario.targetTypes.map(type => (
                          <span 
                            key={type}
                            className="text-xs bg-stone-700 text-stone-300 px-2 py-1 rounded"
                          >
                            {type.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        ))}
                      </div>
                      <Button
                        onClick={() => !isLocked && onStartScenario(scenario)}
                        disabled={isLocked}
                        className="bg-amber-600 hover:bg-amber-500 text-white"
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        {isLocked ? 'Locked' : 'Start'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-stone-500 text-sm bg-stone-800/50 px-4 py-2 rounded-full">
            <Info className="w-4 h-4" />
            <span>Complete training scenarios to unlock the full Hog Island hunt</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
