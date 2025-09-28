"use client";

import * as React from "react";

type ButtonSize = "sm" | "md" | "lg";
type ButtonVariant = "default" | "outline";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  variant?: ButtonVariant;
}

function classNames(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
  outline:
    "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = "md", variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={classNames(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;


