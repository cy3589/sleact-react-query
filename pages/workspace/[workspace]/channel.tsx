import Workspace from '@layouts/Workspace';
import {
  getChannelChatData,
  getWorkspaceChannelData,
  // getChannelMembersData,
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
import { Container, Header } from '@styles/channel-styled';
import { IChannel, IChat, IUser } from '@interfaces/db';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import ChatList from '@components/ChatList';
import ChatBox from '@components/Chatbox';
import useInput from '@hooks/useInput';
import { FormEvent, useCallback } from 'react';
import { OnChangeHandlerFunc } from 'react-mentions';

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
  const { data: chatData } = useInfiniteQuery(
    ['workspace', workspace, 'channel', channel, 'chat'],
    ({ pageParam }) => getChannelChatData({ workspace, channel, pageParam }),
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.length === 0) return undefined;
        return pages.length;
      },
    },
  );

  const [chat, onChangeChat, setChat] = useInput('');
  const onSubmitForm = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setChat('');
      if (chat?.trim() && myData && channelData) {
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
            return {
              pageParams: prev?.pageParams || [],
              pages: newPages,
            };
          },
        );
        await onSubmitChatChannel({ workspace, channel, chat });
      }
    },
    [setChat, chat, myData, channelData, queryClient, workspace, channel],
  );

  // const { data: channelMembersData } = useQuery<IUser[]>(
  //   ['workspace', workspace, 'channel', channel, 'member'],
  //   () => getChannelMembersData({ workspace, channel }),
  //   {
  //     enabled: !!myData,
  //   },
  // );

  if (isLoading || isLoadingChannelData) return <div>Loading...</div>;
  if ((!isLoading && !myData) || (!channels && !isLoadingChannelData)) {
    router.replace('/login');
    return null;
  }
  return (
    <Workspace
      workspace={workspace}
      channels={channels || []}
      channel={channel}
      // channelMembersData={channelMembersData || []}
    >
      <Container>
        <Header>채널!</Header>
        <ChatList chatData={chatData?.pages.flat().reverse()} />
        <ChatBox
          workspace={workspace}
          chat={chat}
          onChangeChat={onChangeChat as OnChangeHandlerFunc}
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
