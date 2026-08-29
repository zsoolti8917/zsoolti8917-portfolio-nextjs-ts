import React from "react";
import { IconType } from "react-icons";

interface Props {
  children: React.ReactNode;
  label?: string;
  Icon?: IconType;
  className?: string;
}

export const Tile = ({ children, label, Icon, className = "" }: Props) => (
  <div
    className={`rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 transition-colors hover:border-indigo-500/50 ${className}`}
  >
    {label && (
      <h4 className="mb-4 flex items-center gap-2">
        {Icon && <Icon className="text-lg text-indigo-500" />}
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          {label}
        </span>
      </h4>
    )}
    {children}
  </div>
);
