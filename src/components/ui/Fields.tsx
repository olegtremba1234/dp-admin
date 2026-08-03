import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

interface FieldWrapperProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
}

function FieldWrapper({ label, required, children, hint }: FieldWrapperProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-navy-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-navy-400">{hint}</p>}
    </div>
  );
}

const baseInputClass =
  'w-full rounded-lg border border-navy-200 px-3 py-2 text-sm outline-none focus:border-brand-emerald-500 focus:ring-1 focus:ring-brand-emerald-500 disabled:bg-navy-50';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function Input({ label, hint, required, className = '', ...props }: InputProps) {
  return (
    <FieldWrapper label={label} required={required} hint={hint}>
      <input className={`${baseInputClass} ${className}`} required={required} {...props} />
    </FieldWrapper>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export function Textarea({ label, hint, required, className = '', ...props }: TextareaProps) {
  return (
    <FieldWrapper label={label} required={required} hint={hint}>
      <textarea className={`${baseInputClass} resize-none ${className}`} required={required} {...props} />
    </FieldWrapper>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
}

export function Select({ label, hint, required, className = '', children, ...props }: SelectProps) {
  return (
    <FieldWrapper label={label} required={required} hint={hint}>
      <select className={`${baseInputClass} bg-white ${className}`} required={required} {...props}>
        {children}
      </select>
    </FieldWrapper>
  );
}
