import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  username: string;
  userId: string;
  active: boolean;
}

// Estados de la votación
export enum VotingStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
}

export interface Task {
  id: string;
  description: string;
  voting: {
    status: VotingStatus;
    votes: Record<string, number>; // userId → vote
  };
}

export interface Room {
  roomId: string;
  creatorId: string;
  users: User[];
  tasks: Task[];
  app: string;
  currentTaskId: string | null;
}

// Socket connection state interface
export interface SocketState {
  isConnected: boolean;
  connectionAttempts: number;
  lastConnectionError: string | null;
  reconnectionInProgress: boolean;
}

interface State {
  room: Room;
  profile: User;
  socket: SocketState;
}

const initialState: State = {
  room: {
    creatorId: '',
    roomId: '',
    tasks: [],
    users: [],
    app: '',
    currentTaskId: null,
  },
  profile: {
    username: '',
    userId: '',
    active: false,
  },
  socket: {
    isConnected: false,
    connectionAttempts: 0,
    lastConnectionError: null,
    reconnectionInProgress: false,
  },
};

const rootReducer = createSlice({
  name: 'root',
  initialState,
  reducers: {
    createRoom: (state, action: PayloadAction<Room>) => {
      state.room = action.payload;
    },
    createProfile: (state, action: PayloadAction<User>) => {
      state.profile = action.payload;
    },
    updateUsername: (state, action: PayloadAction<string>) => {
      state.profile.username = action.payload;
    },
    addUserToRoom: (
      state,
      action: PayloadAction<{ roomId: string; user: User }>
    ) => {
      const room = state.room;
      if (room) {
        room.users.push(action.payload.user);
      }
    },
    updateListUsers: (state, action: PayloadAction<User[]>) => {
      const room = state.room;
      if (room) {
        room.users = action.payload;
      }
    },
    updateRoomCreator: (state, action: PayloadAction<string>) => {
      const room = state.room;
      if (room) {
        room.creatorId = action.payload;
      }
    },
    addTaskToRoom: (
      state,
      action: PayloadAction<{ roomId: string; task: Task }>
    ) => {
      const room = state.room;
      if (room) {
        room.tasks.push(action.payload.task);
      }
    },
    updateTasks: (state, action: PayloadAction<Task[]>) => {
      const room = state.room;
      if (room) {
        room.tasks = action.payload;
      }
    },
    // Acción para registrar un voto de usuario
    registerUserVote: (
      state,
      action: PayloadAction<{
        userId: string;
        taskId: string;
        vote: number | null;
      }>
    ) => {
      const { userId, taskId, vote } = action.payload;
      const room = state.room;
      if (!room) return; // Actualizar voto dentro de la tarea
      const task = room.tasks.find((t) => t.id === taskId);
      if (task) {
        if (vote === null) {
          // Si el voto es nulo, lo eliminamos
          delete task.voting.votes[userId];
        } else {
          // Añadimos o actualizamos el voto
          task.voting.votes[userId] = vote;
        }
        // Check if voting needs to be started or completed
        const totalUsers = room.users.length;
        const votedUsers = Object.keys(task.voting.votes).length;

        console.log(
          `🔢 Usuario votó: ${votedUsers}/${totalUsers} - estado actual: ${task.voting.status}`
        );
      }
    },

    // Acción para actualizar la tarea seleccionada actualmente
    setCurrentTaskId: (state, action: PayloadAction<string | null>) => {
      const roomUpdated = {
        ...state.room,
        currentTaskId: action.payload,
      };
      state.room = { ...roomUpdated };
    },

    /**
     * updateVotingStatus:
     * Recibe { taskId, status } y actualiza state.room.tasks[].voting.status
     */
    updateVotingStatus: (
      state,
      action: PayloadAction<{ taskId: string; status: VotingStatus }>
    ) => {
      const { taskId, status } = action.payload;
      const task = state.room.tasks.find((t) => t.id === taskId);
      if (task) {
        task.voting.status = status;
      }
    },

    // Socket connection actions
    socketConnected: (state) => {
      state.socket.isConnected = true;
      state.socket.connectionAttempts = 0;
      state.socket.lastConnectionError = null;
      state.socket.reconnectionInProgress = false;
    },

    socketDisconnected: (state, action: PayloadAction<string | undefined>) => {
      state.socket.isConnected = false;
      state.socket.lastConnectionError = action.payload || null;
      state.socket.reconnectionInProgress = false;
    },

    socketConnectionError: (state, action: PayloadAction<string>) => {
      state.socket.isConnected = false;
      state.socket.lastConnectionError = action.payload;
      state.socket.reconnectionInProgress = false;
    },

    socketReconnectionAttempt: (state, action: PayloadAction<number>) => {
      state.socket.connectionAttempts = action.payload;
      state.socket.reconnectionInProgress = true;
    },

    socketReconnectionFailed: (state) => {
      state.socket.isConnected = false;
      state.socket.reconnectionInProgress = false;
    },

    resetSocketConnectionAttempts: (state) => {
      state.socket.connectionAttempts = 0;
    },
  },
});

export const {
  createRoom,
  addUserToRoom,
  addTaskToRoom,
  createProfile,
  updateUsername,
  updateListUsers,
  updateRoomCreator,
  updateTasks,
  registerUserVote,
  setCurrentTaskId,
  updateVotingStatus,
  socketConnected,
  socketDisconnected,
  socketConnectionError,
  socketReconnectionAttempt,
  socketReconnectionFailed,
  resetSocketConnectionAttempts,
} = rootReducer.actions;
// Crea un selector para obtener el número de usuarios en una sala específica
export const selectNumUsersInRoom = () =>
  createSelector(
    (state: State) => state.room,
    (room) => (room ? room.users.length : 0)
  );

// Selector para obtener la descripción de la tarea actual
export const selectCurrentTaskDescription = () =>
  createSelector(
    (state: State) => state.room,
    (room) => {
      if (!room || !room.currentTaskId) return '';

      const currentTask = room.tasks.find(
        (task) => task.id === room.currentTaskId
      );
      return currentTask ? currentTask.description : '';
    }
  );

// Selector para determinar si el usuario actual es el creador de la sala
export const selectIsUserCreator = () =>
  createSelector(
    (state: State) => state.room.creatorId,
    (state: State) => state.profile.userId,
    (creatorId, userId) => creatorId === userId
  );

// Votos de la tarea actual
export const selectCurrentTaskVotes = () =>
  createSelector(
    (state: State) => state.room,
    (room) => {
      const task = room.tasks.find((t) => t.id === room.currentTaskId);
      if (!task) return [];
      return Object.entries(task.voting.votes).map(([userId, vote]) => ({
        userId,
        vote,
      }));
    }
  );

// Estadísticas de la tarea actual
export const selectCurrentTaskVoteStats = () =>
  createSelector(selectCurrentTaskVotes(), (votes) => {
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
  });

// Progreso de la votación
export const selectVotingProgress = () =>
  createSelector(
    (state: State) => state.room,
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
      const total = room.users.length;
      const voted = Object.keys(task.voting.votes).length;
      const pending = total - voted;
      const percentage = total ? (voted / total) * 100 : 0;
      return {
        totalUsers: total,
        votedUsers: voted,
        pendingUsers: pending,
        percentage,
        status: task.voting.status,
      };
    }
  );

// Selector para determinar si el usuario actual ha votado en la tarea actual
export const selectHasCurrentUserVoted = () =>
  createSelector(
    (state: State) => state.room,
    (state: State) => state.profile.userId,
    (room, userId) => {
      const task = room.tasks.find((t) => t.id === room.currentTaskId);
      return task ? userId in task.voting.votes : false;
    }
  );

export const selectCurrentTaskVotesMap = () =>
  createSelector(
    (state: State) => state.room.tasks,
    (state: State) => state.room.currentTaskId,
    (tasks, currentTaskId) => {
      if (!currentTaskId) return {};
      const task = tasks.find((t) => t.id === currentTaskId);
      // task.voting.votes es Record<userId, vote>
      return task?.voting.votes ?? {};
    }
  );

export const selectCurrentUserVote = () =>
  createSelector(
    (state: State) => state.room.tasks,
    (state: State) => state.room.currentTaskId,
    (state: State) => state.profile.userId,
    (tasks, currentTaskId, userId) => {
      if (!currentTaskId || !userId) return null;
      const task = tasks.find((t) => t.id === currentTaskId);
      if (!task) return null;
      // Puede devolver undefined si no ha votado
      const vote = task.voting.votes[userId];
      // Si quieres mapear un valor especial, por ejemplo -99 → null, hazlo aquí:
      return vote === undefined ? null : vote;
    }
  );

export const selectIsLastTask = () =>
  createSelector(
    (state: State) => state.room.tasks,
    (state: State) => state.room.currentTaskId,
    (tasks, currentTaskId) => {
      if (!currentTaskId) return false;
      const currentIndex = tasks.findIndex((t) => t.id === currentTaskId);
      return currentIndex === tasks.length - 1;
    }
  );

export const selectAllTasksCompleted = () =>
  createSelector(
    (state: State) => state.room.tasks,
    (tasks) => {
      return tasks.every(
        (task) => task.voting.status === VotingStatus.FINISHED
      );
    }
  );

// Socket connection selectors
export const selectSocketState = (state: State) => state.socket;

export const selectIsSocketConnected = (state: State) =>
  state.socket.isConnected;

export const selectSocketConnectionAttempts = (state: State) =>
  state.socket.connectionAttempts;

export const selectSocketLastError = (state: State) =>
  state.socket.lastConnectionError;

export const selectIsReconnectionInProgress = (state: State) =>
  state.socket.reconnectionInProgress;

export default rootReducer.reducer;
