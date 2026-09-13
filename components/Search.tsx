'use client';

import React from 'react';

export interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (e?: React.FormEvent) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  name?: string;
}

export const Search = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search...',
  className = '',
  inputClassName = '',
  disabled = false,
  autoFocus = false,
  name = 'search',
}: SearchProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative inline-flex items-center ${className}`}
    >
      <input
        type="search"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`w-56 sm:w-64 transition-all duration-300 ease-in-out focus:w-64 sm:focus:w-80 h-10 px-4 pr-10 text-xs sm:text-sm bg-card text-foreground placeholder:text-muted-foreground border border-border/70 rounded-xl shadow-sm focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none ${inputClassName}`}
      />
      <button
        type="submit"
        aria-label="Search"
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
      >
        <svg
          className="size-4 text-muted-foreground pointer-events-none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </form>
  );
};

export default Search;
