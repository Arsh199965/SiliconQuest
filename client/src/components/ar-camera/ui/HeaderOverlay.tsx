interface HeaderOverlayProps {
  teamName: string;
  onClose: () => void;
}

export const HeaderOverlay = ({ teamName, onClose }: HeaderOverlayProps) => (
  <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-20">
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-white font-bold text-lg">Hunt is On!!</h2>
        <p className="text-purple-300 text-sm">Team: {teamName}</p>
      </div>
      <button
        onClick={onClose}
        className="w-10 h-10 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all"
        aria-label="Close AR camera"
      >
        ✕
      </button>
    </div>
  </div>
);
