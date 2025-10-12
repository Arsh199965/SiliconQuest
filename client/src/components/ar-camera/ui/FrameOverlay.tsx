export const FrameOverlay = () => (
  <div className="absolute inset-0 pointer-events-none">
    <svg className="w-full h-full">
      <line x1="20" y1="20" x2="60" y2="20" stroke="#8b5cf6" strokeWidth="3" />
      <line x1="20" y1="20" x2="20" y2="60" stroke="#8b5cf6" strokeWidth="3" />
      <line
        x1="calc(100% - 20)"
        y1="20"
        x2="calc(100% - 60)"
        y2="20"
        stroke="#8b5cf6"
        strokeWidth="3"
      />
      <line
        x1="calc(100% - 20)"
        y1="20"
        x2="calc(100% - 20)"
        y2="60"
        stroke="#8b5cf6"
        strokeWidth="3"
      />
      <line
        x1="20"
        y1="calc(100% - 20)"
        x2="60"
        y2="calc(100% - 20)"
        stroke="#8b5cf6"
        strokeWidth="3"
      />
      <line
        x1="20"
        y1="calc(100% - 20)"
        x2="20"
        y2="calc(100% - 60)"
        stroke="#8b5cf6"
        strokeWidth="3"
      />
      <line
        x1="calc(100% - 20)"
        y1="calc(100% - 20)"
        x2="calc(100% - 60)"
        y2="calc(100% - 20)"
        stroke="#8b5cf6"
        strokeWidth="3"
      />
      <line
        x1="calc(100% - 20)"
        y1="calc(100% - 20)"
        x2="calc(100% - 20)"
        y2="calc(100% - 60)"
        stroke="#8b5cf6"
        strokeWidth="3"
      />
    </svg>
  </div>
);
