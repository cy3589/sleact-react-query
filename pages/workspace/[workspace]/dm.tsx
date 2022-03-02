import { IChannel, IDM, IUser } from '@interfaces/db';
import Workspace from '@layouts/Workspace';
import { Container, Header } from '@styles/dm-styled';
import {
  getWorkspaceChannelData,
  getMyDataUseCookie,
  getUserDataFetcher,
  onSubmitChatDM,
  getDMChatData,
} from '@utils/fetcher';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC, FormEvent, useCallback, useEffect, useRef } from 'react';
import {
  InfiniteData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from 'react-query';
import gravatar from 'gravatar';
import ChatBox from '@components/Chatbox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import { OnChangeHandlerFunc } from 'react-mentions';
import makeSection from '@utils/makeSection';
import Scrollbars from 'react-custom-scrollbars';
import useSocket from '@hooks/useSocket';
import { toast } from 'react-toastify';

interface DirectMessageProps {
  workspace: string;
  id: string;
}
const DirectMessage: FC<DirectMessageProps> = ({ workspace, id }) => {
  toast.configure();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [chat, onChangeChat, setChat] = useInput('');
  const { socket } = useSocket(workspace);
  const { data: myData, isLoading: isLoadingMydata } = useQuery<IUser>(
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
  const { data: userData, isLoading: isLoadingUserData } = useQuery<IUser>(
    ['workspace', workspace, 'users', id],
    () => getUserDataFetcher({ workspace, id }),
  );
  const { data: chatData, fetchNextPage } = useInfiniteQuery<IDM[]>(
    ['workspace', workspace, 'dm', id, 'chat'],
    ({ pageParam = 0 }) => getDMChatData({ workspace, id, pageParam }),
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.length === 0) return undefined;
        return pages.length;
      },
    },
  );
  const scrollbarRef = useRef<Scrollbars>(null);
  const fetchNextPageFunction = useCallback(async () => {
    if (chatData && Array.isArray(chatData?.pages)) await fetchNextPage();
  }, [chatData, fetchNextPage]);
  const onMessage = useCallback(
    (data: IDM) => {
      if (myData && data.SenderId !== myData.id)
        queryClient.setQueryData<InfiniteData<IDM[]>>(
          ['workspace', workspace, 'dm', id, 'chat'],
          (prev) => {
            const newPages = prev?.pages.slice() || [];
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
        else {
          toast.info('🦄 Wow so easy!', {
            position: 'bottom-center',
            autoClose: false,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      }
    },
    [id, myData, queryClient, workspace],
  );
  useEffect(() => {
    socket?.on('dm', onMessage);
    return () => {
      socket?.off('dm', onMessage);
    };
  }, [socket, onMessage]);
  const onSubmitForm = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setChat('');
      if (chat?.trim() && myData && userData) {
        queryClient.setQueryData<InfiniteData<IDM[]>>(
          ['workspace', workspace, 'dm', id, 'chat'],
          (prev) => {
            const newPages = prev?.pages.slice() || [];
            newPages[0].unshift({
              id: (prev?.pages[0][0].id || 0) + 1,
              SenderId: myData.id,
              Sender: myData,
              ReceiverId: userData.id,
              Receiver: userData,
              content: chat,
              createdAt: new Date(),
            });
            return { pageParams: prev?.pageParams || [], pages: newPages };
          },
        );
        setTimeout(() => {
          scrollbarRef.current?.scrollToBottom();
        }, 0);
        await onSubmitChatDM({ workspace, id, chat });
      }
    },
    [setChat, chat, myData, queryClient, workspace, id, userData],
  );
  useEffect(() => {
    if (chatData?.pages.length === 1) scrollbarRef.current?.scrollToBottom();
  }, [chatData]);

  if (isLoadingMydata || isLoadingChannelData || isLoadingUserData)
    return <div>Loading...</div>;
  if (!myData) {
    router.push('/login');
    return null;
  }
  if (!userData) return null;
  return (
    <Workspace workspace={workspace} channels={channels}>
      <Container>
        <Header>
          <div style={{ position: 'relative' }}>
            <Image
              src={gravatar
                .url(userData.nickname, { s: '36px', d: 'retro' })
                .replace('//', 'https://')}
              alt={userData.nickname}
              width="36px"
              height="36px"
              layout="fixed"
            />
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
      </Container>
    </Workspace>
  );
};
export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  const workspace = ctx.params?.workspace?.toString();
  const id = ctx.query?.id?.toString();
  if (!workspace || !id)
    return {
      redirect: { permanent: false, destination: '/' },
    };
  return { props: { workspace, id } };
};

export default DirectMessage;
