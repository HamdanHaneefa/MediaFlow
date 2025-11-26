import { Bell, Search, User, Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get user initials
  const userInitials = user
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : 'U';

  const userName = user
    ? `${user.first_name} ${user.last_name}`
    : 'User';

  return (
    <header className="h-14 md:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 md:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-2 md:gap-3 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden min-h-[44px] min-w-[44px]"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="flex-1 max-w-xl hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search contacts, projects, or tasks..."
              className="pl-10 bg-slate-50 border-slate-200 h-10"
            />
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden min-h-[44px] min-w-[44px]"
        >
          <Search className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex items-center gap-1 md:gap-3">
        <Button variant="ghost" size="icon" className="relative min-h-[44px] min-w-[44px]">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-600 text-white text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden md:inline">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
