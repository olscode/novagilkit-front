import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.scss';

interface Language {
  code: string;
  name: string;
}

const LanguageSelector = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<number | null>(null);

  // Efecto para cerrar el dropdown cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // Añadir listener cuando el dropdown está abierto
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);

      // Set dropdown width based on button width
      if (buttonRef.current) {
        setDropdownWidth(buttonRef.current.offsetWidth);
      }
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  const languages: Language[] = [
    { code: 'en', name: t('languages.en') },
    { code: 'es', name: t('languages.es') },
    { code: 'nl', name: t('languages.nl') },
    { code: 'pl', name: t('languages.pl') },
  ];

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[1]; // Default to Spanish

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div className="language-selector" ref={dropdownRef}>
      <button
        className="language-selector__current"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('languages.selectLanguage')}
        ref={buttonRef}
      >
        <span className="language-code">
          {currentLanguage.code.toUpperCase()}
        </span>
      </button>
      {isOpen && (
        <ul
          className="language-selector__dropdown"
          role="listbox"
          style={dropdownWidth ? { width: `${dropdownWidth}px` } : undefined}
        >
          {languages.map((language) => (
            <li
              key={language.code}
              className={`language-option ${
                language.code === currentLanguage.code ? 'active' : ''
              }`}
              onClick={() => changeLanguage(language.code)}
              role="option"
              aria-selected={language.code === currentLanguage.code}
            >
              <span className="language-code">
                {language.code.toUpperCase()}
              </span>
              <span className="language-name">{language.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSelector;
