import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size={collapsed ? "icon" : "default"}
      onClick={toggleTheme}
      className={collapsed ? "w-9 h-9" : "w-full justify-start gap-3"}
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Mode clair</span>}
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Mode sombre</span>}
        </>
      )}
    </Button>
  );
}
