import React, { useRef, useEffect, useState, useCallback } from 'react';

const GameCanvas = ({ 
  gameState, 
  targets, 
  onShoot, 
  weapon, 
  ammo,
  crosshairPosition,
  setCrosshairPosition,
  hitMarkers,
  currentDistance
}) => {
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 600 });

  // Draw the game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = canvasSize;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.7);
    skyGradient.addColorStop(0, '#1e3a5f');
    skyGradient.addColorStop(0.5, '#3d6b99');
    skyGradient.addColorStop(1, '#87CEEB');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height * 0.7);
    
    // Draw distant mountains
    ctx.fillStyle = '#4a5568';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.5);
    ctx.lineTo(150, height * 0.35);
    ctx.lineTo(300, height * 0.45);
    ctx.lineTo(450, height * 0.3);
    ctx.lineTo(600, height * 0.4);
    ctx.lineTo(750, height * 0.28);
    ctx.lineTo(900, height * 0.42);
    ctx.lineTo(1050, height * 0.32);
    ctx.lineTo(1200, height * 0.45);
    ctx.lineTo(width, height * 0.7);
    ctx.lineTo(0, height * 0.7);
    ctx.closePath();
    ctx.fill();
    
    // Draw ground
    const groundGradient = ctx.createLinearGradient(0, height * 0.7, 0, height);
    groundGradient.addColorStop(0, '#6b8e23');
    groundGradient.addColorStop(0.3, '#556b2f');
    groundGradient.addColorStop(1, '#3d4f21');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, height * 0.7, width, height * 0.3);
    
    // Draw range markers
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    const distances = [50, 100, 150, 200, 300];
    distances.forEach((dist, i) => {
      const y = height * 0.7 - (i * 30) - 20;
      const markerWidth = 60;
      
      // Distance marker post
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(50, y, 8, 40);
      
      // Distance sign
      ctx.fillStyle = currentDistance === dist ? '#fbbf24' : '#f5f5f5';
      ctx.fillRect(30, y - 5, markerWidth, 25);
      ctx.fillStyle = currentDistance === dist ? '#000' : '#333';
      ctx.font = currentDistance === dist ? 'bold 12px monospace' : '12px monospace';
      ctx.fillText(`${dist}m`, 42, y + 12);
    });
    
    // Draw targets (hog silhouettes)
    targets.forEach(target => {
      if (!target.active) return;
      
      const { x, y, type, scale } = target;
      const baseSize = 60 * scale;
      
      // Draw hog silhouette
      ctx.save();
      ctx.translate(x, y);
      
      // Body
      ctx.fillStyle = '#2d2d2d';
      ctx.beginPath();
      ctx.ellipse(0, 0, baseSize * 0.8, baseSize * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Head
      ctx.beginPath();
      ctx.ellipse(baseSize * 0.6, -baseSize * 0.1, baseSize * 0.35, baseSize * 0.3, 0.2, 0, Math.PI * 2);
      ctx.fill();
      
      // Snout
      ctx.beginPath();
      ctx.ellipse(baseSize * 0.9, 0, baseSize * 0.15, baseSize * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Tusks
      ctx.strokeStyle = '#f5f5dc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(baseSize * 0.75, baseSize * 0.1);
      ctx.quadraticCurveTo(baseSize * 0.95, baseSize * 0.25, baseSize * 0.85, baseSize * 0.05);
      ctx.stroke();
      
      // Legs
      ctx.fillStyle = '#2d2d2d';
      [-0.4, -0.1, 0.2, 0.5].forEach(offset => {
        ctx.fillRect(baseSize * offset - 4, baseSize * 0.35, 8, baseSize * 0.3);
      });
      
      // Eye (red glowing)
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(baseSize * 0.55, -baseSize * 0.15, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Vital zone indicator (subtle)
      if (gameState === 'playing') {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(baseSize * 0.2, -baseSize * 0.05, baseSize * 0.25, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      ctx.restore();
    });
    
    // Draw hit markers
    hitMarkers.forEach(marker => {
      const alpha = Math.max(0, 1 - (Date.now() - marker.time) / 500);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = marker.zone === 'vital' ? '#ef4444' : marker.zone === 'body' ? '#f97316' : '#eab308';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(marker.text, marker.x - 20, marker.y - 20);
      
      // Hit marker X
      ctx.strokeStyle = marker.zone === 'vital' ? '#ef4444' : '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(marker.x - 10, marker.y - 10);
      ctx.lineTo(marker.x + 10, marker.y + 10);
      ctx.moveTo(marker.x + 10, marker.y - 10);
      ctx.lineTo(marker.x - 10, marker.y + 10);
      ctx.stroke();
      ctx.restore();
    });
    
    // Draw crosshair/scope
    if (crosshairPosition) {
      const { x, y } = crosshairPosition;
      
      // Scope circle
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 40, 0, Math.PI * 2);
      ctx.stroke();
      
      // Crosshair lines
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 1;
      
      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(x - 35, y);
      ctx.lineTo(x - 8, y);
      ctx.moveTo(x + 8, y);
      ctx.lineTo(x + 35, y);
      ctx.stroke();
      
      // Vertical line
      ctx.beginPath();
      ctx.moveTo(x, y - 35);
      ctx.lineTo(x, y - 8);
      ctx.moveTo(x, y + 8);
      ctx.lineTo(x, y + 35);
      ctx.stroke();
      
      // Center dot
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Mil-dots
      ctx.fillStyle = '#000';
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(x, y + (i * 10), 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
  }, [canvasSize, targets, crosshairPosition, hitMarkers, gameState, currentDistance]);

  // Handle mouse movement
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCrosshairPosition({ x, y });
  }, [setCrosshairPosition]);

  // Handle click (shoot)
  const handleClick = useCallback((e) => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    onShoot({ x, y });
  }, [gameState, onShoot]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="border-4 border-stone-800 rounded-lg cursor-crosshair shadow-2xl"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        style={{ cursor: 'none' }}
      />
      
      {/* Ammo counter overlay */}
      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg font-mono">
        <div className="flex items-center gap-2">
          <span className="text-amber-400">AMMO</span>
          <div className="flex gap-1">
            {Array.from({ length: weapon?.magazineSize || 10 }).map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-6 rounded-sm ${i < ammo ? 'bg-amber-400' : 'bg-stone-600'}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Distance indicator */}
      <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg font-mono">
        <span className="text-stone-400">RANGE: </span>
        <span className="text-green-400 font-bold">{currentDistance}m</span>
      </div>
    </div>
  );
};

export default GameCanvas;
