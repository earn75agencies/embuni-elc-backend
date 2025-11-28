import React from 'react';
import { FileText, Download, BookOpen, GraduationCap, ExternalLink } from 'lucide-react';

const Resources = () => {
  const resources = [
    {
      category: 'Constitution & Bylaws',
      items: [
        {
          title: 'ELP Chapter Constitution',
          description: 'Official constitution governing the Equity Leaders Program chapter',
          type: 'PDF',
          size: '2.5 MB',
          link: '#'
        },
        {
          title: 'Chapter Bylaws',
          description: 'Detailed bylaws and operational guidelines',
          type: 'PDF',
          size: '1.8 MB',
          link: '#'
        }
      ]
    },
    {
      category: 'Member Handbooks',
      items: [
        {
          title: 'New Member Handbook',
          description: 'Comprehensive guide for new members joining ELP',
          type: 'PDF',
          size: '3.2 MB',
          link: '#'
        },
        {
          title: 'Leadership Manual',
          description: 'Essential leadership principles and best practices',
          type: 'PDF',
          size: '2.7 MB',
          link: '#'
        }
      ]
    },
    {
      category: 'Scholarships & Opportunities',
      items: [
        {
          title: 'Scholarship Guide 2024',
          description: 'Available scholarships and application procedures',
          type: 'PDF',
          size: '1.5 MB',
          link: '#'
        },
        {
          title: 'Leadership Development Programs',
          description: 'External programs and training opportunities',
          type: 'PDF',
          size: '2.1 MB',
          link: '#'
        }
      ]
    }
  ];

  const externalLinks = [
    { title: 'Equity Bank Foundation', url: 'https://www.equitygroupfoundation.com' },
    { title: 'University of Embu', url: 'https://www.embuni.ac.ke' },
    { title: 'Leadership Resources', url: '#' }
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20">
        <div className="container-custom">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen size={40} />
            <h1 className="font-heading text-4xl md:text-5xl font-bold">Resources</h1>
          </div>
          <p className="text-xl text-white/90 max-w-3xl">
            Access important documents, handbooks, and resources for members
          </p>
        </div>
      </section>

      {/* Resources Section */}
      <section className="section-padding">
        <div className="container-custom max-w-5xl">
          <div className="space-y-12">
            {resources.map((section, index) => (
              <div key={index}>
                <h2 className="font-heading text-2xl font-bold text-charcoal mb-6 flex items-center">
                  <FileText className="mr-3 text-primary" size={28} />
                  {section.category}
                </h2>
                <div className="grid gap-6">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="card p-6 hover:shadow-large transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-heading text-xl font-bold text-charcoal mb-2">
                            {item.title}
                          </h3>
                          <p className="text-neutral-600 mb-3">
                            {item.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-neutral-500">
                            <span className="px-2 py-1 bg-neutral-100 rounded">
                              {item.type}
                            </span>
                            <span>{item.size}</span>
                          </div>
                        </div>
                        <a
                          href={item.link}
                          download
                          className="btn-primary ml-4 flex items-center"
                        >
                          <Download size={18} className="mr-2" />
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* External Links */}
          <div className="mt-16">
            <h2 className="font-heading text-2xl font-bold text-charcoal mb-6 flex items-center">
              <ExternalLink className="mr-3 text-primary" size={28} />
              Useful Links
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {externalLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card p-6 text-center hover:shadow-large transition-all group"
                >
                  <GraduationCap size={40} className="mx-auto text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-heading font-bold text-charcoal group-hover:text-primary transition-colors">
                    {link.title}
                  </h3>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Resources;
