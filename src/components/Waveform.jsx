import { useMemo } from 'react';

function Waveform({ isActive }) {
  const bars = useMemo(() => {
    return Array.from({ length: 32 }, (_, i) => {
      const height = Math.random() * 20 + 6;
      const delay = Math.random() * 0.6;
      return { height, delay };
    });
  }, []);

  return (
    <div
      className="waveform-container"
      style={{
        background: isActive
          ? 'linear-gradient(180deg, rgba(124, 58, 237, 0.05) 0%, transparent 100%)'
          : 'transparent',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'background 0.3s ease',
      }}
    >
      {bars.map((bar, i) => (
        <div
          key={i}
          className={`waveform-bar ${isActive ? 'active' : ''}`}
          style={{
            height: isActive ? undefined : '4px',
            '--bar-height': `${bar.height}px`,
            animationDelay: `${bar.delay}s`,
            opacity: isActive ? undefined : 0.2,
          }}
        />
      ))}
    </div>
  );
}

export default Waveform;
