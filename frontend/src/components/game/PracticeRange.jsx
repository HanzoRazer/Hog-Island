import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameCanvas from './GameCanvas';
import HUD from './HUD';
import GameOver from './GameOver';
import MainMenu from './MainMenu';
import BallisticsDisplay from './BallisticsDisplay';
import { Button } from '../ui/button';
import { 
  WEAPONS, 
  TARGET_TYPES, 
  HIT_ZONES, 
  PLAYER_STATS_INITIAL, 
  RANGE_DISTANCES,
  LEVELS,
  XP_PER_LEVEL,
  mphToPixelsPerSecond
} from '../../data/mockData';
import { Pause, Play, Volume2, VolumeX, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const PracticeRange = ({ onExit }) => {
  // Game States
  const [gameScreen, setGameScreen] = useState('menu'); // menu, playing, paused, gameover
  const [currentScenario, setCurrentScenario] = useState(null);
  
  // Player Stats (persisted in localStorage)
  const [playerStats, setPlayerStats] = useState(() => {
    const saved = localStorage.getItem('hogIsland_playerStats_v2');
    return saved ? JSON.parse(saved) : PLAYER_STATS_INITIAL;
  });
  
  // Current weapon
  const [currentWeapon, setCurrentWeapon] = useState(() => {
    const saved = localStorage.getItem('hogIsland_currentWeapon');
    if (saved) {
      const weaponId = JSON.parse(saved);
      return WEAPONS[weaponId] || WEAPONS.rifle_22lr;
    }
    return WEAPONS.rifle_22lr;
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
  const [ammo, setAmmo] = useState(10);
  const [isReloading, setIsReloading] = useState(false);
  
  // UI State
  const [crosshairPosition, setCrosshairPosition] = useState({ x: 700, y: 350 });
  const [hitMarkers, setHitMarkers] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showBallistics, setShowBallistics] = useState(true);
  
  // Refs
  const gameLoopRef = useRef(null);
  const targetSpawnRef = useRef(null);
  const timerRef = useRef(null);
  const spawnedCountRef = useRef(0);
  const targetsRef = useRef(targets);
  const gameScreenRef = useRef(gameScreen);
  const initialSpawnRef = useRef(null);

  targetsRef.current = targets;
  gameScreenRef.current = gameScreen;

  useEffect(() => () => {
    clearTimeout(initialSpawnRef.current);
    clearTimeout(targetSpawnRef.current);
    clearInterval(gameLoopRef.current);
    clearInterval(timerRef.current);
  }, []);

  // Save player stats to localStorage
  useEffect(() => {
    localStorage.setItem('hogIsland_playerStats_v2', JSON.stringify(playerStats));
  }, [playerStats]);

  // Save current weapon
  useEffect(() => {
    if (currentWeapon) {
      localStorage.setItem('hogIsland_currentWeapon', JSON.stringify(currentWeapon.id));
    }
  }, [currentWeapon]);

  // Clean up hit markers
  useEffect(() => {
    const interval = setInterval(() => {
      setHitMarkers(prev => {
        if (prev.length === 0) return prev;
        const remaining = prev.filter(m => Date.now() - m.time < 600);
        return remaining.length === prev.length ? prev : remaining;
      });
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

  // Target movement loop with realistic physics
  useEffect(() => {
    if (gameScreen === 'playing') {
      let lastTime = Date.now();
      
      gameLoopRef.current = setInterval(() => {
        const now = Date.now();
        const deltaTime = (now - lastTime) / 1000; // seconds
        lastTime = now;
        
        setTargets(prev => prev.map(target => {
          if (!target.active || target.speed === 0) return target;
          
          // Convert mph to pixels per frame
          const pixelsPerSecond = mphToPixelsPerSecond(target.speed);
          const movement = pixelsPerSecond * deltaTime;
          
          // Move based on angle
          const radians = target.angle * Math.PI / 180;
          let newX = target.x + Math.cos(radians) * movement;
          let newY = target.y + Math.sin(radians) * movement * 0.3; // Reduced vertical movement
          
          let newAngle = target.angle;
          
          // Bounce off edges with angle reflection
          if (newX < 150 || newX > 1250) {
            newAngle = 180 - newAngle;
            newX = Math.max(150, Math.min(1250, newX));
          }
          
          // Keep in vertical bounds
          const minY = 300;
          const maxY = 550;
          if (newY < minY || newY > maxY) {
            newAngle = -newAngle;
            newY = Math.max(minY, Math.min(maxY, newY));
          }
          
          // Random direction changes for unpredictability (based on level)
          if (Math.random() < 0.005 * playerStats.currentLevel) {
            const angleVariation = LEVELS[playerStats.currentLevel]?.angleVariation || 30;
            newAngle += (Math.random() - 0.5) * angleVariation;
          }
          
          return { ...target, x: newX, y: newY, angle: newAngle };
        }));
      }, 16); // ~60fps
    }
    return () => clearInterval(gameLoopRef.current);
  }, [gameScreen, playerStats.currentLevel]);

  // Spawn targets based on scenario and level
  const spawnTarget = useCallback((scenario, index) => {
    const levelData = LEVELS[scenario.level] || LEVELS[1];
    const targetTypes = scenario.targetTypes;
    const typeKey = targetTypes[Math.floor(Math.random() * targetTypes.length)];
    const targetType = TARGET_TYPES[typeKey];
    
    // Pick random distance from scenario's distance list
    const distance = scenario.distances[Math.floor(Math.random() * scenario.distances.length)];
    
    // Scale based on distance (farther = smaller)
    const scale = Math.max(0.3, 1 - (distance / 1200));
    
    // Calculate Y position based on distance (farther = higher on screen)
    const baseY = 550 - (Math.log(distance) / Math.log(1000)) * 200;
    
    // Random speed within target type's range
    const [minSpeed, maxSpeed] = targetType.speedRange;
    const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    
    // Random angle within level's variation
    const [minAngle, maxAngle] = targetType.angleRange;
    const angleRange = Math.min(maxAngle - minAngle, levelData.angleVariation * 2);
    const angle = (Math.random() - 0.5) * angleRange;
    
    // Random X position
    const x = 200 + Math.random() * 1000;
    
    setTargets(prev => [...prev, {
      id: `target-${index}-${Date.now()}`,
      type: typeKey,
      x,
      y: baseY + (Math.random() - 0.5) * 40,
      speed,
      angle,
      points: targetType.points,
      distance,
      scale,
      active: true,
      spawnTime: Date.now()
    }]);
    
    setTotalTargets(prev => prev + 1);
  }, []);

  // Start spawning targets for scenario
  const startTargetSpawning = useCallback((scenario) => {
    const levelData = LEVELS[scenario.level] || LEVELS[1];
    const [minInterval, maxInterval] = levelData.spawnInterval;
    spawnedCountRef.current = 0;
    
    const spawnNext = () => {
      if (gameScreenRef.current === 'paused') {
        targetSpawnRef.current = setTimeout(spawnNext, 250);
        return;
      }
      if (gameScreenRef.current !== 'playing') return;
      if (spawnedCountRef.current >= scenario.targetCount) {
        return;
      }
      
      // Check simultaneous target limit
      const activeCount = targetsRef.current.filter(t => t.active).length;
      if (activeCount < levelData.simultaneousTargets) {
        spawnTarget(scenario, spawnedCountRef.current);
        spawnedCountRef.current++;
      }
      
      // Schedule next spawn
      const interval = minInterval + Math.random() * (maxInterval - minInterval);
      targetSpawnRef.current = setTimeout(spawnNext, interval);
    };
    
    // Start spawning after initial delay
    targetSpawnRef.current = setTimeout(spawnNext, 1500);
  }, [spawnTarget]);

  // Start a scenario
  const startScenario = useCallback((scenario, weapon) => {
    // Clear any existing intervals
    clearInterval(gameLoopRef.current);
    clearInterval(timerRef.current);
    clearTimeout(targetSpawnRef.current);
    clearTimeout(initialSpawnRef.current);
    
    setCurrentScenario(scenario);
    setCurrentWeapon(weapon);
    setGameScreen('playing');
    setScore(0);
    setCombo(0);
    setAccuracy(0);
    setTargets([]);
    setTargetsHit(0);
    setTotalTargets(0);
    setTimeLeft(scenario.timeLimit);
    setAmmo(weapon.magazineSize);
    setSessionStats({
      totalShots: 0,
      hits: 0,
      misses: 0,
      vitalHits: 0,
      bodyHits: 0,
      grazeHits: 0,
      maxCombo: 0
    });
    setCurrentDistance(scenario.distances[0] || 100);
    spawnedCountRef.current = 0;
    
    // Start spawning targets
    initialSpawnRef.current = setTimeout(() => {
      if (gameScreenRef.current === 'playing') startTargetSpawning(scenario);
    }, 1000);
  }, [startTargetSpawning]);

  // Handle shooting with ballistics
  const handleShoot = useCallback((position) => {
    if (isReloading || ammo <= 0) {
      return;
    }

    // Decrease ammo
    setAmmo(prev => prev - 1);
    
    // Update shots
    setSessionStats(prev => ({ ...prev, totalShots: prev.totalShots + 1 }));

    // Calculate bullet drop effect on hit detection
    const bulletDrop = currentWeapon?.bulletDrop?.[currentDistance] || 0;
    const dropOffset = (bulletDrop * currentDistance / 200) * 0.3;
    const adjustedY = position.y + dropOffset;

    // Check for hits
    let hitTarget = null;
    let hitZone = null;
    
    const nextTargets = targetsRef.current.map(target => {
        if (!target.active || hitTarget) return target;
        
        const baseSize = 70 * target.scale;
        
        // Vital zone (heart/lung area - center-front of body)
        const vitalX = target.x + baseSize * 0.15;
        const vitalY = target.y - baseSize * 0.02;
        const vitalRadius = baseSize * HIT_ZONES.vital.radius;
        const vitalDist = Math.sqrt(
          Math.pow(position.x - vitalX, 2) + 
          Math.pow(adjustedY - vitalY, 2)
        );
        
        if (vitalDist < vitalRadius) {
          hitTarget = target;
          hitZone = 'vital';
          return { ...target, active: false };
        }
        
        // Body zone
        const bodyDist = Math.sqrt(
          Math.pow(position.x - target.x, 2) + 
          Math.pow(adjustedY - target.y, 2)
        );
        const bodyRadius = baseSize * HIT_ZONES.body.radius;
        
        if (bodyDist < bodyRadius) {
          hitTarget = target;
          hitZone = 'body';
          return { ...target, active: false };
        }
        
        // Graze zone
        const grazeRadius = baseSize * HIT_ZONES.graze.radius;
        if (bodyDist < grazeRadius) {
          hitTarget = target;
          hitZone = 'graze';
          return { ...target, active: false };
        }
        
        return target;
      });
    targetsRef.current = nextTargets;
    setTargets(nextTargets);

    if (hitTarget) {
      // Calculate points
      const zoneMultiplier = HIT_ZONES[hitZone].multiplier;
      const basePoints = hitTarget.points;
      const comboMultiplier = 1 + (combo * 0.15);
      const distanceBonus = hitTarget.distance > 300 ? 1.5 : hitTarget.distance > 150 ? 1.2 : 1;
      const speedBonus = hitTarget.speed > 15 ? 1.5 : hitTarget.speed > 8 ? 1.2 : 1;
      const points = Math.floor(basePoints * zoneMultiplier * comboMultiplier * distanceBonus * speedBonus);
      
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
  }, [ammo, combo, isReloading, currentWeapon, currentDistance]);

  // Reload weapon
  const reload = useCallback(() => {
    if (isReloading || !currentWeapon) return;
    setIsReloading(true);
    
    setTimeout(() => {
      setAmmo(currentWeapon.magazineSize);
      setIsReloading(false);
    }, currentWeapon.reloadTime);
  }, [currentWeapon, isReloading]);

  // Calculate experience gained
  const calculateXP = useCallback((finalStats, finalScore) => {
    let xp = 0;
    
    // Base XP from score
    xp += Math.floor(finalScore / 10);
    
    // Accuracy bonus
    if (finalStats.totalShots > 0) {
      const acc = (finalStats.hits / finalStats.totalShots) * 100;
      if (acc >= 80) xp += 200;
      else if (acc >= 60) xp += 100;
      else if (acc >= 40) xp += 50;
    }
    
    // Vital hits bonus
    xp += finalStats.vitalHits * 20;
    
    // Combo bonus
    xp += finalStats.maxCombo * 10;
    
    return xp;
  }, []);

  // Check level up
  const checkLevelUp = useCallback((currentXP) => {
    let newLevel = 1;
    for (let lvl = 5; lvl >= 1; lvl--) {
      if (currentXP >= XP_PER_LEVEL[lvl]) {
        newLevel = lvl;
        break;
      }
    }
    return newLevel;
  }, []);

  // End game
  const endGame = useCallback(() => {
    clearInterval(gameLoopRef.current);
    clearInterval(timerRef.current);
    clearTimeout(targetSpawnRef.current);
    setGameScreen('gameover');
    
    // Calculate XP
    const xpGained = calculateXP(sessionStats, score);
    const newTotalXP = playerStats.experience + xpGained;
    const newLevel = checkLevelUp(newTotalXP);
    
    // Unlock new weapons if leveled up
    let newWeaponsUnlocked = [...playerStats.weaponsUnlocked];
    if (newLevel > playerStats.currentLevel) {
      const levelWeapons = LEVELS[newLevel]?.weapons || [];
      levelWeapons.forEach(weaponId => {
        if (!newWeaponsUnlocked.includes(weaponId)) {
          newWeaponsUnlocked.push(weaponId);
        }
      });
    }
    
    // Update player stats
    setPlayerStats(prev => {
      const finalAccuracy = sessionStats.totalShots > 0 
        ? (sessionStats.hits / sessionStats.totalShots) * 100 
        : 0;
      
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
        highScore: Math.max(prev.highScore, score),
        experience: newTotalXP,
        currentLevel: newLevel,
        weaponsUnlocked: newWeaponsUnlocked
      };
      
      // Mark scenario as completed if accuracy meets requirement
      const requiredAccuracy = LEVELS[currentScenario?.level]?.requiredAccuracy || 50;
      if (finalAccuracy >= requiredAccuracy && currentScenario && !prev.scenariosCompleted.includes(currentScenario.id)) {
        newStats.scenariosCompleted = [...prev.scenariosCompleted, currentScenario.id];
      }
      
      return newStats;
    });
  }, [sessionStats, score, currentScenario, playerStats, calculateXP, checkLevelUp]);

  // Check if all targets are done
  useEffect(() => {
    if (gameScreen === 'playing' && currentScenario) {
      const activeTargets = targets.filter(t => t.active).length;
      const allSpawned = spawnedCountRef.current >= currentScenario.targetCount;
      
      if (allSpawned && activeTargets === 0 && targetsHit > 0) {
        setTimeout(() => endGame(), 1500);
      }
    }
  }, [targets, targetsHit, currentScenario, gameScreen, endGame]);

  // Pause/Resume
  const togglePause = () => {
    setGameScreen(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  // Handle weapon selection
  const handleSelectWeapon = useCallback((weapon) => {
    setCurrentWeapon(weapon);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'r' || e.key === 'R') {
        reload();
      } else if (e.key === 'Escape') {
        if (gameScreen === 'playing') togglePause();
      } else if (e.key === ' ' && gameScreen === 'paused') {
        togglePause();
      } else if (e.key === 'b' || e.key === 'B') {
        setShowBallistics(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameScreen, reload]);

  // Render based on game screen
  if (gameScreen === 'menu') {
    return (
      <div className="relative">
      <button type="button" data-testid="practice-exit" onClick={onExit}
        className="absolute right-4 top-4 z-50 rounded bg-stone-800 px-4 py-2 text-amber-400">
        Back to Hog Island
      </button>
      <MainMenu 
        onStartScenario={startScenario}
        playerStats={playerStats}
        currentWeapon={currentWeapon}
        onSelectWeapon={handleSelectWeapon}
      />
      </div>
    );
  }

  if (gameScreen === 'gameover') {
    const finalAccuracy = sessionStats.totalShots > 0 
      ? (sessionStats.hits / sessionStats.totalShots) * 100 
      : 0;
    const xpGained = calculateXP(sessionStats, score);
    
    return (
      <div className="relative">
      <button type="button" data-testid="practice-exit" onClick={onExit}
        className="absolute right-4 top-4 z-50 rounded bg-stone-800 px-4 py-2 text-amber-400">
        Back to Hog Island
      </button>
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
        xpGained={xpGained}
        playerLevel={playerStats.currentLevel}
        onRestart={() => startScenario(currentScenario, currentWeapon)}
        onMainMenu={() => setGameScreen('menu')}
      />
      </div>
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
        playerLevel={playerStats.currentLevel}
      />
      
      {/* Game Area */}
      <div className="flex-1 flex items-start justify-center p-4 relative gap-4">
        {/* Ballistics Panel */}
        {showBallistics && (
          <div className="hidden lg:block w-64 flex-shrink-0">
            <BallisticsDisplay 
              weapon={currentWeapon}
              currentDistance={currentDistance}
              show={showBallistics}
            />
          </div>
        )}
        
        {/* Main Game Area */}
        <div className="relative flex-1 max-w-[1400px]">
          {/* Controls Bar */}
          <div className="absolute top-2 right-2 flex gap-2 z-20">
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
              onClick={() => setShowBallistics(!showBallistics)}
              variant="outline"
              size="sm"
              className="bg-stone-800/80 border-stone-600 text-stone-300 hover:bg-stone-700"
              title="Toggle Ballistics (B)"
            >
              {showBallistics ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
            playerLevel={playerStats.currentLevel}
            showBulletDrop={showBallistics}
          />
          
          {/* Pause Overlay */}
          {gameScreen === 'paused' && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-30 rounded-lg">
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
            <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-black/80 text-amber-400 px-6 py-3 rounded-lg font-mono text-lg animate-pulse border border-amber-600/50">
              RELOADING...
            </div>
          )}
        </div>
      </div>
      
      {/* Controls Help */}
      <div className="bg-stone-900 border-t border-stone-800 px-6 py-2">
        <div className="flex justify-center gap-6 text-sm text-stone-500">
          <span><kbd className="px-2 py-0.5 bg-stone-800 rounded text-stone-300 font-mono text-xs">CLICK</kbd> Shoot</span>
          <span><kbd className="px-2 py-0.5 bg-stone-800 rounded text-stone-300 font-mono text-xs">R</kbd> Reload</span>
          <span><kbd className="px-2 py-0.5 bg-stone-800 rounded text-stone-300 font-mono text-xs">B</kbd> Ballistics</span>
          <span><kbd className="px-2 py-0.5 bg-stone-800 rounded text-stone-300 font-mono text-xs">ESC</kbd> Pause</span>
        </div>
      </div>
    </div>
  );
};

export default PracticeRange;
