export const resultCharacters = Object.freeze([
  { src: 'assets/character-oni.png', name: '온이' },
  { src: 'assets/character-woni.png', name: '원이' },
]);

// 원본 AX/DX app.js의 celebrate(): 동일한 색상, 3개 발사점, 165개 입자와 물리 효과.
export function celebrate(canvas) {
  if (!canvas) return () => {};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.remove();
    return () => {};
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); return () => {}; }
  const colors = ['#0968f7', '#7552f8', '#55c8ff', '#ffcc45', '#ff6b86'];
  const pieces = [];
  const width = innerWidth, height = innerHeight;
  canvas.width = width * devicePixelRatio;
  canvas.height = height * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  for (let burst = 0; burst < 3; burst++) {
    const originX = width * (.25 + burst * .25), originY = height * .3;
    for (let i = 0; i < 55; i++) {
      const angle = Math.random() * Math.PI * 2, speed = 4 + Math.random() * 10;
      pieces.push({ x: originX, y: originY, vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6, w: 5 + Math.random() * 7,
        h: 8 + Math.random() * 10, r: Math.random() * Math.PI,
        color: colors[i % colors.length], life: 90 + Math.random() * 45 });
    }
  }
  let frame = 0, request;
  function draw() {
    ctx.clearRect(0, 0, width, height);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += .18; p.vx *= .99; p.r += .13; p.life--;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    });
    frame++;
    if (frame < 150 && pieces.some(p => p.life > 0)) request = requestAnimationFrame(draw);
    else canvas.remove();
  }
  request = requestAnimationFrame(draw);
  return () => { cancelAnimationFrame(request); canvas.remove(); };
}
