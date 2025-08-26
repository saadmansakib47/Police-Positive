import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import QuickReportDialog from '@/components/landing/QuickReportDialog';
import NotificationBell from '@/components/common/NotificationBell';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, token, logout } = useAuth();
  console.log({ isAuthenticated, user, token });

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUserInitials = (user: any) => {
    if (!user) return 'U';
    const first = user.firstName || '';
    const last = user.lastName || '';
    return (first[0] || '') + (last[0] || '').toUpperCase();
  };

  const getDisplayName = (user: any) => {
    if (!user) return '';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  };

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'civilian': return 'Civilian';
      case 'operator': return 'Police Operator';
      case 'supervisor': return 'Supervisor';
      case 'patrol': return 'Patrol Officer';
      default: return role || '';
    }
  };

  if (token && user === null && isAuthenticated === false) {
    return (
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Police Positive</span>
            </div>

            {/* Desktop Navigation Skeleton */}
            <nav className="hidden md:flex items-center space-x-8">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </nav>

            {/* Right side Skeleton */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>

            {/* Mobile menu button Skeleton */}
            <div className="md:hidden h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Police Positive</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link to="/features" className="text-gray-600 hover:text-blue-600 transition-colors">
              Features
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            <QuickReportDialog />
            
            {isAuthenticated && <NotificationBell />}

            {user && isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{getDisplayName(user)}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs leading-none text-blue-600">
                        {getRoleDisplayName(user.role)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/${user.role}`} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : !user && !token ? (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/features"
                className="text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="/contact"
                className="text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              {user && isAuthenticated ? (
                <div className="pt-4 border-t">
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{getDisplayName(user)}</p>
                      <p className="text-xs text-muted-foreground">
                        {getRoleDisplayName(user.role)}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/${user.role}`}
                    className="block text-gray-600 hover:text-blue-600 transition-colors mb-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Log out
                  </button>
                </div>
              ) : !user && !token ? (
                <div className="pt-4 border-t space-y-2">
                  <Link
                    to="/login"
                    className="block text-gray-600 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block text-blue-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              ) : null}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// Remove these comment lines and JSX fragment
// In the JSX, add the NotificationBell component near the user dropdown:
// Find the section with the user avatar and add NotificationBell before it:

export default Header;