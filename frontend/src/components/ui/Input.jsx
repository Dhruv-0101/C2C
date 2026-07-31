import React, { forwardRef, useState } from 'react';
import clsx from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Reusable Form Input Component compatible with React Hook Form + Zod
 */
export const Input = forwardRef(
  (
    {
      label,
      error,
      type = 'text',
      id,
      name,
      placeholder,
      icon: Icon,
      helperText,
      className = '',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const inputId = id || name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold uppercase tracking-wider text-slate-200"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-xl overflow-hidden">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-400/80">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={inputType}
            placeholder={placeholder}
            className={clsx(
              'w-full bg-[#0F172A] glass-input text-white font-medium placeholder-slate-400 text-sm rounded-xl py-3 px-4 outline-none transition-all duration-200',
              Icon ? 'pl-10' : 'pl-4',
              isPassword ? 'pr-11' : 'pr-4',
              error
                ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50'
                : 'border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-rose-400 font-medium animate-in fade-in duration-150">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-slate-400 font-normal">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
