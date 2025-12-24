import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameCanvas from './GameCanvas';
import HUD from './HUD';
import GameOver from './GameOver';
import MainMenu from './MainMenu';
import { Button } from '../ui/button';
import { WEAPONS, TARGET_TYPES, HIT_ZONES, PLAYER_STATS_INITIAL, RANGE_DISTANCES } from '../../data/mockData';
import { Pause, Play, Volume2, VolumeX, ArrowLeft } from 'lucide-react';

const PracticeRange = () => {
  // Game States
  const [gameScreen, setGameScreen] = useState('menu'); // menu, playing, paused, gameover
  const [currentScenario, setCurrentScenario] = useState(null);
  
  // Player Stats (persisted in localStorage)
  const [playerStats, setPlayerStats] = useState(() => {
    const saved = localStorage.getItem('hogIsland_playerStats');
    return saved ? JSON.parse(saved) : PLAYER_STATS_INITIAL;
  });
  
  // Session Stats
  const [sessionStats, setSessionStats] = useState({
    totalShots: 0,
    hits: 0,
    misses: 0,
    vitalHits: 0,
    bodyHits: 0,
    grazeHits: 0,
    maxCombo: 0
  });
  
  // Game State
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [targets, setTargets] = useState([]);
  const [targetsHit, setTargetsHit] = useState(0);
  const [totalTargets, setTotalTargets] = useState(0);
  const [currentDistance, setCurrentDistance] = useState(100);
  
  // Weapon State
  const [currentWeapon] = useState(WEAPONS.rifle);
  const [ammo, setAmmo] = useState(WEAPONS.rifle.magazineSize);
  const [isReloading, setIsReloading] = useState(false);
  
  // UI State
  const [crosshairPosition, setCrosshairPosition] = useState({ x: 600, y: 300 });
  const [hitMarkers, setHitMarkers] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Refs
  const gameLoopRef = useRef(null);
  const targetSpawnRef = useRef(null);
  const timerRef = useRef(null);

  // Save player stats to localStorage
  useEffect(() => {
    localStorage.setItem('hogIsland_playerStats', JSON.stringify(playerStats));
  }, [playerStats]);

  // Clean up hit markers
  useEffect(() => {
    const interval = setInterval(() => {
      setHitMarkers(prev => prev.filter(m => Date.now() - m.time < 500));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Game timer
  useEffect(() => {
    if (gameScreen === 'playing' && timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameScreen, timeLeft]);

  // Target movement loop
  useEffect(() => {
    if (gameScreen === 'playing') {
      gameLoopRef.current = setInterval(() => {
        setTargets(prev => prev.map(target => {
          if (!target.active || target.speed === 0) return target;
          
          let newX = target.x + (target.direction * target.speed * 0.016);
          let newDirection = target.direction;
          
          // Bounce off edges
          if (newX < 150 || newX > 1050) {
            newDirection *= -1;
            newX = target.x + (newDirection * target.speed * 0.016);
          }
          
          return { ...target, x: newX, direction: newDirection };
        }));
      }, 16);
    }
    return () => clearInterval(gameLoopRef.current);
  }, [gameScreen]);

  // Spawn targets for scenario
  const spawnTargets = useCallback((scenario) => {
    const newTargets = [];
    const targetTypes = scenario.targetTypes;
    
    for (let i = 0; i < scenario.targetCount; i++) {
      const typeKey = targetTypes[Math.floor(Math.random() * targetTypes.length)];
      const targetType = TARGET_TYPES[typeKey];
      const distance = RANGE_DISTANCES[Math.floor(Math.random() * RANGE_DISTANCES.length)];
      const scale = 1 - (distance / 500); // Targets get smaller with distance
      
      // Stagger spawn times
      const spawnDelay = i * (scenario.timeLimit ? (scenario.timeLimit * 1000 / scenario.targetCount) * 0.7 : 2000);
      
      setTimeout(() => {
        setTargets(prev => [...prev, {
          id: `target-${i}-${Date.now()}`,
          type: typeKey,
          x: 200 + Math.random() * 800,
          y: 420 - (RANGE_DISTANCES.indexOf(distance) * 30) - 40,
          speed: targetType.speed,
          direction: Math.random() > 0.5 ? 1 : -1,
          points: targetType.points,
          distance,
          scale,
          active: true,
          vitalZone: { x: 0.2, y: -0.05, radius: 0.25 }, // Relative to target
          bodyZone: { x: 0, y: 0, radius: 0.5 }
        }]);
        setTotalTargets(prev => prev + 1);
      }, spawnDelay);
      
      newTargets.push(i);
    }
  }, []);

  // Start a scenario
  const startScenario = useCallback((scenario) => {
    setCurrentScenario(scenario);
    setGameScreen('playing');
    setScore(0);
    setCombo(0);
    setAccuracy(0);
    setTargets([]);
    setTargetsHit(0);
    setTotalTargets(0);
    setTimeLeft(scenario.timeLimit);
    setAmmo(currentWeapon.magazineSize);
    setSessionStats({
      totalShots: 0,
      hits: 0,
      misses: 0,
      vitalHits: 0,
      bodyHits: 0,
      grazeHits: 0,
      maxCombo: 0
    });
    setCurrentDistance(100);
    
    // Start spawning targets
    setTimeout(() => spawnTargets(scenario), 1000);
  }, [currentWeapon, spawnTargets]);

  // Handle shooting
  const handleShoot = useCallback((position) => {
    if (isReloading || ammo <= 0) {
      // Play empty click sound
      return;
    }

    // Decrease ammo
    setAmmo(prev => prev - 1);
    
    // Update shots
    setSessionStats(prev => ({ ...prev, totalShots: prev.totalShots + 1 }));

    // Check for hits
    let hitTarget = null;
    let hitZone = null;
    
    setTargets(prev => {
      return prev.map(target => {
        if (!target.active || hitTarget) return target;
        
        const baseSize = 60 * target.scale;
        const dx = position.x - target.x;
        const dy = position.y - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check vital zone (heart/lung area)
        const vitalX = target.x + baseSize * target.vitalZone.x;
        const vitalY = target.y + baseSize * target.vitalZone.y;
        const vitalDist = Math.sqrt(Math.pow(position.x - vitalX, 2) + Math.pow(position.y - vitalY, 2));
        
        if (vitalDist < baseSize * target.vitalZone.radius) {
          hitTarget = target;
          hitZone = 'vital';
          return { ...target, active: false };
        }
        
        // Check body zone
        if (distance < baseSize * target.bodyZone.radius) {
          hitTarget = target;
          hitZone = 'body';
          return { ...target, active: false };
        }
        
        // Check graze
        if (distance < baseSize * 0.7) {
          hitTarget = target;
          hitZone = 'graze';
          return { ...target, active: false };
        }
        
        return target;
      });
    });

    if (hitTarget) {
      // Calculate points
      const zoneMultiplier = HIT_ZONES[hitZone].multiplier;
      const basePoints = hitTarget.points;
      const comboMultiplier = 1 + (combo * 0.1);
      const points = Math.floor(basePoints * zoneMultiplier * comboMultiplier);
      
      setScore(prev => prev + points);
      setCombo(prev => prev + 1);
      setTargetsHit(prev => prev + 1);
      setCurrentDistance(hitTarget.distance);
      
      // Update session stats
      setSessionStats(prev => {
        const newStats = {
          ...prev,
          hits: prev.hits + 1,
          maxCombo: Math.max(prev.maxCombo, combo + 1)
        };
        if (hitZone === 'vital') newStats.vitalHits = prev.vitalHits + 1;
        else if (hitZone === 'body') newStats.bodyHits = prev.bodyHits + 1;
        else newStats.grazeHits = prev.grazeHits + 1;
        return newStats;
      });
      
      // Add hit marker
      setHitMarkers(prev => [...prev, {
        x: position.x,
        y: position.y,
        zone: hitZone,
        text: `+${points}`,
        time: Date.now()
      }]);
    } else {
      // Miss
      setCombo(0);
      setSessionStats(prev => ({ ...prev, misses: prev.misses + 1 }));
    }

    // Update accuracy
    setSessionStats(prev => {
      const newAccuracy = prev.totalShots > 0 ? (prev.hits / prev.totalShots) * 100 : 0;
      setAccuracy(newAccuracy);
      return prev;
    });

    // Auto-reload when empty
    if (ammo <= 1) {
      reload();
    }
  }, [ammo, combo, isReloading]);

  // Reload weapon
  const reload = useCallback(() => {
    if (isReloading) return;
    setIsReloading(true);
    
    setTimeout(() => {
      setAmmo(currentWeapon.magazineSize);
      setIsReloading(false);
    }, currentWeapon.reloadTime);
  }, [currentWeapon, isReloading]);

  // End game
  const endGame = useCallback(() => {
    clearInterval(gameLoopRef.current);
    clearInterval(timerRef.current);
    setGameScreen('gameover');
    
    // Update player stats
    setPlayerStats(prev => {
      const newStats = {
        ...prev,
        totalShots: prev.totalShots + sessionStats.totalShots,
        hits: prev.hits + sessionStats.hits,
        misses: prev.misses + sessionStats.misses,
        vitalHits: prev.vitalHits + sessionStats.vitalHits,
        bodyHits: prev.bodyHits + sessionStats.bodyHits,
        grazeHits: prev.grazeHits + sessionStats.grazeHits,
        accuracy: prev.totalShots + sessionStats.totalShots > 0 
          ? ((prev.hits + sessionStats.hits) / (prev.totalShots + sessionStats.totalShots)) * 100 
          : 0,
        highScore: Math.max(prev.highScore, score)
      };
      
      // Mark scenario as completed if accuracy >= 50%
      const finalAccuracy = sessionStats.totalShots > 0 ? (sessionStats.hits / sessionStats.totalShots) * 100 : 0;
      if (finalAccuracy >= 50 && currentScenario && !prev.scenariosCompleted.includes(currentScenario.id)) {
        newStats.scenariosCompleted = [...prev.scenariosCompleted, currentScenario.id];
      }
      
      return newStats;
    });
  }, [sessionStats, score, currentScenario]);

  // Check if all targets are done
  useEffect(() => {
    if (gameScreen === 'playing' && currentScenario) {
      const activeTargets = targets.filter(t => t.active).length;
      const spawnedAll = totalTargets >= currentScenario.targetCount;
      
      if (spawnedAll && activeTargets === 0 && targetsHit > 0) {
        setTimeout(() => endGame(), 1000);
      }
    }
  }, [targets, totalTargets, targetsHit, currentScenario, gameScreen, endGame]);

  // Pause/Resume
  const togglePause = () => {
    setGameScreen(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'r' || e.key === 'R') {
        reload();
      } else if (e.key === 'Escape') {
        if (gameScreen === 'playing') togglePause();
      } else if (e.key === ' ' && gameScreen === 'paused') {
        togglePause();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameScreen, reload]);

  // Render based on game screen
  if (gameScreen === 'menu') {
    return (
      <MainMenu 
        onStartScenario={startScenario}
        playerStats={playerStats}
      />
    );
  }

  if (gameScreen === 'gameover') {
    const finalAccuracy = sessionStats.totalShots > 0 ? (sessionStats.hits / sessionStats.totalShots) * 100 : 0;
    return (
      <GameOver
        score={score}
        stats={{
          accuracy: finalAccuracy,
          hits: sessionStats.hits,
          totalShots: sessionStats.totalShots,
          vitalHits: sessionStats.vitalHits,
          bodyHits: sessionStats.bodyHits,
          maxCombo: sessionStats.maxCombo
        }}
        scenario={currentScenario}
        isNewHighScore={score > playerStats.highScore}
        onRestart={() => startScenario(currentScenario)}
        onMainMenu={() => setGameScreen('menu')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      {/* HUD */}
      <HUD
        score={score}
        accuracy={accuracy}
        combo={combo}
        timeLeft={timeLeft}
        targetsHit={targetsHit}
        totalTargets={currentScenario?.targetCount || 0}
        currentScenario={currentScenario}
        vitalHits={sessionStats.vitalHits}
        bodyHits={sessionStats.bodyHits}
      />
      
      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Controls Bar */}
        <div className="absolute top-4 right-4 flex gap-2 z-20">
          <Button
            onClick={() => setGameScreen('menu')}
            variant="outline"
            size="sm"
            className="bg-stone-800/80 border-stone-600 text-stone-300 hover:bg-stone-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Menu
          </Button>
          <Button
            onClick={togglePause}
            variant="outline"
            size="sm"
            className="bg-stone-800/80 border-stone-600 text-stone-300 hover:bg-stone-700"
          >
            {gameScreen === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            variant="outline"
            size="sm"
            className="bg-stone-800/80 border-stone-600 text-stone-300 hover:bg-stone-700"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </div>
        
        {/* Game Canvas */}
        <GameCanvas
          gameState={gameScreen}
          targets={targets}
          onShoot={handleShoot}
          weapon={currentWeapon}
          ammo={ammo}
          crosshairPosition={crosshairPosition}
          setCrosshairPosition={setCrosshairPosition}
          hitMarkers={hitMarkers}
          currentDistance={currentDistance}
        />
        
        {/* Pause Overlay */}
        {gameScreen === 'paused' && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-30">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">PAUSED</h2>
              <p className="text-stone-400 mb-6">Press SPACE or click Resume to continue</p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={togglePause}
                  className="bg-amber-600 hover:bg-amber-500"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
                <Button
                  onClick={() => setGameScreen('menu')}
                  variant="outline"
                  className="border-stone-600 text-stone-300"
                >
                  Quit to Menu
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Reload indicator */}
        {isReloading && (
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-black/80 text-amber-400 px-6 py-3 rounded-lg font-mono text-lg animate-pulse">
            RELOADING...
          </div>
        )}
      </div>
      
      {/* Controls Help */}
      <div className="bg-stone-900 border-t border-stone-800 px-6 py-2">
        <div className="flex justify-center gap-8 text-sm text-stone-500">
          <span><kbd className="px-2 py-1 bg-stone-800 rounded text-stone-300 font-mono">CLICK</kbd> Shoot</span>
          <span><kbd className="px-2 py-1 bg-stone-800 rounded text-stone-300 font-mono">R</kbd> Reload</span>
          <span><kbd className="px-2 py-1 bg-stone-800 rounded text-stone-300 font-mono">ESC</kbd> Pause</span>
        </div>
      </div>
    </div>
  );
};

export default PracticeRange;
