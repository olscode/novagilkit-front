# Tooltips para Estadísticas de Votación

## 📊 Textos Sugeridos para Tooltips

### 🧮 **Promedio**

```
"Suma de todos los votos dividida por el número de votantes.
Útil para calcular el esfuerzo promedio general."

Ejemplo: Con votos [3, 8, 21] → (3+8+21)÷3 = 10.67
```

### 📏 **Mediana**

```
"El valor central cuando se ordenan todos los votos.
Representa el consenso real del equipo, sin distorsión por valores extremos."

Ejemplo: Con votos [3, 8, 21] → el valor central es 8
```

### ⬇️ **Mínimo**

```
"El voto más bajo del equipo."
```

### ⬆️ **Máximo**

```
"El voto más alto del equipo."
```

## 🛠️ Implementación en React

### Componente Tooltip Simple

```typescript
// components/Tooltip/Tooltip.tsx
import React, { useState } from 'react';
import './Tooltip.scss';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`tooltip tooltip-${position}`}>
          {content}
        </div>
      )}
    </div>
  );
};
```

### Estilos CSS

```scss
// components/Tooltip/Tooltip.scss
.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: absolute;
  background-color: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.4;
  white-space: nowrap;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  // Flecha del tooltip
  &::after {
    content: '';
    position: absolute;
    border: 5px solid transparent;
  }

  &.tooltip-top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 5px;

    &::after {
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-top-color: #333;
    }
  }

  &.tooltip-bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 5px;

    &::after {
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-bottom-color: #333;
    }
  }
}
```

## 🎯 Uso en el Componente Room

```typescript
// En Room.tsx
import { Tooltip } from '../Tooltip/Tooltip';

// Dentro del JSX:
{votingProgress.status === VotingStatus.FINISHED && (
  <div className="vote-statistics animate-stats">
    <h3>Estadísticas</h3>
    <div className="stats-grid">
      <div className="stat-item">
        <Tooltip content="Suma de todos los votos dividida por el número de votantes. Útil para calcular el esfuerzo promedio general.">
          <div className="stat-label">
            Promedio <span className="info-icon">ℹ️</span>
          </div>
        </Tooltip>
        <div className="stat-value">{voteStats.average.toFixed(1)}</div>
      </div>

      <div className="stat-item">
        <Tooltip content="El valor central cuando se ordenan todos los votos. Representa el consenso real del equipo.">
          <div className="stat-label">
            Mediana <span className="info-icon">ℹ️</span>
          </div>
        </Tooltip>
        <div className="stat-value">{voteStats.median}</div>
      </div>

      <div className="stat-item">
        <Tooltip content="El voto más bajo del equipo.">
          <div className="stat-label">
            Mínimo <span className="info-icon">ℹ️</span>
          </div>
        </Tooltip>
        <div className="stat-value">{voteStats.min}</div>
      </div>

      <div className="stat-item">
        <Tooltip content="El voto más alto del equipo.">
          <div className="stat-label">
            Máximo <span className="info-icon">ℹ️</span>
          </div>
        </Tooltip>
        <div className="stat-value">{voteStats.max}</div>
      </div>
    </div>
  </div>
)}
```

## 🌍 Versión con i18n

### Archivos de Localización

```json
// i18n/locales/en.json
{
  "planningVotes": {
    "room": {
      "statistics": {
        "tooltips": {
          "average": "Sum of all votes divided by number of voters. Useful for calculating overall average effort.",
          "median": "The middle value when all votes are sorted. Represents the team's real consensus, unaffected by extreme values.",
          "min": "The lowest vote from the team.",
          "max": "The highest vote from the team."
        }
      }
    }
  }
}
```

```json
// i18n/locales/es.json
{
  "planningVotes": {
    "room": {
      "statistics": {
        "tooltips": {
          "average": "Suma de todos los votos dividida por el número de votantes. Útil para calcular el esfuerzo promedio general.",
          "median": "El valor central cuando se ordenan todos los votos. Representa el consenso real del equipo, sin distorsión por valores extremos.",
          "min": "El voto más bajo del equipo.",
          "max": "El voto más alto del equipo."
        }
      }
    }
  }
}
```

### Uso con i18n

```typescript
// En Room.tsx con traducción
<div className="stat-item">
  <Tooltip content={t('planningVotes.room.statistics.tooltips.average')}>
    <div className="stat-label">
      {t('planningVotes.room.average')} <span className="info-icon">ℹ️</span>
    </div>
  </Tooltip>
  <div className="stat-value">{voteStats.average.toFixed(1)}</div>
</div>
```

## 🎨 Alternativas de Diseño

### 1. **Con ícono de información**

```typescript
<div className="stat-label">
  Promedio
  <Tooltip content="...">
    <span className="info-icon">ℹ️</span>
  </Tooltip>
</div>
```

### 2. **Label completo clickeable**

```typescript
<Tooltip content="...">
  <div className="stat-label clickable">
    Promedio
  </div>
</Tooltip>
```

### 3. **Con ejemplos dinámicos**

```typescript
const getAverageTooltip = (votes: number[]) => {
  if (votes.length === 0) return "No hay votos aún";
  const sum = votes.reduce((a, b) => a + b, 0);
  return `Suma: ${votes.join(' + ')} = ${sum}, dividido por ${votes.length} = ${(sum/votes.length).toFixed(1)}`;
};

<Tooltip content={getAverageTooltip(votes.map(v => v.vote))}>
  <div className="stat-label">Promedio ℹ️</div>
</Tooltip>
```

## 💡 Consejos de UX

1. **Mantén los tooltips concisos** - Máximo 2-3 líneas
2. **Usa ejemplos reales** - Con los votos actuales cuando sea posible
3. **Posiciona bien** - Que no se salgan de la pantalla
4. **Delay apropiado** - 300ms para mostrar, inmediato para ocultar
5. **Accesibilidad** - Añade `aria-label` para lectores de pantalla

¿Te gustaría que implemente alguna de estas opciones específicamente?
