/**
 * Navbar Component
 * Optimized with React.memo and useMemo for better performance
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();

  const navLinks = useMemo(() => [
    { name: t('common.home'), path: '/', key: 'home' },
    { name: t('common.about'), path: '/about', key: 'about' },
    { name: t('common.programs'), path: '/programs', key: 'programs' },
    { name: t('common.events'), path: '/events', key: 'events' },
    { name: t('common.news'), path: '/news', key: 'news' },
    { name: t('common.gallery'), path: '/gallery', key: 'gallery' },
    { name: t('common.resources'), path: '/resources', key: 'resources' },
    { name: t('common.contact'), path: '/contact', key: 'contact' }
  ], [t]);

  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
    setProfileOpen(false);
  }, [logout, navigate]);

  return (
    <nav className="bg-white shadow-soft sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">ELP</span>
            </div>
            <div className="hidden md:block">
              <div className="font-heading font-bold text-xl text-charcoal">
                {t('navbar.title')}
              </div>
              <div className="text-xs text-neutral-600">{t('navbar.subtitle')}</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                to={link.path}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-primary bg-primary/5'
                    : 'text-neutral-700 hover:text-primary hover:bg-neutral-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <span className="font-medium text-charcoal">
                    {user?.firstName}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-large py-2">
                    {isAdmin() ? (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-neutral-50 transition-colors"
                      >
                        <LayoutDashboard size={18} />
                        <span>{t('navbar.adminPanel')}</span>
                      </Link>
                    ) : (
                      <Link
                        to="/portal/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-neutral-50 transition-colors"
                      >
                        <LayoutDashboard size={18} />
                        <span>{t('navbar.userPortal')}</span>
                      </Link>
                    )}
                    {isAdmin() && (
                      <Link
                        to="/portal/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-neutral-50 transition-colors"
                      >
                        <User size={18} />
                        <span>{t('navbar.userPortal')}</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-neutral-50 transition-colors w-full text-left text-red-600"
                    >
                      <LogOut size={18} />
                      <span>{t('common.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary"
              >
                {t('common.login')}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-neutral-200 animate-fadeIn">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive(link.path)
                    ? 'text-primary bg-primary/5'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-4 px-4 space-y-2">
              <LanguageSwitcher className="w-full" />
              {isAuthenticated ? (
                <>
                  {isAdmin() ? (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block w-full btn-primary text-center"
                    >
                      {t('navbar.adminPanel')}
                    </Link>
                  ) : (
                    <Link
                      to="/portal/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block w-full btn-primary text-center"
                    >
                      {t('navbar.userPortal')}
                    </Link>
                  )}
                  {isAdmin() && (
                    <Link
                      to="/portal/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block w-full btn-secondary text-center"
                    >
                      {t('navbar.userPortal')}
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="block w-full btn-outline text-red-600 border-red-600 hover:bg-red-600 text-center"
                  >
                    {t('common.logout')}
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full btn-primary text-center"
                >
                  {t('common.login')}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default React.memo(Navbar);
