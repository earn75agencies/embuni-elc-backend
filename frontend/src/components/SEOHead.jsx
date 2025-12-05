/**
 * Enhanced SEO Head Component
 * Comprehensive SEO management with structured data and performance optimization
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  image, 
  type = 'website',
  structuredData = null,
  noIndex = false,
  canonicalUrl = null
}) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const currentLang = i18n.language;
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://equityleaders.embuni.ac.ke';

  // Supported languages
  const languages = ['en', 'sw', 'fr', 'ar'];
  
  // Default values
  const defaultTitles = {
    en: 'Equity Leaders Program - University of Embu',
    sw: 'Programu ya Viongozi wa Haki - Chuo Kikuu cha Embu',
    fr: 'Programme des Leaders Équitables - Université d\'Embu',
    ar: 'برنامج قادة الإنصاف - جامعة إمبو'
  };
  
  const defaultDescriptions = {
    en: 'University of Embu Equity Leaders Program - Empowering transformational leaders through service, growth, and impact.',
    sw: 'Programu ya Viongozi wa Haki ya Chuo Kikuu cha Embu - Kuwezesha viongozi wa mabadiliko kupitia huduma, ukuaji, na athari.',
    fr: 'Programme des Leaders Équitables de l\'Université d\'Embu - Autonomiser les leaders transformationnels par le service, la croissance et l\'impact.',
    ar: 'برنامج قادة الإنصاف بجامعة إمبو - تمكين القادة التحويليين من خلال الخدمة والنمو والتأثير.'
  };
  
  const defaultKeywords = {
    en: 'equity leaders, university of embu, leadership program, student organization, mentorship',
    sw: 'viongozi wa haki, chuo kikuu cha embu, programu ya uongozi, shirika la wanafunzi, uongozi',
    fr: 'leaders équitables, université d\'embu, programme de leadership, organisation étudiante, mentorat',
    ar: 'قادة الإنصاف، جامعة إمبو، برنامج القيادة، منظمة الطلاب، الإرشاد'
  };

  // Page-specific content
  const pageTitle = title || defaultTitles[currentLang] || defaultTitles.en;
  const pageDescription = description || defaultDescriptions[currentLang] || defaultDescriptions.en;
  const pageKeywords = keywords || defaultKeywords[currentLang] || defaultKeywords.en;
  const pageImage = image || `${baseUrl}/images/elp-og-image.jpg`;
  
  // Current page URL
  const currentUrl = canonicalUrl || `${baseUrl}${location.pathname}`;

  // Structured data for organization
  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Equity Leaders Program',
    description: defaultDescriptions.en,
    url: baseUrl,
    logo: `${baseUrl}/images/logo.png`,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KE',
      addressLocality: 'Embu',
      addressRegion: 'Embu County'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+254-XXX-XXX-XXX',
      contactType: 'customer service',
      availableLanguage: ['English', 'Swahili']
    },
    sameAs: [
      'https://facebook.com/equityleadersprogram',
      'https://twitter.com/equityleaders',
      'https://linkedin.com/company/equity-leaders-program'
    ]
  };

  // Breadcrumb structured data
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: pageTitle,
        item: currentUrl
      }
    ]
  };

  // Website structured data
  const websiteStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Equity Leaders Program',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  // Combine all structured data
  const allStructuredData = [
    organizationStructuredData,
    breadcrumbStructuredData,
    websiteStructuredData,
    ...(structuredData ? [structuredData] : [])
  ];

  useEffect(() => {
    // Update document language and direction
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

    // Update or create meta tags
    const updateMetaTag = (name, content, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Update title
    document.title = pageTitle;

    // Update basic meta tags
    updateMetaTag('description', pageDescription);
    updateMetaTag('keywords', pageKeywords);
    updateMetaTag('author', 'Equity Leaders Program');
    updateMetaTag('robots', noIndex ? 'noindex,nofollow' : 'index,follow');
    updateMetaTag('googlebot', noIndex ? 'noindex,nofollow' : 'index,follow');

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // Update Open Graph tags
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:title', pageTitle, 'property');
    updateMetaTag('og:description', pageDescription, 'property');
    updateMetaTag('og:image', pageImage, 'property');
    updateMetaTag('og:image:width', '1200', 'property');
    updateMetaTag('og:image:height', '630', 'property');
    updateMetaTag('og:image:alt', pageTitle, 'property');
    updateMetaTag('og:url', currentUrl, 'property');
    updateMetaTag('og:site_name', 'Equity Leaders Program', 'property');
    updateMetaTag('og:locale', currentLang === 'ar' ? 'ar_SA' : currentLang === 'sw' ? 'sw_KE' : currentLang === 'fr' ? 'fr_FR' : 'en_US', 'property');

    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', pageTitle);
    updateMetaTag('twitter:description', pageDescription);
    updateMetaTag('twitter:image', pageImage);
    updateMetaTag('twitter:site', '@equityleaders');
    updateMetaTag('twitter:creator', '@equityleaders');

    // Update additional meta tags
    updateMetaTag('theme-color', '#2563eb');
    updateMetaTag('msapplication-TileColor', '#2563eb');
    updateMetaTag('application-name', 'Equity Leaders Program');
    updateMetaTag('apple-mobile-web-app-title', 'ELP');
    updateMetaTag('apple-mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'default');

    // Update viewport and mobile optimization
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=5.0');
    updateMetaTag('mobile-web-app-capable', 'yes');

    // Update security headers
    updateMetaTag('X-Content-Type-Options', 'nosniff', 'http-equiv');
    updateMetaTag('X-Frame-Options', 'DENY', 'http-equiv');
    updateMetaTag('X-XSS-Protection', '1; mode=block', 'http-equiv');
    updateMetaTag('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Add hreflang tags for alternate language versions
    const existingHreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflangs.forEach(link => link.remove());

    languages.forEach(lang => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      link.setAttribute('href', `${baseUrl}/${lang}${location.pathname}`);
      document.head.appendChild(link);
    });

    // Add x-default hreflang
    const defaultLink = document.createElement('link');
    defaultLink.setAttribute('rel', 'alternate');
    defaultLink.setAttribute('hreflang', 'x-default');
    defaultLink.setAttribute('href', `${baseUrl}/en${location.pathname}`);
    document.head.appendChild(defaultLink);

    // Add DNS prefetch for performance
    const dnsPrefetchDomains = [
      '//fonts.googleapis.com',
      '//fonts.gstatic.com',
      '//www.google-analytics.com',
      '//www.googletagmanager.com'
    ];

    dnsPrefetchDomains.forEach(domain => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'dns-prefetch');
      link.setAttribute('href', domain);
      document.head.appendChild(link);
    });

    // Add preconnect for critical resources
    const preconnectDomains = [
      { href: 'https://fonts.googleapis.com', crossOrigin: 'anonymous' },
      { href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' }
    ];

    preconnectDomains.forEach(({ href, crossOrigin }) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'preconnect');
      link.setAttribute('href', href);
      if (crossOrigin) link.setAttribute('crossorigin', crossOrigin);
      document.head.appendChild(link);
    });

    // Add structured data
    const existingStructuredData = document.querySelectorAll('script[type="application/ld+json"]');
    existingStructuredData.forEach(script => script.remove());

    allStructuredData.forEach((data, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data);
      script.setAttribute('data-structured-data', index.toString());
      document.head.appendChild(script);
    });

    // Add favicon and app icons
    const icons = [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }
    ];

    icons.forEach(({ rel, type, sizes, href }) => {
      let link = document.querySelector(`link[rel="${rel}"]${sizes ? `[sizes="${sizes}"]` : ''}`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        if (type) link.setAttribute('type', type);
        if (sizes) link.setAttribute('sizes', sizes);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    });

    // Add manifest
    let manifest = document.querySelector('link[rel="manifest"]');
    if (!manifest) {
      manifest = document.createElement('link');
      manifest.setAttribute('rel', 'manifest');
      document.head.appendChild(manifest);
    }
    manifest.setAttribute('href', '/manifest.json');

    // Add RSS feed
    let rss = document.querySelector('link[type="application/rss+xml"]');
    if (!rss) {
      rss = document.createElement('link');
      rss.setAttribute('type', 'application/rss+xml');
      rss.setAttribute('rel', 'alternate');
      rss.setAttribute('title', 'ELP News Feed');
      document.head.appendChild(rss);
    }
    rss.setAttribute('href', '/feed.xml');

    // Add sitemap reference
    let sitemap = document.querySelector('link[rel="sitemap"]');
    if (!sitemap) {
      sitemap = document.createElement('link');
      sitemap.setAttribute('rel', 'sitemap');
      sitemap.setAttribute('type', 'application/xml');
      document.head.appendChild(sitemap);
    }
    sitemap.setAttribute('href', '/sitemap.xml');

  }, [currentLang, location.pathname, baseUrl, pageTitle, pageDescription, pageKeywords, pageImage, type, currentUrl, noIndex, allStructuredData]);

  return null; // This component doesn't render anything
};

export default SEOHead;

