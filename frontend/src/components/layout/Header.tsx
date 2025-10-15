import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const links = [
  { label: "Home", path: "/" },
  { label: "Sessions", path: "/sessions" },
  { label: "Map", path: "/map" },
];

export default function Header() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-black/40 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex flex-col leading-none">
          <span className="text-2xl font-extrabold text-white tracking-tight">VICTVS</span>
          <span className="text-xs text-muted-foreground">Exam Scheduler</span>
        </Link>

        <nav className="flex gap-2">
          {links.map((link) => {
            const active = pathname === link.path;
            return (
              <Button
                key={link.path}
                asChild
                variant={active ? "secondary" : "ghost"}
                className="text-sm"
              >
                <Link to={link.path}>{link.label}</Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
