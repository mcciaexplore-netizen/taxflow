import { auth } from '../lib/firebase';
import { UserProfile } from '../types';
import { LogOut, User, ShieldCheck, Menu } from 'lucide-react';

interface NavbarProps {
  profile: UserProfile;
}

export default function Navbar({ profile }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-white border-bottom border-neutral-200 shadow-sm px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-neutral-900">TaxFlow</span>
          <span className="ml-2 px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] font-bold uppercase rounded tracking-wider">
            {profile.role}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 pr-4 border-r border-neutral-200">
            <div className="text-right">
              <p className="text-sm font-medium text-neutral-900">{profile.displayName || 'User'}</p>
              <p className="text-xs text-neutral-500">{profile.email}</p>
            </div>
            <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-neutral-500" />
            </div>
          </div>

          <button
            onClick={() => auth.signOut()}
            className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
          
          <button className="md:hidden p-2 text-neutral-500">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
