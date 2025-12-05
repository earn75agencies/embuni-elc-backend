import React from 'react';
import { ShieldAlert } from 'lucide-react';

const AccessDenied = ({
  title = 'Access Restricted',
  message = 'You do not have permission to view this module. Please contact your Chapter President or Super Admin if you believe this is an error.',
  helperText = 'Return to the admin dashboard to continue your work.',
  actionLabel = 'Back to Dashboard',
  actionHref = '/admin/dashboard'
}) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-neutral-50 px-4 py-16">
      <div className="card max-w-xl w-full text-center space-y-6 py-12">
        <div className="flex justify-center">
          <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center shadow-inner">
            <ShieldAlert size={32} />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="font-heading text-2xl font-bold text-charcoal">{title}</h2>
          <p className="text-neutral-600 text-sm md:text-base leading-relaxed">{message}</p>
          <p className="text-neutral-500 text-xs md:text-sm">{helperText}</p>
        </div>
        <div className="flex justify-center">
          <a
            href={actionHref}
            className="btn-primary inline-flex items-center px-6 py-3 text-sm font-semibold"
          >
            {actionLabel}
          </a>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;

