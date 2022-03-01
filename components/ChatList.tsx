import { forwardRef, MutableRefObject, useCallback } from 'react';
import { IChat, IDM } from '@interfaces/db';
import { ChatZone, Section, StickyHeader } from '@styles/chat-list-styled';
import Chat from '@components/Chat';
import { positionValues, Scrollbars } from 'react-custom-scrollbars';
// import { InfiniteLoader } from 'react-virtualized';

interface ChatListProps {
  chatSections?: { [key: string]: Array<IChat | IDM> };
  fetchNextPageFunction: () => Promise<any>;
}
const ChatList = forwardRef<Scrollbars, ChatListProps>(
  ({ chatSections = {}, fetchNextPageFunction }, scrollbarRef) => {
    // const nowItemLength = Object.entries(chatSections).reduce((a, c) => {
    //   const next = a + c[1].length;
    //   return next;
    // }, 0);
    const onScroll = useCallback(
      async (values: positionValues) => {
        // await fetchNextPageFunction();
        if (values.scrollTop === 0) {
          await fetchNextPageFunction();
          const current = (scrollbarRef as MutableRefObject<Scrollbars>)
            ?.current;
          current.scrollTop(current.getScrollHeight() - values.scrollHeight);
        }
      },
      [fetchNextPageFunction, scrollbarRef],
    );
    return (
      <ChatZone>
        <Scrollbars autoHide ref={scrollbarRef} onScrollFrame={onScroll}>
          {Object.entries(chatSections).map(([date, chats]) => (
            <Section className={`section-${date}`} key={date}>
              <StickyHeader>
                <button type="button">{date}</button>
              </StickyHeader>
              {chats.map((chat) => (
                <Chat key={chat.id} data={chat} />
              ))}
            </Section>
          ))}
        </Scrollbars>
      </ChatZone>
    );
  },
);
ChatList.displayName = 'ChatList';
ChatList.defaultProps = {
  chatSections: {},
};
export default ChatList;
