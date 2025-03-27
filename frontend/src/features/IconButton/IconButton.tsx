"use client";
import React from "react";
import { Button } from "@/components/ui/button";

export type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export type IconButtonProps = {
  icon: IconComponent;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  iconClassName?: string;
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  onClick,
  className = "",
  iconClassName = "h-5 w-5",
}) => {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="icon"
      className={`rounded-full w-12 h-12 bg-[#b3cfad] backdrop-blur-md border-white/20 text-white hover:bg-white/20 ${className}`}
    >
      <Icon className={iconClassName} />
    </Button>
  );
};
