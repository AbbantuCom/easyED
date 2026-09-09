'use client';

import { useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a15.6 15.6 0 0 1-3.05 4.02M6.53 6.53C4.2 8.1 2 12 2 12s3.5 7 10 7c1.24 0 2.36-.22 3.35-.58M9.9 9.9a3 3 0 0 0 4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface FieldWrapperProps {
  label: string;
  htmlFor: string;
  error?: string;
  hideLabel?: boolean;
  children: ReactNode;
}

function FieldWrapper({ label, htmlFor, error, hideLabel, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={htmlFor}
        className={hideLabel ? 'sr-only' : 'text-sm font-medium text-slate-700'}
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const FIELD_CLASSES =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TextInput({ label, error, id, className = '', type, ...props }: TextInputProps) {
  const fieldId = id ?? props.name ?? label;
  const isPassword = type === 'password';
  const [visible, setVisible] = useState(false);

  if (!isPassword) {
    return (
      <FieldWrapper label={label} htmlFor={fieldId} error={error}>
        <input
          id={fieldId}
          type={type}
          className={`${FIELD_CLASSES} ${error ? 'border-red-400' : ''} ${className}`}
          aria-invalid={Boolean(error)}
          {...props}
        />
      </FieldWrapper>
    );
  }

  return (
    <FieldWrapper label={label} htmlFor={fieldId} error={error}>
      <div className="relative">
        <input
          id={fieldId}
          type={visible ? 'text' : 'password'}
          className={`${FIELD_CLASSES} pr-10 ${error ? 'border-red-400' : ''} ${className}`}
          aria-invalid={Boolean(error)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex items-center rounded-r-lg px-3 text-slate-400 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-rotate-6 hover:scale-125 hover:text-slate-600 active:scale-90 active:rotate-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </FieldWrapper>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextAreaField({
  label,
  error,
  id,
  className = '',
  rows = 4,
  ...props
}: TextAreaFieldProps) {
  const fieldId = id ?? props.name ?? label;
  return (
    <FieldWrapper label={label} htmlFor={fieldId} error={error}>
      <textarea
        id={fieldId}
        rows={rows}
        className={`${FIELD_CLASSES} resize-y ${error ? 'border-red-400' : ''} ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
    </FieldWrapper>
  );
}

interface SelectFieldProps {
  label: string;
  error?: string;
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  hideLabel?: boolean;
}

export function SelectField({
  label,
  error,
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  required,
  hideLabel,
}: SelectFieldProps) {
  const fieldId = id ?? name ?? label;
  return (
    <FieldWrapper label={label} htmlFor={fieldId} error={error} hideLabel={hideLabel}>
      <select
        id={fieldId}
        name={name}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className={`${FIELD_CLASSES} ${error ? 'border-red-400' : ''}`}
        aria-invalid={Boolean(error)}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}
