# Reactividad de Selectores en Redux

## 📖 Introducción

Los selectores de Redux son funciones que extraen y calculan datos del estado global. Su **reactividad** significa que se actualizan automáticamente cuando cambia cualquier parte del estado de la que dependen.

## 🔄 Cómo Funciona la Reactividad

### Flujo de Reactividad

```
Action Dispatch → Reducer actualiza state → Selector detecta cambio → Componente re-renderiza
```

### Elementos Clave

1. **`createSelector`**: Crea selectores memoizados que se recalculan solo cuando sus dependencias cambian
2. **Dependencias**: Las partes del estado que el selector "observa"
3. **Memoización**: Evita cálculos innecesarios si las dependencias no han cambiado
4. **React-Redux**: Conecta los selectores con el ciclo de vida de React

## 📊 Ejemplo 1: Progreso de Votación (`selectVotingProgress`)

### El Selector

```typescript
export const selectVotingProgress = () =>
  createSelector(
    (state: State) => state.room, // 🎯 Dependencia principal
    (room) => {
      const task = room.tasks.find((t) => t.id === room.currentTaskId);
      if (!task) {
        return {
          totalUsers: 0,
          votedUsers: 0,
          pendingUsers: 0,
          percentage: 0,
          status: VotingStatus.NOT_STARTED,
        };
      }
      const total = room.users.length; // 👀 Observa room.users
      const voted = Object.keys(task.voting.votes).length; // 👀 Observa task.voting.votes
      const pending = total - voted;
      const percentage = total ? (voted / total) * 100 : 0;
      return {
        totalUsers: total,
        votedUsers: voted,
        pendingUsers: pending,
        percentage,
        status: task.voting.status, // 👀 Observa task.voting.status
      };
    }
  );
```

### Qué Partes del Estado Observa

| **Propiedad**                | **Cuándo Cambia**      | **Acción que lo Dispara** |
| ---------------------------- | ---------------------- | ------------------------- |
| `room.users`                 | Usuario se une/sale    | `updateListUsers`         |
| `room.tasks[].voting.votes`  | Usuario vota           | `registerUserVote`        |
| `room.tasks[].voting.status` | Cambia estado votación | `updateVotingStatus`      |
| `room.currentTaskId`         | Cambia tarea activa    | `setCurrentTaskId`        |

### Flujo de Actualización

```typescript
// 🗳️ 1. Usuario vota
handleVote(5)
  ↓
// 📤 2. Envía al servidor
socket.emit('registerVote', {...})
  ↓
// 📥 3. Servidor confirma
handleVoteRegistered recibe evento
  ↓
// 🔄 4. Actualiza Redux
dispatch(registerUserVote({ userId, taskId, vote: 5 }))
  ↓
// ✨ 5. Reducer modifica state.room.tasks[x].voting.votes
  ↓
// 🎯 6. Selector detecta cambio automáticamente
selectVotingProgress() recalcula
  ↓
// 🖼️ 7. Componente se re-renderiza
votingProgress.votedUsers: 2 → 3
votingProgress.percentage: 66% → 100%
```

### En el Componente

```typescript
const votingProgress = useAppSelector(selectVotingProgress());

// Se actualiza automáticamente cuando:
// - Un usuario vota
// - Se une/sale un usuario
// - Cambia el estado de votación
// - Se cambia de tarea

return (
  <div className="progress-text">
    {votingProgress.votedUsers}/{votingProgress.totalUsers} usuarios votaron
    {/* ↑ Se actualiza en tiempo real */}
  </div>
);
```

## 👑 Ejemplo 2: Verificar si es Creador (`selectIsUserCreator`)

### El Selector

```typescript
export const selectIsUserCreator = () =>
  createSelector(
    (state: State) => state.room.creatorId, // 🎯 Dependencia 1
    (state: State) => state.profile.userId, // 🎯 Dependencia 2
    (creatorId, userId) => creatorId === userId // 🧮 Cálculo
  );
```

### Cuándo se Actualiza

| **Evento**            | **Estado que Cambia**           | **Resultado**           |
| --------------------- | ------------------------------- | ----------------------- |
| Usuario crea sala     | `room.creatorId` se establece   | `true` para creador     |
| Usuario se une a sala | `room.creatorId` ya establecido | `false` para no-creador |
| Cambio de perfil      | `profile.userId` cambia         | Recalcula comparación   |

### Flujo de Actualización

```typescript
// 🏠 1. Usuario crea sala
dispatch(createRoom({
  roomId: 'ABC123',
  creatorId: 'user-123', // ← Se establece
  // ...
}))
  ↓
// 🎯 2. Selector detecta cambio en room.creatorId
selectIsUserCreator() recalcula
  ↓
// ✅ 3. Resultado: true (si profile.userId === 'user-123')
  ↓
// 🖼️ 4. Componente muestra botones de creador
{isCreator && (
  <button onClick={handleStartNewVoteClick}>
    Iniciar Votación
  </button>
)}
```

## 🔗 Ejemplo 3: Mapa de Votos (`selectCurrentTaskVotesMap`)

### El Selector

```typescript
export const selectCurrentTaskVotesMap = () =>
  createSelector(
    (state: State) => state.room.tasks, // 🎯 Dependencia 1
    (state: State) => state.room.currentTaskId, // 🎯 Dependencia 2
    (tasks, currentTaskId) => {
      if (!currentTaskId) return {};
      const task = tasks.find((t) => t.id === currentTaskId);
      return task?.voting.votes ?? {}; // 📊 Record<userId, vote>
    }
  );
```

### Múltiples Dependencias

Este selector se actualiza cuando cambia **cualquiera** de sus dependencias:

```typescript
// ⚡ Cambio en tasks → Selector se actualiza
dispatch(updateTasks(newTasks));

// ⚡ Cambio en currentTaskId → Selector se actualiza
dispatch(setCurrentTaskId('task-2'));

// ⚡ Cambio en votos → Selector se actualiza
dispatch(registerUserVote({ userId: 'user-1', taskId: 'task-1', vote: 8 }));
```

### En el Componente

```typescript
const votesMap = useAppSelector(selectCurrentTaskVotesMap());

return (
  <div className="users-grid">
    {room.users.map((user) => {
      const hasVoted = votesMap[user.userId] != null; // ← Se actualiza automáticamente
      const voteValue = hasVoted ? String(votesMap[user.userId]) : '';

      return (
        <UserCard
          voteNumber={voteValue} // ← Muestra voto en tiempo real
          className={hasVoted ? 'has-voted' : ''} // ← Estado visual reactivo
        />
      );
    })}
  </div>
);
```

## 📈 Ejemplo 4: Estadísticas de Votos (`selectCurrentTaskVoteStats`)

### El Selector

```typescript
export const selectCurrentTaskVoteStats = () =>
  createSelector(
    selectCurrentTaskVotes(), // 🎯 Dependencia: otro selector
    (votes) => {
      if (votes.length === 0) {
        return { average: 0, max: 0, min: 0, median: 0, count: 0 };
      }
      const nums = votes.map((v) => v.vote).sort((a, b) => a - b);
      const count = nums.length;
      const sum = nums.reduce((a, b) => a + b, 0);
      const average = sum / count;
      const min = nums[0];
      const max = nums[count - 1];
      const median =
        count % 2 === 0
          ? (nums[count / 2 - 1] + nums[count / 2]) / 2
          : nums[Math.floor(count / 2)];
      return { average, max, min, median, count };
    }
  );
```

### Composición de Selectores

Este ejemplo muestra una característica avanzada: **composición de selectores**.

- `selectCurrentTaskVoteStats` depende de `selectCurrentTaskVotes()`
- Cuando `selectCurrentTaskVotes` cambia, `selectCurrentTaskVoteStats` se recalcula automáticamente
- Crea una **cadena de reactividad**

### Cadena de Dependencias

```typescript
// 🔗 Cadena de selectores
state.room.tasks[].voting.votes  // Estado raw
    ↓
selectCurrentTaskVotes()         // Selector base
    ↓
selectCurrentTaskVoteStats()     // Selector compuesto
    ↓
Componente React                 // UI
```

### Flujo de Actualización

```typescript
// 🗳️ 1. Usuario vota
dispatch(registerUserVote({ userId: 'user-1', taskId: 'task-1', vote: 8 }))
  ↓
// 🔄 2. Se actualiza state.room.tasks[0].voting.votes
  ↓
// 🎯 3. selectCurrentTaskVotes() detecta cambio y recalcula
// Resultado: [{ userId: 'user-1', vote: 8 }, { userId: 'user-2', vote: 5 }]
  ↓
// 📊 4. selectCurrentTaskVoteStats() detecta que sus datos cambiaron
// Recalcula: { average: 6.5, max: 8, min: 5, median: 6.5, count: 2 }
  ↓
// 🖼️ 5. Componente muestra estadísticas actualizadas
```

### En el Componente

```typescript
const voteStats = useAppSelector(selectCurrentTaskVoteStats());

// Se actualiza automáticamente con cada voto
return (
  <div className="vote-statistics">
    <h3>Estadísticas</h3>
    <div className="stats-grid">
      <div className="stat-item">
        <div className="stat-label">Promedio</div>
        <div className="stat-value">{voteStats.average.toFixed(1)}</div>
        {/* ↑ Se recalcula automáticamente */}
      </div>
      <div className="stat-item">
        <div className="stat-label">Mediana</div>
        <div className="stat-value">{voteStats.median}</div>
        {/* ↑ Se recalcula automáticamente */}
      </div>
      <div className="stat-item">
        <div className="stat-label">Mínimo</div>
        <div className="stat-value">{voteStats.min}</div>
      </div>
      <div className="stat-item">
        <div className="stat-label">Máximo</div>
        <div className="stat-value">{voteStats.max}</div>
      </div>
    </div>
  </div>
);
```

### Ventajas de la Composición

| **Beneficio**      | **Descripción**                                            |
| ------------------ | ---------------------------------------------------------- |
| **Reutilización**  | `selectCurrentTaskVotes` se puede usar en otros selectores |
| **Mantenibilidad** | Cambios en la lógica base se propagan automáticamente      |
| **Testabilidad**   | Puedes testear cada selector independientemente            |
| **Optimización**   | Cada nivel de memoización evita cálculos innecesarios      |

### Ejemplo de Actualización en Tiempo Real

```typescript
// Estado inicial: Sin votos
voteStats = { average: 0, max: 0, min: 0, median: 0, count: 0 };

// Usuario 1 vota 8
dispatch(registerUserVote({ userId: 'user-1', vote: 8 }));
// ↓ Automáticamente:
voteStats = { average: 8, max: 8, min: 8, median: 8, count: 1 };

// Usuario 2 vota 5
dispatch(registerUserVote({ userId: 'user-2', vote: 5 }));
// ↓ Automáticamente:
voteStats = { average: 6.5, max: 8, min: 5, median: 6.5, count: 2 };

// Usuario 3 vota 13
dispatch(registerUserVote({ userId: 'user-3', vote: 13 }));
// ↓ Automáticamente:
voteStats = { average: 8.67, max: 13, min: 5, median: 8, count: 3 };
```

## 🚀 Ventajas de la Reactividad

### ✅ **Beneficios**

1. **UI siempre sincronizada**: No hay estados inconsistentes
2. **Cálculos automáticos**: No necesitas disparar manualmente actualizaciones
3. **Optimización**: Solo recalcula cuando es necesario (memoización)
4. **Menos bugs**: Reduces la posibilidad de olvidar actualizar algo
5. **Código más limpio**: Lógica declarativa vs imperativa

### 📊 **Comparación**

| **Con Selectores Reactivos**       | **Sin Selectores (Manual)**                    |
| ---------------------------------- | ---------------------------------------------- |
| `votingProgress` se actualiza solo | Debes llamar `updateProgress()` en cada cambio |
| Un selector para toda la app       | Lógica duplicada en múltiples componentes      |
| Memoización automática             | Cálculos repetidos innecesarios                |
| Tipado automático                  | Propenso a errores de tipos                    |

## 🛠️ Mejores Prácticas

### 1. **Granularidad de Dependencias**

```typescript
// ✅ Bueno: Dependencias específicas
createSelector(
  (state: State) => state.room.users,
  (state: State) => state.room.currentTaskId,
  (users, taskId) => {
    /* cálculo */
  }
);

// ❌ Evitar: Dependencia muy amplia
createSelector(
  (state: State) => state, // ← Se actualiza con CUALQUIER cambio
  (state) => {
    /* cálculo */
  }
);
```

### 2. **Nomenclatura Clara**

```typescript
// ✅ Nombres descriptivos
selectCurrentTaskVoteStats();
selectHasCurrentUserVoted();
selectVotingProgress();

// ❌ Nombres genéricos
selectData();
selectInfo();
selectStuff();
```

### 3. **Composición de Selectores**

```typescript
// ✅ Reutilizar selectores existentes
export const selectCurrentTaskVoteStats = () =>
  createSelector(
    selectCurrentTaskVotes(), // ← Reutiliza otro selector
    (votes) => {
      // Cálculos de estadísticas...
    }
  );
```

## 🔍 Debugging de Selectores

### Logs de Debugging

```typescript
export const selectVotingProgress = () =>
  createSelector(
    (state: State) => state.room,
    (room) => {
      console.log('🔄 selectVotingProgress recalculando:', {
        currentTaskId: room.currentTaskId,
        usersCount: room.users.length,
        // ...
      });

      // ... lógica del selector
    }
  );
```

### Redux DevTools

Los selectores aparecen en Redux DevTools y puedes ver:

- Cuándo se disparan
- Qué valores devuelven
- Qué dependencias cambiaron

## 🎯 Conclusión

La reactividad de los selectores de Redux es **automática y transparente**. Una vez configurados correctamente:

1. **Se actualizan solos** cuando cambian sus dependencias
2. **Optimizan rendimiento** con memoización
3. **Mantienen la UI sincronizada** sin intervención manual
4. **Reducen bugs** eliminando la necesidad de actualizaciones manuales

Esto hace que tu aplicación sea más robusta, eficiente y fácil de mantener.
