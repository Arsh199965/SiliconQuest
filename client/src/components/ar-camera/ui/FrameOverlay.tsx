export const FrameOverlay = () => (
  <div className="absolute inset-0 pointer-events-none">
    <svg
      className="w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <line x1="5" y1="5" x2="20" y2="5" stroke="#8b5cf6" strokeWidth="3" />
      <line x1="5" y1="5" x2="5" y2="20" stroke="#8b5cf6" strokeWidth="3" />
      <line x1="95" y1="5" x2="80" y2="5" stroke="#8b5cf6" strokeWidth="3" />
      <line x1="95" y1="5" x2="95" y2="20" stroke="#8b5cf6" strokeWidth="3" />
      <line x1="5" y1="95" x2="20" y2="95" stroke="#8b5cf6" strokeWidth="3" />
      <line x1="5" y1="95" x2="5" y2="80" stroke="#8b5cf6" strokeWidth="3" />
      <line x1="95" y1="95" x2="80" y2="95" stroke="#8b5cf6" strokeWidth="3" />
      <line x1="95" y1="95" x2="95" y2="80" stroke="#8b5cf6" strokeWidth="3" />
    </svg>
  </div>
);
