import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * StatsCard - Display key metrics on admin dashboard
 */
const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'bg-primary',
  description 
}) => {
  return (
    <div className={`${color} text-white rounded-lg p-6 shadow-medium`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        {Icon && <Icon size={32} className="opacity-50" />}
      </div>
      
      {description && (
        <p className="text-white/70 text-xs mb-2">{description}</p>
      )}
      
      {trend && (
        <div className="flex items-center gap-1">
          {trend.direction === 'up' ? (
            <TrendingUp size={16} className="text-green-400" />
          ) : (
            <TrendingDown size={16} className="text-red-400" />
          )}
          <span className="text-xs">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
