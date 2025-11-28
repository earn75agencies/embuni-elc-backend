import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-grow flex items-center justify-center px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
        <div className="max-w-max mx-auto">
          <main className="sm:flex">
            <p className="text-4xl font-extrabold text-blue-600 sm:text-5xl">404</p>
            <div className="sm:ml-6">
              <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                  {t('404.title', 'Page not found')}
                </h1>
                <p className="mt-1 text-base text-gray-500">
                  {t('404.description', 'Please check the URL in the address bar and try again.')}
                </p>
              </div>
              <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Home className="w-4 h-4 mr-2" />
                  {t('404.go_home', 'Go back home')}
                </Link>
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('404.go_back', 'Go back')}
                </button>
              </div>
            </div>
          </main>
          <div className="mt-16">
            <div className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {t('404.helpful_links', 'Helpful Links')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/about"
                  className="flex items-center p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {t('nav.about', 'About')}
                </Link>
                <Link
                  to="/programs"
                  className="flex items-center p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {t('nav.programs', 'Programs')}
                </Link>
                <Link
                  to="/events"
                  className="flex items-center p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {t('nav.events', 'Events')}
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {t('nav.contact', 'Contact')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
