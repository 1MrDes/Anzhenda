import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, FileText, User } from "lucide-react";

const navItems = [
  { path: "/", label: "首页", icon: Home },
  { path: "/booking", label: "预约", icon: Calendar },
  { path: "/orders", label: "订单", icon: FileText },
  { path: "/profile", label: "我的", icon: User },
];

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white"
      style={{
        borderTop: "1px solid #E8E5E0",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-center justify-around" style={{ height: 72 }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-1 no-underline"
              style={{
                minWidth: 64,
                minHeight: 48,
                color: active ? "#2B9A6F" : "#9CA3AF",
                transition: "color 200ms ease",
              }}
            >
              <Icon
                size={24}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span
                className="font-medium"
                style={{ fontSize: 14, lineHeight: 1 }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
