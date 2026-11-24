import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Users, UtensilsCrossed, LogOut, Menu, X, ChefHat } from 'lucide-react';
import { useState } from 'react';
const roleRoutes = {
    manager: { path: '/dashboard/manager', label: 'Manager Dashboard', icon: LayoutDashboard },
    host: { path: '/dashboard/host', label: 'Host Station', icon: Users },
    staff: { path: '/dashboard/staff', label: 'Staff View', icon: UtensilsCrossed },
};
export function Navbar() {
    const { user, role, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };
    const dashboardRoute = role ? roleRoutes[role] : null;
    return (<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <ChefHat className="w-8 h-8 text-primary"/>
          <span className="font-display text-xl font-bold">DineFlow</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {user ? (<>
              {role === 'manager' && (<>
                  <NavLink to="/dashboard/manager" current={location.pathname}>
                    Manager
                  </NavLink>
                  <NavLink to="/dashboard/host" current={location.pathname}>
                    Host View
                  </NavLink>
                  <NavLink to="/dashboard/staff" current={location.pathname}>
                    Staff View
                  </NavLink>
                </>)}
              {role === 'host' && (<>
                  <NavLink to="/dashboard/host" current={location.pathname}>
                    Host Station
                  </NavLink>
                </>)}
              {role === 'staff' && (<>
                  <NavLink to="/dashboard/staff" current={location.pathname}>
                    Staff View
                  </NavLink>
                </>)}
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border">
                <span className="text-sm text-muted-foreground capitalize">
                  {role}
                </span>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                  <LogOut className="w-4 h-4"/>
                  Sign Out
                </Button>
              </div>
            </>) : (<>
              <NavLink to="/" current={location.pathname}>Home</NavLink>
              <NavLink to="/demo" current={location.pathname}>Demo</NavLink>
              <Link to="/auth">
                <Button>Get Started</Button>
              </Link>
            </>)}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (<div className="md:hidden border-t border-border bg-background">
          <nav className="container py-4 flex flex-col gap-2">
            {user ? (<>
                {dashboardRoute && (<MobileNavLink to={dashboardRoute.path} onClick={() => setMobileMenuOpen(false)} icon={dashboardRoute.icon}>
                    {dashboardRoute.label}
                  </MobileNavLink>)}
                <Button variant="ghost" className="justify-start gap-2" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4"/>
                  Sign Out
                </Button>
              </>) : (<>
                <MobileNavLink to="/" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </MobileNavLink>
                <MobileNavLink to="/demo" onClick={() => setMobileMenuOpen(false)}>
                  Demo
                </MobileNavLink>
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </>)}
          </nav>
        </div>)}
    </header>);
}
function NavLink({ to, current, children }) {
    const isActive = current === to;
    return (<Link to={to} className={cn('text-sm font-medium transition-colors hover:text-primary', isActive ? 'text-primary' : 'text-muted-foreground')}>
      {children}
    </Link>);
}
function MobileNavLink({ to, onClick, children, icon: Icon }) {
    return (<Link to={to} onClick={onClick} className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">
      {Icon && <Icon className="w-4 h-4"/>}
      {children}
    </Link>);
}
