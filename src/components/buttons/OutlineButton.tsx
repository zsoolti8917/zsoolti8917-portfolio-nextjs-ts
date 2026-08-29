import React, { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

/**
 * The sliding-fill button. The fill is a `before` circle parked off the
 * bottom-right corner that slides over the label on hover — on tokens now, so
 * the default reads as an outline on the canvas and the primary variant is a
 * one-className override (`bg-accent border-accent text-white
 * before:bg-accent-hover`) rather than a second component.
 */
type Props = {
  children: ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const OutlineButton = ({ children, className, ...rest }: Props) => {
  return (
    <button
      className={twMerge(
        `relative z-0 flex items-center gap-2 overflow-hidden rounded-md border
        border-hairline-strong px-4 py-2 text-sm font-medium
        text-fg transition-all duration-300

        before:absolute before:inset-0
        before:-z-10 before:translate-x-[150%]
        before:translate-y-[150%] before:scale-[2.5]
        before:rounded-[100%] before:bg-fg
        before:transition-transform before:duration-1000
        before:content-[""]

        hover:text-canvas
        hover:before:translate-x-[0%]
        hover:before:translate-y-[0%]
        active:scale-95`,
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
};
