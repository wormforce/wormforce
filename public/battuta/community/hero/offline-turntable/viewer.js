(() => {
  const image = document.getElementById('turntable-image');
  const slider = document.getElementById('angle');
  const play = document.getElementById('play');
  const status = document.getElementById('status');
  const previous = document.getElementById('previous');
  const next = document.getElementById('next');
  const degrees = document.getElementById('degrees');
  const frames = [];
  let index = 0, ready = false, timer = null, playing = false;
  const show = value => {
    if (!ready) return;
    index = ((value % frames.length) + frames.length) % frames.length;
    image.src = frames[index].src;
    image.alt = `机械键盘轴体，旋转角度 ${index * 5} 度`;
    slider.value = String(index);
    slider.setAttribute('aria-valuetext', `${index * 5} 度`);
    degrees.setAttribute('aria-live', 'off');
    degrees.value = `${index * 5}°`;
  };
  const sync = () => {
    clearInterval(timer);
    timer = null;
    play.setAttribute('aria-pressed', String(playing));
    play.textContent = playing ? '暂停旋转' : '自动旋转';
    if (playing && !document.hidden) timer = setInterval(() => show(index + 1), 100);
  };
  const stop = () => { playing = false; sync(); };
  play.addEventListener('click', () => { playing = !playing; sync(); });
  previous.addEventListener('click', () => { stop(); show(index - 1); });
  next.addEventListener('click', () => { stop(); show(index + 1); });
  slider.addEventListener('input', () => { stop(); show(Number(slider.value)); });
  let drag = null;
  image.addEventListener('pointerdown', event => {
    if (!ready || (event.pointerType === 'mouse' && event.button !== 0)) return;
    stop(); drag = { x: event.clientX, index }; image.setPointerCapture(event.pointerId);
  });
  image.addEventListener('pointermove', event => {
    if (drag) show(drag.index + Math.round((event.clientX - drag.x) / 7));
  });
  image.addEventListener('pointerup', () => { drag = null; });
  image.addEventListener('pointercancel', () => { drag = null; });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', stop);
  const load = async () => {
    try {
      const response = await fetch('manifest.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Rendering');
      const manifest = await response.json();
      if (!manifest.complete || manifest.frames.length !== 72) throw new Error('Incomplete');
      let loaded = 0;
      // Four concurrent requests keep loading bounded; controls only unlock once
      // every angle has decoded, so dragging never shows a blank/fallback frame.
      let cursor = 0;
      await Promise.all(Array.from({ length: 4 }, async () => {
        while (cursor < manifest.frames.length) {
          const position = cursor++;
          const item = new Image(); item.src = manifest.frames[position];
          await item.decode(); frames[position] = item;
          loaded += 1; status.textContent = `已加载 ${loaded}/72 个角度…`;
        }
      }));
      ready = true;
      for (const control of [previous, next, play, slider]) control.disabled = false;
      show(0);
      status.textContent = `整圈已加载 · ${(manifest.bytes / 1024 / 1024).toFixed(1)} MiB · 左右拖动查看`;
    } catch {
      status.textContent = '完整序列尚未就绪或加载失败，15 秒后自动重试。';
      setTimeout(load, 15000);
    }
  };
  load();
})();
