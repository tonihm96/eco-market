import { LayoutDashboard, LogOut, Package, Receipt, Sprout, Tags, Users } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Visão geral", icon: LayoutDashboard },
  { to: "/users", label: "Usuários", icon: Users },
  { to: "/products", label: "Produtos", icon: Package },
  { to: "/orders", label: "Pedidos", icon: Receipt },
  { to: "/categories", label: "Categorias", icon: Tags },
];

export const Layout = () => {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  const onSignOut = async () => {
    await authClient.signOut();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col border-r bg-card p-4">
        <div className="mb-6 flex items-center gap-2 px-2 text-lg font-semibold text-primary">
          <Sprout className="size-6" /> Eco Market
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent",
                  isActive && "bg-accent font-medium text-accent-foreground",
                )
              }
            >
              <Icon className="size-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t pt-4 text-sm">
          <p className="truncate px-2 font-medium">{session?.user.name}</p>
          <p className="mb-2 truncate px-2 text-muted-foreground">{session?.user.email}</p>
          <Button variant="ghost" className="w-full justify-start" onClick={onSignOut}>
            <LogOut /> Sair
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export const PageHeader = ({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) => (
  <div className="mb-6 flex items-end justify-between gap-4">
    <div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      {description ? <p className="text-muted-foreground">{description}</p> : null}
    </div>
    {children}
  </div>
);
