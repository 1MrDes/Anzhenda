import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: ReactNode;
}

export function AppHeader({ title, showBack = false, rightAction }: AppHeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className="sticky top-0 z-30 flex items-center bg-white px-4"
      style={{
        height: 56,
        boxShadow: "0 1px 4px rgba(45, 45, 45, 0.06)",
      }}
    >
      {/* Left: Back button */}
      <div className="flex items-center" style={{ width: 48 }}>
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-xl"
            style={{ color: "#2D2D2D" }}
          >
            <ChevronLeft size={24} />
          </Button>
        )}
      </div>

      {/* Center: Title */}
      <h1
        className="grow text-center font-semibold"
        style={{
          fontSize: 20,
          color: "#2D2D2D",
          lineHeight: 1.3,
        }}
      >
        {title}
      </h1>

      {/* Right: Action slot */}
      <div className="flex items-center justify-end" style={{ width: 48 }}>
        {rightAction}
      </div>
    </header>
  );
}
