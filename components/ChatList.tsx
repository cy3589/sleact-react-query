import { useCallback, useRef, VFC } from 'react';
import { IDM } from '@interfaces/db';
import {
  ChatZone,
  // Section
} from '@styles/chat-list-styled';
import Chat from '@components/Chat';
import { Scrollbars } from 'react-custom-scrollbars';

interface ChatListProps {
  chatData?: IDM[];
}
const ChatList: VFC<ChatListProps> = ({ chatData = [] }) => {
  const scrollbarRef = useRef<Scrollbars | null>(null);
  const onScroll = useCallback(() => {}, []);
  return (
    <ChatZone>
      {/* <Section>section</Section> */}
      <Scrollbars autoHide ref={scrollbarRef} onScrollFrame={onScroll}>
        {chatData.map((chat) => (
          <Chat key={chat.id} data={chat} />
        ))}
      </Scrollbars>
    </ChatZone>
  );
};
export default ChatList;
