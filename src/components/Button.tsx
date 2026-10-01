import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md';
}

const sizes = {
  sm: 'px-4 py-2 text-[14px]',
  md: 'px-6 py-4 text-[16px]',
};

export function Button({ size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#f3c9a0] font-medium text-black shadow-[0_6px_16px_rgba(26,26,26,0.12)] transition hover:-translate-y-px active:translate-y-px active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1a1a] disabled:opacity-50 ${sizes[size]} ${className}`}
      {...props}
    />
  );
}