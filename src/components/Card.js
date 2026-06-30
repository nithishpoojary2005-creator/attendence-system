import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  actions,
  hoverable = false,
  className = '',
}) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 ${
        hoverable ? 'hover:shadow-xl hover:-translate-y-1' : ''
      } ${className}`}
    >
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="px-6 py-5">{children}</div>
    </div>
  );
};

export default Card;
