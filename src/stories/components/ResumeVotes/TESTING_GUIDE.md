# Guía de Pruebas para ResumeVotes en Storybook

## Ejecutar Storybook

```bash
npm run storybook
```

Esto abrirá Storybook en http://localhost:6006

## Historias Creadas

### 📁 Components/ResumeVotes

Historias principales del componente con diferentes escenarios de datos.

### 📁 Components/ResumeVotes/ScrollTest

Historias específicas para probar comportamiento de scroll y overflow.

### 📁 Components/ResumeVotes/ResponsiveTest

Historias para probar el diseño responsive en diferentes tamaños de pantalla.

## Qué Probar

### 🎯 Comportamiento del Scroll

1. **Scroll Horizontal - Votos por Usuario**

   - Ve a `ScrollTest > Scroll Horizontal - Votos por Usuario`
   - Observa cómo se comporta la sección de votos con 15 usuarios
   - Verifica que el scroll horizontal funciona correctamente
   - Prueba en diferentes vistas (grid/list)

2. **Scroll Vertical - Muchas Tareas**

   - Ve a `ScrollTest > Scroll Vertical - Muchas Tareas`
   - Scroll por las 12 tareas
   - Verifica que el rendimiento se mantiene

3. **Contenedor Pequeño**
   - Ve a `ScrollTest > Contenedor Pequeño - Scroll Forzado`
   - Observa cómo se comporta en un contenedor con altura limitada
   - Simula el uso en modales o secciones limitadas

### 📱 Comportamiento Responsive

1. **Prueba Manual de Viewports**

   - Ve a `ResponsiveTest > Transición Responsive`
   - Usa el selector de viewport en Storybook (esquina superior izquierda)
   - Prueba estos tamaños:
     - Desktop (1200px+): Funcionalidad completa
     - Tablet (900px): Toggles solo iconos
     - Mobile (768px-): Toggles ocultos, grid forzado

2. **Historias Específicas por Tamaño**
   - Prueba cada historia en `ResponsiveTest`
   - Observa las diferencias entre cada tamaño
   - Verifica que el layout se adapta correctamente

### 🧪 Casos Extremos

1. **Muchos Usuarios (25-50)**

   - Ve a `ResumeVotes > Muchos Usuarios`
   - Ve a `ScrollTest > Overflow Test - Sección de Votos`
   - Observa si el scroll horizontal funciona bien
   - Verifica que no se rompe el layout

2. **Muchas Tareas (20-50)**

   - Ve a `ResumeVotes > Muchas Tareas`
   - Ve a `ScrollTest > Scroll Vertical - Muchas Tareas`
   - Prueba el scroll vertical
   - Verifica el rendimiento

3. **Contenido Largo**
   - Ve a `ResumeVotes > Nombres de Usuario Largos`
   - Ve a `ResumeVotes > Descripciones Largas de Tareas`
   - Verifica que el texto se trunca correctamente
   - Observa que el layout no se rompe

### ⚙️ Funcionalidades Específicas

1. **Toggles Grid/List**

   - En cualquier historia (excepto móvil), prueba cambiar entre vistas
   - Observa las diferencias en layout
   - Verifica que la separación de `.task-votes` es correcta:
     - **Grid**: border-top (separación horizontal)
     - **List**: border-left en desktop (separación vertical)

2. **Estados Especiales**

   - Ve a `ResumeVotes > Estado Vacío`
   - Ve a `ResumeVotes > Sin Votos`
   - Verifica que los mensajes son informativos

3. **Consenso Visual**
   - Ve a `ResumeVotes > Variaciones de Consenso`
   - Observa los colores de los badges de consenso:
     - Verde: consenso alto (80%+)
     - Amarillo: consenso medio (60-80%)
     - Rojo: consenso bajo (<60%)

## Checklist de Pruebas

### ✅ Funcionalidad Básica

- [ ] Estadísticas generales se calculan correctamente
- [ ] Toggles de vista funcionan (donde están visibles)
- [ ] Votos por usuario se muestran correctamente
- [ ] Botón de Jira aparece y es clickeable

### ✅ Responsive Design

- [ ] **Desktop (1200px+)**: Toggles con texto e iconos
- [ ] **Tablet (768-900px)**: Toggles solo iconos
- [ ] **Mobile (<768px)**: Toggles ocultos, grid forzado
- [ ] Layout se adapta correctamente en todas las resoluciones

### ✅ Scroll y Performance

- [ ] Scroll horizontal funciona con muchos usuarios
- [ ] Scroll vertical funciona con muchas tareas
- [ ] No hay problemas de rendimiento con contenido extremo
- [ ] Layout se mantiene con overflow

### ✅ UX/UI

- [ ] **Grid view**: `.task-votes` tiene border-top
- [ ] **List view desktop**: `.task-votes` tiene border-left
- [ ] **List view mobile**: `.task-votes` tiene border-top
- [ ] Nombres largos se truncan correctamente
- [ ] Descripciones largas no rompen el layout
- [ ] Colores de consenso son correctos

## Problemas Comunes a Buscar

### 🐛 Layout

- [ ] ¿Se rompe el grid con muchos elementos?
- [ ] ¿El scroll horizontal causa overflow no deseado?
- [ ] ¿Los toggles se comportan correctamente en los puntos de quiebre?

### 🐛 Performance

- [ ] ¿Hay lag con 50+ usuarios?
- [ ] ¿El scroll es suave con mucho contenido?
- [ ] ¿Se mantiene responsive con casos extremos?

### 🐛 Responsive

- [ ] ¿Los toggles se ocultan correctamente en móvil?
- [ ] ¿La separación de `.task-votes` es correcta en cada vista?
- [ ] ¿El contenido es legible en pantallas pequeñas?

## Comandos Útiles

```bash
# Ejecutar solo Storybook
npm run storybook

# Build de Storybook para producción
npm run build-storybook

# Linting del código
npm run lint

# Format del código
npm run format
```

## Notas para Desarrollo

- Los datos mock se generan automáticamente en cada historia
- Las historias usan Redux mock stores para simular el estado real
- Las rutas se simulan con MemoryRouter
- Los viewports personalizados están definidos en `storybook-utils.ts`

## Reportar Problemas

Si encuentras problemas:

1. Anota en qué historia específica ocurre
2. Incluye el tamaño de viewport donde se reproduce
3. Describe el comportamiento esperado vs el observado
4. Si es posible, incluye screenshots

¡Happy testing! 🚀
