import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Clapperboard, Calendar, BarChart3, Video, CheckSquare, FolderOpen, Plug } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/projects', icon: Clapperboard, label: 'Projects' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/assets', icon: FolderOpen, label: 'Assets' },
  { to: '/integrations', icon: Plug, label: 'Integrations' },
  { to: '/approvals', icon: CheckSquare, label: 'Approvals' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

interface SidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <Video className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">MediaFlow</h1>
          <p className="text-xs text-slate-400">Production CRM</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 md:py-3 rounded-lg transition-colors',
                'min-h-[48px] touch-manipulation',
                'hover:bg-slate-800 active:bg-slate-700',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300'
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-slate-500">
          Version 1.0.0
        </div>
      </div>
    </>
  );
}

export function Sidebar({ mobileMenuOpen, setMobileMenuOpen }: SidebarProps) {
  return (
    <>
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-100 flex-col">
        <SidebarContent />
      </aside>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-slate-900 text-slate-100 border-slate-800">
          <div className="flex flex-col h-full">
            <SidebarContent onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
