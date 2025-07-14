# Dropdown Component

Un componente dropdown personalizado y moderno que se integra perfectamente con el sistema de temas de Nova Tools.

## Características

- 🎨 **Soporte completo para temas**: Funciona automáticamente con el sistema de temas claro/oscuro
- 🔍 **Búsqueda integrada**: Opción para habilitar búsqueda dentro de las opciones
- 🧹 **Clearable**: Permite limpiar la selección con un botón
- 📱 **Responsive**: Se adapta a diferentes tamaños de pantalla
- ♿ **Accesible**: Navegación por teclado y lectores de pantalla
- 🎯 **Múltiples tamaños**: Small, medium, large
- 🔧 **Estados**: Normal, disabled, loading, error
- 💨 **Animaciones suaves**: Transiciones fluidas y naturales

## Uso Básico

```tsx
import Dropdown, { DropdownOption } from '../components/Dropdown/Dropdown';

const options: DropdownOption[] = [
  {
    value: 'option1',
    label: 'Opción 1',
    description: 'Descripción opcional',
  },
  {
    value: 'option2',
    label: 'Opción 2',
    disabled: true,
  },
];

function MyComponent() {
  const [value, setValue] = useState('');

  return (
    <Dropdown
      options={options}
      value={value}
      onChange={setValue}
      placeholder="Selecciona una opción..."
      searchable
      clearable
      size="medium"
    />
  );
}
```

## Props

### DropdownProps

| Prop          | Tipo                             | Default            | Descripción                            |
| ------------- | -------------------------------- | ------------------ | -------------------------------------- |
| `options`     | `DropdownOption[]`               | `[]`               | Lista de opciones disponibles          |
| `value`       | `string`                         | `''`               | Valor actualmente seleccionado         |
| `onChange`    | `(value: string) => void`        | -                  | Callback cuando cambia la selección    |
| `placeholder` | `string`                         | `'Seleccionar...'` | Texto mostrado cuando no hay selección |
| `disabled`    | `boolean`                        | `false`            | Deshabilita la interacción             |
| `loading`     | `boolean`                        | `false`            | Muestra estado de carga                |
| `error`       | `boolean`                        | `false`            | Muestra estado de error                |
| `searchable`  | `boolean`                        | `false`            | Habilita la búsqueda                   |
| `clearable`   | `boolean`                        | `false`            | Permite limpiar la selección           |
| `size`        | `'small' \| 'medium' \| 'large'` | `'medium'`         | Tamaño del componente                  |
| `className`   | `string`                         | `''`               | Clases CSS adicionales                 |

### DropdownOption

| Prop          | Tipo       | Descripción                     |
| ------------- | ---------- | ------------------------------- |
| `value`       | `string`   | Valor único de la opción        |
| `label`       | `string`   | Texto principal mostrado        |
| `description` | `string?`  | Texto secundario opcional       |
| `disabled`    | `boolean?` | Si la opción está deshabilitada |

## Tamaños

- **Small**: Ideal para formularios compactos, altura mínima 32px
- **Medium**: Tamaño estándar para la mayoría de casos, altura mínima 40px
- **Large**: Para interfaces más espaciosas, altura mínima 48px

## Estados

- **Normal**: Estado por defecto
- **Disabled**: No permite interacción, opacidad reducida
- **Loading**: Muestra que se están cargando opciones
- **Error**: Indica un error, borde rojo

## Integración con el Sistema de Temas

El componente utiliza variables CSS definidas en `App.scss`:

### Variables Principales

- `--input-bg`: Fondo del input
- `--input-border`: Color del borde
- `--input-text`: Color del texto
- `--input-focus-bg`: Fondo cuando está enfocado
- `--primary-color`: Color principal para estados activos
- `--card-bg`: Fondo del menú dropdown
- `--text-secondary`: Color de texto secundario

### Soporte Automático de Temas

El componente respeta automáticamente:

- `@media (prefers-color-scheme: dark/light)`
- `[data-theme='dark']` y `[data-theme='light']`

## Ejemplos de Uso

### Selector de Proyecto Jira

```tsx
<Dropdown
  options={projects.map((project) => ({
    value: project.key,
    label: project.name,
    description: `Clave: ${project.key}`,
  }))}
  value={selectedProject}
  onChange={setSelectedProject}
  placeholder="Selecciona un proyecto..."
  searchable
  size="medium"
/>
```

### Selector con Estados

```tsx
<Dropdown
  options={teamOptions}
  value={selectedTeam}
  onChange={setSelectedTeam}
  placeholder="Selecciona un equipo..."
  disabled={!projectSelected}
  error={hasValidationError}
  clearable
  size="medium"
/>
```

### Búsqueda Avanzada

```tsx
<Dropdown
  options={userOptions}
  value={selectedUser}
  onChange={setSelectedUser}
  placeholder="Buscar usuario..."
  searchable
  clearable
  size="large"
/>
```

## Accesibilidad

- Navegación por teclado (Arrow keys, Enter, Escape)
- Labels apropiados para lectores de pantalla
- Estados de focus claramente visibles
- Soporte para atributos ARIA

## Testing

Para testear el componente en Storybook:

1. Ejecuta `npm run storybook`
2. Navega a `Component/Dropdown`
3. Prueba diferentes configuraciones y estados
4. Verifica el comportamiento en temas claro/oscuro

## Notas de Desarrollo

- El componente se cierra automáticamente al hacer clic fuera
- La búsqueda es insensible a mayúsculas/minúsculas
- Incluye debounce para optimizar la búsqueda
- Maneja adecuadamente listas largas con scroll virtual

## Compatibilidad

- React 18+
- TypeScript 4.5+
- Navegadores modernos (Chrome 90+, Firefox 90+, Safari 14+)
