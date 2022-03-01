import axiosBaseURL from '@config/axiosConfig';
import { useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

const backURL = axiosBaseURL;
const sockets: { [key: string]: typeof Socket } = {};
const useSocket = (workspace?: string) => {
  // disconnect : workspace가 있을 때 disconnect하는 callback-function이다.
  const disconnect = useCallback(() => {
    if (workspace) {
      // 함수가 실행되면 disconnect되므로 sockets Object에서 [workspace]를 key로 갖는
      // 해당하고있던 Socket객체를 제거
      sockets[workspace].disconnect();
      delete sockets[workspace];
    }
  }, [workspace]);

  // workspace가 없을 때 undefined와 disconnect 함수를 return
  //  disconnect함수는 workspace가 없으므로 호출해도 아무 반응 없음
  if (!workspace) return { socket: undefined, disconnect };

  if (sockets[workspace]) {
    return { socket: sockets[workspace], disconnect };
  }
  sockets[workspace] = io.connect(`${backURL}/ws-${workspace}`, {
    transports: ['websocket'],
  });
  // workspace Socket과 disconnect 함수를 리턴
  return { socket: sockets[workspace], disconnect };
};
export default useSocket;
