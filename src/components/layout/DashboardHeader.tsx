import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plane, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useProfile } from '@/hooks/useProfile';
import { Link } from 'react-router-dom';

export function DashboardHeader() {
  const { signOut } = useAuth();
  const { data: profile } = useProfile();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-primary/20 backdrop-blur-xl bg-card/80">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="hover:bg-secondary/80" />
        <Link to="/dashboard" className="flex items-center gap-2">
          <Plane className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg text-foreground">DroneHub</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {profile?.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-card/95 backdrop-blur-xl border-primary/20" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-foreground">
                  {profile?.name || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile?.role || 'user'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-primary/20" />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-primary/20" />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}