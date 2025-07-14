import React, { useEffect, useRef, useState } from 'react';
import { FaCheck, FaChevronDown } from 'react-icons/fa';
import './Dropdown.scss';

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
  className?: string;
  searchable?: boolean;
  clearable?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  disabled = false,
  loading = false,
  error = false,
  className = '',
  searchable = false,
  clearable = false,
  size = 'medium',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar opciones basado en el término de búsqueda
  const filteredOptions = searchable
    ? options.filter(
        (option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          option.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Encontrar la opción seleccionada
  const selectedOption = options.find((option) => option.value === value);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Enfocar input de búsqueda cuando se abre el dropdown
  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  const handleOptionSelect = (option: DropdownOption) => {
    if (!option.disabled) {
      onChange(option.value);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const dropdownClasses = [
    'dropdown',
    `dropdown--${size}`,
    isOpen ? 'dropdown--open' : '',
    disabled ? 'dropdown--disabled' : '',
    loading ? 'dropdown--loading' : '',
    error ? 'dropdown--error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={dropdownClasses} ref={dropdownRef}>
      <div className="dropdown__trigger" onClick={handleToggle}>
        <div className="dropdown__value">
          {selectedOption ? (
            <div className="dropdown__selected">
              <span className="dropdown__selected-label">
                {selectedOption.label}
              </span>
              {selectedOption.description && (
                <span className="dropdown__selected-description">
                  {selectedOption.description}
                </span>
              )}
            </div>
          ) : (
            <span className="dropdown__placeholder">{placeholder}</span>
          )}
        </div>

        <div className="dropdown__actions">
          {clearable && selectedOption && !disabled && (
            <button
              type="button"
              className="dropdown__clear"
              onClick={handleClear}
              aria-label="Limpiar selección"
            >
              ×
            </button>
          )}
          <div className="dropdown__arrow">
            <FaChevronDown />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="dropdown__menu">
          {searchable && (
            <div className="dropdown__search">
              <input
                ref={inputRef}
                type="text"
                className="dropdown__search-input"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          )}

          <div className="dropdown__options">
            {filteredOptions.length === 0 ? (
              <div className="dropdown__no-options">
                {searchTerm ? 'No se encontraron resultados' : 'Sin opciones'}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={[
                    'dropdown__option',
                    option.value === value ? 'dropdown__option--selected' : '',
                    option.disabled ? 'dropdown__option--disabled' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleOptionSelect(option)}
                >
                  <div className="dropdown__option-content">
                    <span className="dropdown__option-label">
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="dropdown__option-description">
                        {option.description}
                      </span>
                    )}
                  </div>
                  {option.value === value && (
                    <div className="dropdown__option-check">
                      <FaCheck />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
