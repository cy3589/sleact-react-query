import Workspace from '@layouts/Workspace';
import {
  getChannelChatData,
  getWorkspaceChannelData,
  getChannelMembersData,
  getMyDataUseCookie,
  onSubmitChatChannel,
  getChannelData,
} from '@utils/fetcher';
import { useRouter } from 'next/router';
import {
  InfiniteData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from 'react-query';
import {
  Container,
  // , DragOver
  Header,
} from '@styles/channel-styled';
import { IChannel, IChat, IUser } from '@interfaces/db';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import ChatList from '@components/ChatList';
import ChatBox from '@components/Chatbox';
import useInput from '@hooks/useInput';
import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  // DragEvent,
} from 'react';
import { OnChangeHandlerFunc } from 'react-mentions';
import makeSection from '@utils/makeSection';
import Scrollbars from 'react-custom-scrollbars';
import useSocket from '@hooks/useSocket';
import InviteChannelModal from '@components/InviteChannelModal';

const Channel = ({
  workspace,
  channel,
}: {
  workspace: string;
  channel: string;
}) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: myData, isLoading } = useQuery<IUser>(
    'user',
    getMyDataUseCookie,
  );
  const { data: channels, isLoading: isLoadingChannelData } = useQuery<
    IChannel[]
  >(
    ['workspace', workspace, 'channel'],
    () => getWorkspaceChannelData(workspace),
    {
      enabled: !!workspace && !!myData,
    },
  );
  const { data: channelData } = useQuery<IChannel>(
    ['workspace', workspace, 'channel', channel],
    () => getChannelData({ workspace, channel }),
  );
  const { data: chatData, fetchNextPage } = useInfiniteQuery<IChat[]>(
    ['workspace', workspace, 'channel', channel, 'chat'],
    ({ pageParam }) => getChannelChatData({ workspace, channel, pageParam }),
    {
      getNextPageParam: (lastPage, pages) => {
        // console.log(lastPage);
        if (lastPage.length < 20) return undefined;
        return pages.length;
      },
    },
  );
  const [showInviteChannelModal, setShowInviteChannelModal] =
    useState<boolean>(false);
  // const [dragOver, setDragOver] = useState<boolean>(false);
  // const onDragOver = useCallback(
  //   (e: DragEvent<HTMLDivElement>) => {
  //     console.log(e);
  //     if (!dragOver) {
  //       console.log('onDragOver!');
  //       setDragOver(true);
  //     }
  //   },
  //   [dragOver],
  // );
  // const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
  //   console.log(e);
  // }, []);
  const onCloseModal = useCallback(() => {
    setShowInviteChannelModal(false);
  }, []);
  const onClickInviteChannel = useCallback(() => {
    setShowInviteChannelModal(true);
  }, []);
  const { socket } = useSocket(workspace);
  const fetchNextPageFunction = useCallback(async () => {
    if (chatData && Array.isArray(chatData?.pages)) await fetchNextPage();
  }, [chatData, fetchNextPage]);
  const [chat, onChangeChat, setChat] = useInput('');
  const scrollbarRef = useRef<Scrollbars>(null);
  const onMessage = useCallback(
    (data: IChat) => {
      if (data.UserId !== myData?.id)
        queryClient.setQueryData<InfiniteData<IChat[]>>(
          ['workspace', workspace, 'channel', channel, 'chat'],
          (prev) => {
            const newPages = prev?.pages.slice() || []; // slice로 복제
            newPages[0].unshift(data);
            return {
              pageParams: prev?.pageParams || [],
              pages: newPages,
            };
          },
        );
      if (scrollbarRef.current) {
        if (
          scrollbarRef.current.getScrollHeight() <
          scrollbarRef.current.getClientHeight() +
            scrollbarRef.current.getScrollTop() +
            150
        )
          setTimeout(() => scrollbarRef.current?.scrollToBottom(), 0);
      }
    },
    [channel, myData?.id, queryClient, workspace],
  );
  const onSubmitForm = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setChat('');
      if (chat?.trim() && myData && channelData) {
        // optimistic update
        queryClient.setQueryData<InfiniteData<IChat[]>>(
          ['workspace', workspace, 'channel', channel, 'chat'],
          (prev) => {
            const newPages = prev?.pages.slice() || []; // slice로 복제
            newPages[0].unshift({
              id: (prev?.pages[0][0]?.id || 0) + 1,
              UserId: myData.id,
              User: myData,
              content: chat,
              createdAt: new Date(),
              ChannelId: channelData?.id,
              Channel: channelData,
            });
            return { pageParams: prev?.pageParams || [], pages: newPages };
          },
        );
        scrollbarRef.current?.scrollToBottom();
        await onSubmitChatChannel({ workspace, channel, chat });
      }
    },
    [setChat, chat, myData, channelData, queryClient, workspace, channel],
  );
  const { data: channelMembersData } = useQuery<IUser[]>(
    ['workspace', workspace, 'channel', channel, 'member'],
    () => getChannelMembersData({ workspace, channel }),
    {
      enabled: !!myData,
    },
  );

  useEffect(() => {
    socket?.on('message', onMessage);
    return () => {
      socket?.off('message', onMessage);
    };
  }, [onMessage, socket]);

  useEffect(() => {
    if (chatData?.pages.length === 1) scrollbarRef.current?.scrollToBottom();
  }, [chatData]);

  if (isLoading || isLoadingChannelData) return <div>Loading...</div>;
  if ((!isLoading && !myData) || (!channels && !isLoadingChannelData)) {
    router.replace('/login');
    return null;
  }
  return (
    <Workspace workspace={workspace} channels={channels || []}>
      <Container>
        <Header>
          <span>#{channel}</span>
          <div className="header-right">
            <span>{channelMembersData?.length || 0}</span>
            <button
              onClick={onClickInviteChannel}
              className="c-button-unstyled p-ia__view_header__button"
              aria-label="Add people to #react-native"
              data-sk="tooltip_parent"
              type="button"
            >
              <i
                className="c-icon p-ia__view_header__button_icon c-icon--add-user"
                aria-hidden="true"
              />
            </button>
          </div>
        </Header>
        <ChatList
          chatSections={makeSection(chatData?.pages.flat().reverse() ?? [])}
          ref={scrollbarRef}
          fetchNextPageFunction={fetchNextPageFunction}
        />
        <ChatBox
          workspace={workspace}
          chat={chat}
          onChangeChat={onChangeChat as unknown as OnChangeHandlerFunc}
          onSubmitForm={onSubmitForm}
        />
        {/* {dragOver && <DragOver>업로드!</DragOver>} */}
      </Container>
      {channel && (
        <InviteChannelModal
          workspace={workspace}
          show={showInviteChannelModal}
          setShowInviteChannelModal={setShowInviteChannelModal}
          onCloseModal={onCloseModal}
          channel={channel}
        />
      )}
    </Workspace>
  );
};
export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  const workspace = ctx.params?.workspace?.toString();
  const channel = ctx.query?.channel?.toString();
  if (!channel && !workspace)
    return { redirect: { permanent: false, destination: '/' } };
  if (!channel)
    return {
      redirect: { permanent: false, destination: `/workspace/${workspace}` },
    };
  return { props: { workspace, channel } };
};
export default Channel;
