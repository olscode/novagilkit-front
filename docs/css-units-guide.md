# 📏 Guía de Unidades CSS: `rem` vs `px`

Una guía completa para saber cuándo usar `rem`, `px` y otras unidades CSS en nuestros proyectos, con ejemplos prácticos del componente `ProtectedRoute`.

## 🎯 Principio Fundamental

- **`rem`** = Todo lo que debe **escalar** con las preferencias del usuario
- **`px`** = Todo lo que debe mantener **precisión visual** constante
- **Otras unidades** = Según el contexto específico

---

## ✅ Propiedades que DEBEN usar `rem`

### 🔤 **Tipografía**

```scss
// ✅ Correcto - escala con preferencias del usuario
font-size: 1.8rem;
font-size: 1.1rem;
font-size: 0.95rem;

// ❌ Evitar - no respeta zoom del usuario
font-size: 18px;
font-size: 14px;
```

### 📦 **Espaciado y Layout**

```scss
// ✅ Correcto - espaciado escalable
padding: 3rem 2rem;
margin-bottom: 1.5rem;
gap: 1rem;

// ✅ Contenedores principales
max-width: 31.25rem; // 500px equivalente
width: 20rem;
min-height: 15rem;

// ❌ Evitar para espaciado principal
padding: 30px 20px;
margin-bottom: 15px;
```

### 🎯 **Elementos de Interfaz**

```scss
// ✅ Iconos que deben escalar con texto
font-size: 4rem; // Para iconos
.icon {
  width: 2rem;
  height: 2rem;
}

// ✅ Posicionamiento escalable
top: 2rem;
left: 1rem;
```

---

## ✅ Propiedades que DEBEN usar `px`

### 🎨 **Elementos Decorativos**

```scss
// ✅ Correcto - precisión visual
border: 1px solid var(--border-color);
border-radius: 16px;
outline: 2px solid var(--focus-color);

// ❌ Evitar - bordes inconsistentes
border: 0.0625rem solid var(--border-color); // Demasiado preciso
border-radius: 1rem; // Puede verse extraño en diferentes zooms
```

### ✨ **Efectos Visuales**

```scss
// ✅ Correcto - efectos precisos
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
backdrop-filter: blur(10px);

// ❌ Evitar - efectos impredecibles
box-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.1);
backdrop-filter: blur(0.625rem);
```

### 🔧 **Elementos Técnicos**

```scss
// ✅ Transformaciones precisas
transform: translateX(10px);
transform: translateY(-5px);

// ✅ Valores muy pequeños
border-bottom: 1px solid var(--divider);
```

---

## 🎯 Otras Unidades Recomendadas

### 📱 **Viewport y Porcentajes**

```scss
// ✅ Altura de viewport
min-height: 100vh;
max-height: 80vh;

// ✅ Ancho responsive
width: 100%;
max-width: 100%;
```

### ⚡ **Sin Unidad**

```scss
// ✅ Line-height relativo
line-height: 1.3;
line-height: 1.6;

// ✅ Otros valores
opacity: 0.8;
z-index: 10;
flex: 1;
```

### 📐 **Media Queries**

```scss
// ✅ Breakpoints estándar en px
@media (max-width: 768px) {
}
@media (min-width: 1024px) {
}

// ✅ También aceptable en em para algunos casos
@media (max-width: 48em) {
} // 768px equivalent
```

---

## 💡 Ejemplo Práctico: ProtectedRoute Component

```scss
.protected-route-message {
  // Viewport - correcto
  min-height: 100vh;

  // Espaciado escalable - rem ✅
  padding: 2rem;

  &__content {
    // Tamaño escalable - rem ✅
    max-width: 31.25rem; // 500px escalable

    // Espaciado - rem ✅
    padding: 3rem 2rem;

    // Decoración - px ✅
    border-radius: 16px;
    border: 1px solid var(--border-color);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
  }

  &__icon {
    // Tipografía escalable - rem ✅
    font-size: 4rem;
    margin-bottom: 1.5rem;

    // Efectos precisos - px ✅
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  }

  &__title {
    // Tipografía - rem ✅
    font-size: 1.8rem;
    margin-bottom: 1rem;

    // Sin unidad para proporciones ✅
    line-height: 1.3;
  }

  &__description {
    // Tipografía - rem ✅
    font-size: 1.1rem;
    margin-bottom: 1.5rem;

    // Sin unidad ✅
    line-height: 1.6;
  }

  // Responsive con px ✅
  @media (max-width: 768px) {
    padding: 1rem; // rem para espaciado ✅

    &__content {
      padding: 2rem 1.5rem; // rem ✅
    }

    &__icon {
      font-size: 3rem; // rem ✅
    }
  }
}
```

---

## 🎨 Casos Especiales

### **Animaciones**

```scss
// ✅ Movimientos - px para precisión
@keyframes slideIn {
  from {
    transform: translateX(-20px);
  }
  to {
    transform: translateX(0);
  }
}

// ✅ Escalado - sin unidad
@keyframes pulse {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.05);
  }
}
```

### **Grid y Flexbox**

```scss
// ✅ Gaps escalables
gap: 1rem 0.5rem;

// ✅ Tamaños fijos cuando sea necesario
grid-template-columns: 200px 1fr 150px;

// ✅ Tamaños escalables
grid-template-columns: 12.5rem 1fr 9.375rem;
```

---

## 🔍 Tabla de Referencia Rápida

| Propiedad                     | Unidad Recomendada | Razón                              |
| ----------------------------- | ------------------ | ---------------------------------- |
| `font-size`                   | `rem`              | Escalabilidad con zoom del usuario |
| `padding/margin`              | `rem`              | Espaciado proporcional             |
| `width/height` (contenedores) | `rem`              | Tamaños escalables                 |
| `border-width`                | `px`               | Precisión visual                   |
| `border-radius`               | `px`               | Consistencia visual                |
| `box-shadow`                  | `px`               | Efectos precisos                   |
| `line-height`                 | sin unidad         | Proporcional al font-size          |
| `min-height` (viewport)       | `vh`               | Relativo a viewport                |
| Media queries                 | `px` o `em`        | Breakpoints estándar               |

---

## 🚀 Beneficios de Esta Aproximación

### ✅ **Accesibilidad**

- Respeta las preferencias de zoom del usuario
- Mejora la experiencia para usuarios con discapacidades visuales
- Cumple con estándares de accesibilidad web

### ✅ **Mantenibilidad**

- Código más predecible y consistente
- Fácil de escalar y modificar
- Reduce errores de UI en diferentes dispositivos

### ✅ **UX/UI**

- Interfaces que se adaptan mejor a diferentes contextos
- Elementos decorativos que mantienen su intención visual
- Mejor experiencia en dispositivos con diferentes densidades de píxeles

---

## 📚 Recursos Adicionales

- [MDN: CSS Units](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html)
- [CSS Tricks: Font Size Idea](https://css-tricks.com/rems-ems/)

---

_Última actualización: 29 de Junio, 2025_
_Autor: Sistema de Design Nova Tools_
