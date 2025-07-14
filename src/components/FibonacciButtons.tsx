// FibonacciButtons.tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './FibonacciButtons.scss';

interface FibonacciButtonsProps {
  handleVote: (number: number) => void;
  disabled?: boolean;
  currentVote?: number | null;
}

const FibonacciButtons = ({
  handleVote,
  disabled = false,
  currentVote = null,
}: FibonacciButtonsProps) => {
  const { t } = useTranslation();
  const fibonacciNumbers = [1, 2, 3, 5, 8, 13, 21, 34]; // Fibonacci sequence
  const [selectedValue, setSelectedValue] = useState<number | null>(
    currentVote
  );
  // Actualizar selectedValue cuando cambia currentVote desde las props
  const handleButtonClick = (number: number) => {
    if (disabled) return;
    setSelectedValue(number);
    handleVote(number);
  };

  // Actualizar el valor seleccionado cuando cambia currentVote desde props
  if (currentVote !== null && currentVote !== selectedValue) {
    setSelectedValue(currentVote);
  }
  return (
    <div className={`fibonacci-section ${disabled ? 'disabled' : ''}`}>
      <div className="fibonacci-buttons">
        {fibonacciNumbers.map((number) => (
          <button
            key={number}
            onClick={() => handleButtonClick(number)}
            className={selectedValue === number ? 'selected' : ''}
            aria-label={t('pokerPlanning.fibonacci.votePoints', {
              points: number,
            })}
            disabled={disabled}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FibonacciButtons;
