import React, { useRef, useEffect, useState, useCallback } from 'react';
import { mphToPixelsPerSecond } from '../../data/mockData';

const GameCanvas = ({ 
  gameState, 
  targets, 
  onShoot, 
  weapon, 
  ammo,
  crosshairPosition,
  setCrosshairPosition,
  hitMarkers,
  currentDistance,
  playerLevel,
  showBulletDrop = true
}) => {
  const canvasRef = useRef(null);
  const [canvasSize] = useState({ width: 1400, height: 700 });

  // Calculate bullet drop offset for crosshair
  const getBulletDropOffset = useCallback(() => {
    if (!weapon || !weapon.bulletDrop || !showBulletDrop) return 0;
    const drop = weapon.bulletDrop[currentDistance] || 0;
    // Scale drop to pixels (rough approximation)
    // At 100 yards, 1 inch of drop = ~0.5 pixels on our scale
    const scaleFactor = currentDistance / 200;
    return drop * scaleFactor * 0.3;
  }, [weapon, currentDistance, showBulletDrop]);

  // Draw the game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = canvasSize;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw sky gradient (time of day effect)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.65);
    skyGradient.addColorStop(0, '#0c1929');
    skyGradient.addColorStop(0.3, '#1e3a5f');
    skyGradient.addColorStop(0.7, '#3d6b99');
    skyGradient.addColorStop(1, '#6b9bc3');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height * 0.65);
    
    // Draw distant island silhouette (Hog Island)
    ctx.fillStyle = '#1a2f1a';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.55);
    ctx.bezierCurveTo(200, height * 0.45, 400, height * 0.40, 600, height * 0.42);
    ctx.bezierCurveTo(800, height * 0.38, 1000, height * 0.35, 1100, height * 0.40);
    ctx.bezierCurveTo(1200, height * 0.45, 1350, height * 0.48, 1400, height * 0.52);
    ctx.lineTo(width, height * 0.65);
    ctx.lineTo(0, height * 0.65);
    ctx.closePath();
    ctx.fill();
    
    // Draw mid-ground hills
    ctx.fillStyle = '#2d4a2d';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.58);
    ctx.quadraticCurveTo(200, height * 0.50, 350, height * 0.55);
    ctx.quadraticCurveTo(500, height * 0.48, 700, height * 0.52);
    ctx.quadraticCurveTo(900, height * 0.46, 1100, height * 0.50);
    ctx.quadraticCurveTo(1250, height * 0.54, 1400, height * 0.56);
    ctx.lineTo(width, height * 0.65);
    ctx.lineTo(0, height * 0.65);
    ctx.closePath();
    ctx.fill();
    
    // Draw ground/range
    const groundGradient = ctx.createLinearGradient(0, height * 0.65, 0, height);
    groundGradient.addColorStop(0, '#4a5d3a');
    groundGradient.addColorStop(0.2, '#3d4f2f');
    groundGradient.addColorStop(0.5, '#2f3d24');
    groundGradient.addColorStop(1, '#232d1b');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, height * 0.65, width, height * 0.35);
    
    // Draw range distance markers
    const distances = [25, 50, 100, 150, 200, 300, 500, 750, 1000];
    distances.forEach((dist, i) => {
      // Perspective: closer distances at bottom, farther at top
      const yOffset = height * 0.65 - (Math.log(dist) / Math.log(1000)) * (height * 0.25);
      const xPos = 80;
      
      // Only show markers within weapon range
      if (weapon && dist > weapon.maxRange) return;
      
      // Distance post
      ctx.fillStyle = '#5c4a3a';
      ctx.fillRect(xPos, yOffset - 2, 6, 25);
      
      // Distance sign
      const isActive = currentDistance === dist;
      ctx.fillStyle = isActive ? '#fbbf24' : '#e5e5e5';
      ctx.fillRect(xPos - 25, yOffset - 15, 55, 20);
      
      // Sign border
      ctx.strokeStyle = isActive ? '#f59e0b' : '#9ca3af';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(xPos - 25, yOffset - 15, 55, 20);
      
      ctx.fillStyle = isActive ? '#000' : '#374151';
      ctx.font = isActive ? 'bold 11px monospace' : '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${dist}yd`, xPos + 2, yOffset - 1);
    });
    
    // Draw targets (hog silhouettes)
    targets.forEach(target => {
      if (!target.active) return;
      
      const { x, y, scale, angle, speed, type } = target;
      const baseSize = 70 * scale;
      
      // Determine direction based on angle
      const facingRight = Math.cos(angle * Math.PI / 180) >= 0;
      
      ctx.save();
      ctx.translate(x, y);
      
      // Flip if facing left
      if (!facingRight) {
        ctx.scale(-1, 1);
      }
      
      // Rotate slightly based on movement
      const tilt = Math.sin(Date.now() / 200) * (speed > 10 ? 3 : 1) * Math.PI / 180;
      ctx.rotate(tilt);
      
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(5, baseSize * 0.45, baseSize * 0.7, baseSize * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Body - darker for realism
      const isCharging = type === 'charging' || type === 'running';
      ctx.fillStyle = isCharging ? '#1a1a1a' : '#252525';
      ctx.beginPath();
      ctx.ellipse(0, 0, baseSize * 0.75, baseSize * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Bristly texture
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const bx = (Math.random() - 0.5) * baseSize;
        const by = (Math.random() - 0.5) * baseSize * 0.6;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx, by - 5);
        ctx.stroke();
      }
      
      // Head
      ctx.fillStyle = isCharging ? '#1a1a1a' : '#252525';
      ctx.beginPath();
      ctx.ellipse(baseSize * 0.55, -baseSize * 0.08, baseSize * 0.32, baseSize * 0.28, 0.15, 0, Math.PI * 2);
      ctx.fill();
      
      // Snout
      ctx.fillStyle = '#2d2d2d';
      ctx.beginPath();
      ctx.ellipse(baseSize * 0.85, baseSize * 0.02, baseSize * 0.14, baseSize * 0.11, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Snout disc
      ctx.fillStyle = '#4a4a4a';
      ctx.beginPath();
      ctx.ellipse(baseSize * 0.95, baseSize * 0.02, baseSize * 0.06, baseSize * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Nostrils
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(baseSize * 0.93, baseSize * 0.0, 2, 0, Math.PI * 2);
      ctx.arc(baseSize * 0.93, baseSize * 0.04, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Tusks (larger for boars)
      if (scale > 0.5) {
        ctx.fillStyle = '#f5f5dc';
        ctx.beginPath();
        ctx.moveTo(baseSize * 0.72, baseSize * 0.12);
        ctx.quadraticCurveTo(baseSize * 0.85, baseSize * 0.25, baseSize * 0.78, baseSize * 0.08);
        ctx.quadraticCurveTo(baseSize * 0.70, baseSize * 0.15, baseSize * 0.72, baseSize * 0.12);
        ctx.fill();
        
        // Second tusk
        ctx.beginPath();
        ctx.moveTo(baseSize * 0.75, baseSize * 0.18);
        ctx.quadraticCurveTo(baseSize * 0.90, baseSize * 0.30, baseSize * 0.82, baseSize * 0.15);
        ctx.fill();
      }
      
      // Ear
      ctx.fillStyle = '#2d2d2d';
      ctx.beginPath();
      ctx.ellipse(baseSize * 0.35, -baseSize * 0.32, baseSize * 0.12, baseSize * 0.18, -0.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Eye - red glow for aggressive hogs
      const eyeGlow = isCharging ? '#ff2222' : '#ff6644';
      ctx.fillStyle = eyeGlow;
      ctx.shadowColor = eyeGlow;
      ctx.shadowBlur = isCharging ? 8 : 4;
      ctx.beginPath();
      ctx.arc(baseSize * 0.52, -baseSize * 0.12, isCharging ? 5 : 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Legs (animated based on speed)
      ctx.fillStyle = '#252525';
      const legPhase = (Date.now() / (200 - speed * 5)) % (Math.PI * 2);
      const legOffsets = speed > 5 ? [
        Math.sin(legPhase) * 8,
        Math.sin(legPhase + Math.PI) * 8,
        Math.sin(legPhase + Math.PI * 0.5) * 8,
        Math.sin(legPhase + Math.PI * 1.5) * 8
      ] : [0, 0, 0, 0];
      
      [-0.35, -0.05, 0.25, 0.45].forEach((offset, i) => {
        ctx.fillRect(
          baseSize * offset - 4 + legOffsets[i], 
          baseSize * 0.32, 
          9, 
          baseSize * 0.28
        );
      });
      
      // Vital zone indicator (training mode)
      if (gameState === 'playing') {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(baseSize * 0.15, -baseSize * 0.02, baseSize * 0.22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      ctx.restore();
    });
    
    // Draw hit markers with animations
    hitMarkers.forEach(marker => {
      const elapsed = Date.now() - marker.time;
      const alpha = Math.max(0, 1 - elapsed / 600);
      const rise = elapsed * 0.05;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      
      // Hit marker X
      const markerSize = marker.zone === 'vital' ? 15 : 10;
      ctx.strokeStyle = marker.zone === 'vital' ? '#ef4444' : 
                        marker.zone === 'body' ? '#f97316' : '#eab308';
      ctx.lineWidth = marker.zone === 'vital' ? 4 : 3;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(marker.x - markerSize, marker.y - markerSize - rise);
      ctx.lineTo(marker.x + markerSize, marker.y + markerSize - rise);
      ctx.moveTo(marker.x + markerSize, marker.y - markerSize - rise);
      ctx.lineTo(marker.x - markerSize, marker.y + markerSize - rise);
      ctx.stroke();
      
      // Points text
      ctx.fillStyle = marker.zone === 'vital' ? '#ef4444' : '#ffffff';
      ctx.font = `bold ${marker.zone === 'vital' ? 18 : 14}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(marker.text, marker.x, marker.y - 25 - rise);
      
      // Zone label
      ctx.font = '10px monospace';
      ctx.fillStyle = marker.zone === 'vital' ? '#fca5a5' : '#d4d4d4';
      ctx.fillText(marker.zone.toUpperCase(), marker.x, marker.y - 40 - rise);
      
      ctx.restore();
    });
    
    // Draw crosshair/scope
    if (crosshairPosition && gameState === 'playing') {
      const { x, y } = crosshairPosition;
      const bulletDrop = getBulletDropOffset();
      const aimY = y + bulletDrop; // Adjusted aim point
      
      // Scope outer ring
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 50, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 51, 0, Math.PI * 2);
      ctx.stroke();
      
      // Scope glass tint
      ctx.fillStyle = 'rgba(200, 220, 255, 0.05)';
      ctx.beginPath();
      ctx.arc(x, y, 48, 0, Math.PI * 2);
      ctx.fill();
      
      // Crosshair - main lines
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'butt';
      
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(x - 45, y);
      ctx.lineTo(x - 10, y);
      ctx.moveTo(x + 10, y);
      ctx.lineTo(x + 45, y);
      ctx.stroke();
      
      // Vertical
      ctx.beginPath();
      ctx.moveTo(x, y - 45);
      ctx.lineTo(x, y - 10);
      ctx.moveTo(x, y + 10);
      ctx.lineTo(x, y + 45);
      ctx.stroke();
      
      // Center dot\n      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Mil-dot reticle (for range estimation)
      ctx.fillStyle = '#ff0000';
      for (let i = 1; i <= 4; i++) {
        // Vertical mil-dots (for bullet drop)
        ctx.beginPath();
        ctx.arc(x, y + (i * 10), 2, 0, Math.PI * 2);
        ctx.fill();
        \n        // Horizontal mil-dots (for windage/lead)
        ctx.beginPath();
        ctx.arc(x - (i * 10), y, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + (i * 10), y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Bullet drop indicator line (where bullet will actually hit)
      if (bulletDrop > 5) {
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(x - 8, aimY);
        ctx.lineTo(x + 8, aimY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Drop amount label
        ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${weapon?.bulletDrop?.[currentDistance] || 0}\"`, x + 12, aimY + 3);
      }
    }
    
  }, [canvasSize, targets, crosshairPosition, hitMarkers, gameState, currentDistance, weapon, getBulletDropOffset, showBulletDrop]);

  // Handle mouse movement
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setCrosshairPosition({ x, y });
  }, [setCrosshairPosition]);

  // Handle click (shoot)
  const handleClick = useCallback((e) => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    onShoot({ x, y });
  }, [gameState, onShoot]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="border-4 border-stone-800 rounded-lg shadow-2xl w-full max-w-[1400px]"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        style={{ cursor: 'none' }}
      />
      
      {/* Ammo counter overlay */}
      <div className="absolute bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg font-mono backdrop-blur-sm border border-stone-700">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-stone-400 text-xs block">WEAPON</span>
            <span className="text-amber-400 font-semibold">{weapon?.name || 'None'}</span>
          </div>
          <div className="h-8 w-px bg-stone-600" />
          <div>
            <span className="text-stone-400 text-xs block">AMMO</span>
            <div className="flex gap-0.5">
              {Array.from({ length: Math.min(weapon?.magazineSize || 10, 15) }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-5 rounded-sm transition-colors ${
                    i < ammo ? 'bg-amber-400' : 'bg-stone-700'
                  }`}
                />
              ))}
              {weapon?.magazineSize > 15 && (
                <span className="text-amber-400 text-sm ml-1">+{weapon.magazineSize - 15}</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Distance indicator */}
      <div className="absolute top-4 left-4 bg-black/80 text-white px-4 py-2 rounded-lg font-mono backdrop-blur-sm border border-stone-700">
        <span className="text-stone-400 text-xs block">TARGET RANGE</span>
        <span className="text-green-400 font-bold text-xl">{currentDistance}</span>
        <span className="text-stone-400 text-sm ml-1">yards</span>
      </div>
      
      {/* Level indicator */}
      <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-lg font-mono backdrop-blur-sm border border-stone-700">
        <span className="text-amber-400 font-semibold">Level {playerLevel}</span>
      </div>
    </div>
  );
};

export default GameCanvas;
