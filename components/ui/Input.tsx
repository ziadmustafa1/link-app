import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'block w-full rounded-md border-gray-300 shadow-sm',
          'focus:border-blue-500 focus:ring-blue-500',
          'placeholder:text-gray-400',
          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input; 