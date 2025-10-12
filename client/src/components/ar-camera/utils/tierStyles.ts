export const getTierColor = (tier: string) => {
  switch (tier) {
    case "Legendary":
      return "from-amber-400 to-orange-500";
    case "Rare":
      return "from-purple-400 to-pink-500";
    case "Common":
      return "from-slate-400 to-slate-500";
    default:
      return "from-slate-400 to-slate-500";
  }
};

export const getTierBorder = (tier: string) => {
  switch (tier) {
    case "Legendary":
      return "border-amber-400 shadow-amber-500/50";
    case "Rare":
      return "border-purple-400 shadow-purple-500/50";
    case "Common":
      return "border-slate-400 shadow-slate-500/50";
    default:
      return "border-slate-400 shadow-slate-500/50";
  }
};
