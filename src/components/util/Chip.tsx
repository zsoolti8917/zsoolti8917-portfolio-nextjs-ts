import React from "react";

export const Chip = ({ children }: { children: string }) => {
  return (
    <span className="rounded-md border border-hairline bg-surface-2 px-2 py-1 font-mono mono-1 text-xs text-fg-2">
      {children}
    </span>
  );
};
