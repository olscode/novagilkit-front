import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { User } from '../redux/reducers';

export const useJoinRoomOnce = ({
  socket,
  roomId,
  profile,
  setModalIsOpen,
}: {
  socket: Socket | undefined;
  roomId: string | undefined;
  profile: User;
  setModalIsOpen: (open: boolean) => void;
}) => {
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (
      !hasJoinedRef.current &&
      socket?.connected &&
      profile.userId &&
      profile.username &&
      roomId
    ) {
      socket.emit('joinRoom', roomId, profile.userId, profile.username);
      console.log('🔁 useJoinRoomOnce → joinRoom emitido');
      hasJoinedRef.current = true;

      // Cerrar el modal tras emitir correctamente
      setModalIsOpen(false);
    }
  }, [
    socket?.connected,
    profile.userId,
    profile.username,
    roomId,
    setModalIsOpen,
  ]);
};
