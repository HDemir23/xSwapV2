import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm text-[#9B9B9B] mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-[#1B1A1A] border border-[#2B2B2B] rounded-2xl px-4 py-3
            text-white placeholder:text-[#5E5E5E]
            focus:outline-none focus:border-[#FF007A] focus:ring-1 focus:ring-[#FF007A]
            transition-colors
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
