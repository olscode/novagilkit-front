# ResumeVotes Stories

Este archivo contiene las historias de Storybook para el componente `ResumeVotes`, que muestra el resumen de votaciones del Planning Poker.

## Historias Disponibles

### 1. Vista por Defecto

- **Propósito**: Mostrar el comportamiento normal del componente
- **Datos**: 5 usuarios, 6 tareas con votos normales
- **Características**: Todas las funcionalidades básicas activas

### 2. Muchos Usuarios (25 usuarios)

- **Propósito**: Probar el comportamiento con muchos votantes
- **Datos**: 25 usuarios, 8 tareas
- **Características**:
  - Prueba el scroll horizontal en la sección de votos por usuario
  - Verifica el rendimiento con muchos elementos
  - Prueba el layout responsive con contenido expandido

### 3. Muchas Tareas (20 tareas)

- **Propósito**: Probar el scroll vertical y rendimiento
- **Datos**: 8 usuarios, 20 tareas
- **Características**:
  - Scroll vertical en la vista principal
  - Rendimiento con mucho contenido
  - Navegación entre muchas tareas

### 4. Variaciones de Consenso

- **Propósito**: Mostrar diferentes niveles de consenso
- **Datos**: 3 tareas con consenso alto, medio y bajo
- **Características**:
  - Consenso alto (100%): todos votan igual
  - Consenso medio (60-80%): votos similares
  - Consenso bajo (<60%): votos muy dispersos

### 5. Estado Vacío

- **Propósito**: Mostrar el estado sin datos
- **Datos**: Sala vacía sin usuarios ni tareas
- **Características**: Mensaje de estado vacío con sugerencias

### 6. Sin Votos

- **Propósito**: Tareas creadas pero sin votaciones
- **Datos**: 4 usuarios, 2 tareas sin votos
- **Características**: Estado cuando no hay votaciones completadas

## Historias Responsive

### 7. Vista Mobile

- **Propósito**: Probar la vista móvil optimizada
- **Viewport**: Mobile (375px)
- **Características**:
  - Toggles ocultos
  - Vista de grid forzada
  - Layout optimizado para pantallas pequeñas

### 8. Vista Tablet

- **Propósito**: Probar la vista para tablets
- **Viewport**: Tablet (768px)
- **Características**:
  - Toggles con solo iconos
  - Layout intermedio
  - Navegación optimizada

## Casos Extremos

### 9. Caso Extremo - 50 Usuarios

- **Propósito**: Probar rendimiento con muchos usuarios
- **Datos**: 50 usuarios, 5 tareas
- **Características**:
  - Prueba de rendimiento
  - Scroll horizontal extensivo
  - Manejo de muchos elementos DOM

### 10. Caso Extremo - 50 Tareas

- **Propósito**: Probar rendimiento con muchas tareas
- **Datos**: 6 usuarios, 50 tareas
- **Características**:
  - Scroll vertical extensivo
  - Rendimiento con mucho contenido
  - Navegación en listas largas

## Casos Especiales

### 11. Nombres de Usuario Largos

- **Propósito**: Probar truncamiento de texto
- **Datos**: 6 usuarios con nombres muy largos
- **Características**:
  - Truncamiento con ellipsis
  - Layout responsive con texto largo
  - Tooltips para nombres completos

### 12. Descripciones Largas de Tareas

- **Propósito**: Probar layout con descripciones extensas
- **Datos**: 3 tareas con descripciones muy largas
- **Características**:
  - Manejo de texto largo
  - Layout responsive
  - Legibilidad mantenida

## Cómo Usar

1. **Ejecutar Storybook**:

   ```bash
   npm run storybook
   ```

2. **Navegar a las historias**:

   - Ir a `Components > ResumeVotes`
   - Seleccionar la historia deseada

3. **Probar diferentes escenarios**:
   - Cambiar el viewport para probar responsive
   - Usar los controles de Storybook para interactuar
   - Inspeccionar el código fuente

## Qué Probar

### Funcionalidad

- [ ] Toggles de vista grid/list funcionan correctamente
- [ ] Estadísticas generales se calculan correctamente
- [ ] Votos por usuario se muestran correctamente
- [ ] Botón de exportar a Jira aparece y funciona

### Responsive

- [ ] En mobile: toggles ocultos, vista grid forzada
- [ ] En tablet: toggles con solo iconos
- [ ] En desktop: todas las funcionalidades visibles

### Rendimiento

- [ ] Scroll suave con muchos usuarios
- [ ] Rendimiento aceptable con muchas tareas
- [ ] Sin problemas de layout con contenido extremo

### UX/UI

- [ ] Truncamiento de nombres largos
- [ ] Layout mantiene estructura con texto largo
- [ ] Colores de consenso correctos
- [ ] Estados vacíos informativos

## Notas Técnicas

- Las historias usan datos mock generados automáticamente
- Se incluye un store de Redux mock para cada historia
- Las rutas son simuladas con MemoryRouter
- Los nombres de usuario se reciclan si hay más usuarios que nombres disponibles
- Las tareas se generan con descripciones realistas para Planning Poker
