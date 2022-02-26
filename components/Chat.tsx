import ChatWrapper from '@styles/chat-styled';
import Image from 'next/image';
import gravatar from 'gravatar';
import { IDM, IChat } from '@interfaces/db';
import { VFC } from 'react';
import dayjs from 'dayjs';

interface ChatProps {
  data: IDM | IChat;
}
const Chat: VFC<ChatProps> = ({ data }) => {
  const user = 'Sender' in data ? data.Sender : data.User;
  return (
    <ChatWrapper>
      <div className="chat-img">
        <div style={{ position: 'relative' }}>
          <Image
            src={gravatar
              .url(user.nickname, { s: '36px', d: 'retro' })
              .replace('//', 'https://')}
            alt={user.nickname}
            width="36px"
            height="36px"
            layout="fixed"
          />
        </div>
      </div>
      <div className="chat-text">
        <div className="chat-user">
          <b>{user.nickname}</b>
          <span>{dayjs(data.createdAt).format('h:mm A')}</span>
        </div>
        <p>{data.content}</p>
      </div>
    </ChatWrapper>
  );
};
export default Chat;
