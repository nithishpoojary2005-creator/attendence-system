import React from 'react';

const Input = React.forwardRef(({
  label,
  type = 'text',
  placeholder,
  name,
  error,
  options = [], // Used if type is 'select'
  className = '',
  ...props
}, ref) => {
  const isSelect = type === 'select';
  const isTextarea = type === 'textarea';

  const inputClass = `w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:outline-none transition-all duration-200 ${
    error
      ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
      : 'border-gray-300 focus:ring-indigo-100 focus:border-indigo-500'
  } dark:bg-gray-800 dark:border-gray-700 dark:text-white ${className}`;

  return (
    <div className="mb-4 text-left w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 font-sans">
          {label}
        </label>
      )}
      
      {isSelect ? (
        <select
          ref={ref}
          name={name}
          className={inputClass}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : isTextarea ? (
        <textarea
          ref={ref}
          name={name}
          placeholder={placeholder}
          className={inputClass}
          rows="3"
          {...props}
        />
      ) : (
        <input
          ref={ref}
          type={type}
          name={name}
          placeholder={placeholder}
          className={inputClass}
          {...props}
        />
      )}

      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium animate-shake">
          {error.message || error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
