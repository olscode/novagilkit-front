# Configuración de Integración con Jira

## Resumen

Esta funcionalidad permite exportar las tareas estimadas en Planning Votes directamente como issues de Jira bajo una Epic específica, incluyendo todos los metadatos de la estimación (promedio, consenso, votos individuales, etc.).

## Configuración Inicial

### 1. Crear Aplicación OAuth en Atlassian

1. Ve a [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/)
2. Haz clic en **"Create"** → **"OAuth 2.0 integration"**
3. Proporciona un nombre para tu app (ej: "Nova Tools - Planning Votes")
4. Configura los **Permissions (scopes)**:
   - `read:jira-work` - Para leer proyectos y issues
   - `write:jira-work` - Para crear y modificar issues
   - `manage:jira-project` - Para gestionar proyectos

### 2. Configurar URLs de Callback

En la configuración de tu app OAuth:

- **Development**: `http://localhost:5173/jira-callback.html`
- **Production**: `https://tudominio.com/jira-callback.html`

### 3. Variables de Entorno

Las variables ya están configuradas en `.env.development`:

```bash
# Configuración OAuth de Jira
VITE_JIRA_CLIENT_ID=YOUR_CLIENT_ID
VITE_JIRA_CLIENT_SECRET=YOUR_JIRA_SECRET_CLIENT_ID
```

**Nota:** Si necesitas diferentes credenciales para desarrollo local, puedes crear un archivo `.env.local` que tendrá prioridad sobre `.env.development`.

## Funcionalidades

### ✅ Autenticación Segura

- OAuth 2.0 con Atlassian
- Autenticación en popup (no interrumpe la experiencia)
- Tokens almacenados de forma segura en localStorage
- Renovación automática de tokens

### ✅ Selección de Destino

- Lista de proyectos accesibles del usuario
- Selección de Epic existente o creación de nueva Epic
- Preview de todas las tareas antes de crear

### ✅ Mapeo Inteligente de Datos

- **Descripción de tarea** → **Summary** del issue
- **Estimación promedio** → **Story Points** (custom field)
- **Estadísticas completas** → **Descripción** detallada del issue
- **Metadatos de votación** → Información preservada en la descripción

### ✅ Creación Masiva

- Creación de múltiples stories de una vez
- Manejo de errores individuales por tarea
- Resultados detallados con enlaces directos a Jira
- Rollback automático en caso de fallos críticos

## Uso de la Funcionalidad

### 1. Desde ResumeVotes

1. Completa una sesión de Planning Votes con tu equipo
2. Ve al resumen de votación
3. Haz clic en el botón **"Exportar a Jira"**

### 2. Proceso de Exportación

1. **Autenticación**: Conéctate con tu cuenta de Jira
2. **Selección**: Elige proyecto y epic (o crea una nueva)
3. **Preview**: Revisa las tareas que se van a crear
4. **Creación**: Las tareas se crean automáticamente
5. **Resultados**: Ve el resumen con enlaces directos

## Estructura de Issues Creados

### Epic (si se crea nueva)

```
Título: [El que definas]
Descripción: [Opcional, la que definas]
```

### Stories

```
Título: [Descripción de la tarea del Planning Votes]
Tipo: Story
Parent: [Epic seleccionada]
Story Points: [Promedio redondeado de la estimación]

Descripción:
📊 Resultados del Planning Votes
• Estimación promedio: X.X puntos
• Mediana: X puntos
• Consenso del equipo: X%
• Rango de estimaciones: X - X puntos
• Participantes: X votos

🗳️ Detalles de votación:
• Usuario1: X puntos
• Usuario2: X puntos
• ...
```

## Beneficios

### 🔄 Flujo Completo Integrado

- **Estimación** (Planning Votes) → **Planificación** (Jira) → **Desarrollo**
- Sin pérdida de contexto entre herramientas
- Trazabilidad completa del proceso

### 📊 Preservación de Datos

- Todas las estimaciones individuales se conservan
- Métricas de consenso para análisis posteriores
- Historial completo del proceso de estimación

### ⚡ Automatización

- Reduce trabajo manual significativamente
- Formato consistente para todas las historias
- Previene errores de transcripción

### 📈 Análisis y Mejora

- Datos disponibles para retrospectivas
- Análisis de precisión de estimaciones
- Identificación de patrones del equipo

## Seguridad

- **OAuth 2.0**: Estándar de la industria para autenticación
- **Tokens seguros**: Almacenados localmente con rotación automática
- **Permisos mínimos**: Solo los scopes necesarios
- **Validación**: Verificación de estado en todas las transacciones

## Limitaciones Técnicas

### Rate Limits de Jira

- 10,000 requests por hora por aplicación
- Implementamos throttling automático para respetarlos

### Campos Personalizados

- Story Points: `customfield_10016` (estándar en la mayoría de instancias)
- Si tu instancia usa un campo diferente, se puede configurar

### Tipos de Issue

- Epic: Debe estar habilitado en el proyecto
- Story: Debe estar habilitado en el proyecto
- Se pueden mapear a otros tipos si es necesario

## Troubleshooting

### Error: "No accessible Jira resources found"

- Verifica que tienes acceso a al menos un sitio de Jira
- Revisa los permisos de tu cuenta en Atlassian

### Error: "Missing authorization code or state"

- Verifica que las URLs de callback estén configuradas correctamente
- Asegúrate de que no hay bloqueadores de popups activos

### Error: "Failed to create epic/story"

- Verifica que el proyecto permite crear Epics/Stories
- Revisa que tu usuario tiene permisos de creación en el proyecto

### Variables de entorno no encontradas

- Asegúrate de que el archivo `.env.local` existe y tiene las variables correctas
- Reinicia el servidor de desarrollo después de cambiar variables de entorno

## Desarrollo y Extensión

La implementación está modularizada para facilitar extensiones:

- `JiraAuthService`: Manejo de autenticación OAuth
- `JiraApiService`: Comunicación con API de Jira
- `JiraExportModal`: UI del proceso de exportación
- `types/jira.ts`: Tipos TypeScript para type safety

### Posibles Extensiones Futuras

- Configuración de campos personalizados por proyecto
- Mapeo a diferentes tipos de issue (Task, Bug, etc.)
- Exportación a múltiples proyectos simultáneamente
- Integración con Jira Automation para workflows avanzados
- Sincronización bidireccional (actualizar desde Jira)

## Soporte

Para problemas específicos:

1. Verifica la configuración siguiendo esta guía
2. Revisa los logs de la consola del navegador
3. Consulta la documentación de Atlassian OAuth 2.0
4. Abre un issue en el repositorio con detalles del error
