import { ButtonHTMLAttributes } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  size?: 'sm' | 'md';
  variant?: 'surface' | 'reader';
}

export function IconButton({
  size = 'md',
  variant = 'surface',
  className = '',
  ...props
}: IconButtonProps) {
  const dimensions = size === 'sm' ? 'h-9 w-9' : 'h-10 w-10';
  const base =
    variant === 'reader'
      ? 'iconbtn' // keeps the existing global reader-toolbar look
      : `inline-flex shrink-0 items-center justify-center rounded-full bg-white text-[#6d6965] transition hover:opacity-85 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1a1a] ${dimensions}`;

  return <button type="button" className={`${base} ${className}`} {...props} />;
}