// components/SearchBar.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import styles from '@/components/SearchBar/SearchBar.module.css';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Search...", 
  onSearch 
}) => {
  const [query, setQuery] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value); // Call onSearch with each keystroke
  };

  const handleReset = (e: FormEvent) => {
    e.preventDefault();
    setQuery('');
    onSearch(''); // Reset search when clear button is clicked
  };

  return (
    <form className={styles.form}>
      <label className={styles.label} htmlFor="search">
        <input
          className={styles.input}
          type="text"
          style={{ fontFamily: "'Livvic', sans-serif", fontWeight: 500 }}
          required
          placeholder={placeholder}
          id="search"
          value={query}
          onChange={handleChange}
        />
        <div className={styles.fancyBg}></div>
        <div className={styles.search}>
          <svg className={styles.svgIcon} viewBox="0 0 24 24" aria-hidden="true">
            <g>
              <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
            </g>
          </svg>
        </div>
        {query && (
          <button
            className={styles.closeBtn}
            type="reset"
            onClick={handleReset}
          >
            <svg className={styles.svgIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
        )}
      </label>
    </form>
  );
};

export default SearchBar;