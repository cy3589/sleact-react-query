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
import { FC, FormEvent, useCallback } from 'react';
import { useInfiniteQuery, useQuery } from 'react-query';
import gravatar from 'gravatar';
import ChatBox from '@components/Chatbox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import { OnChangeHandlerFunc } from 'react-mentions';

interface DirectMessageProps {
  workspace: string;
  id: string;
}
const DirectMessage: FC<DirectMessageProps> = ({ workspace, id }) => {
  const router = useRouter();
  const [chat, onChangeChat, setChat] = useInput('');
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
  const { data: userData, isLoading: isLoadingUserData } = useQuery(
    ['workspace', workspace, 'users', id],
    () => getUserDataFetcher({ workspace, id }),
  );
  const { data: chatData } = useInfiniteQuery<IDM[]>(
    ['workspace', workspace, 'dm', id, 'chat'],
    ({ pageParam = 0 }) => getDMChatData({ workspace, id, pageParam }),
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.length === 0) return undefined;
        return pages.length;
      },
    },
  );
  const onSubmitForm = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setChat('');
      if (chat?.trim()) {
        await onSubmitChatDM({ workspace, id, chat });
      }
    },
    [setChat, chat, workspace, id],
  );

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
        <ChatList chatData={chatData?.pages.flat()} />
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
  const id = ctx.query?.id?.toString();
  if (!workspace || !id)
    return {
      redirect: { permanent: false, destination: '/' },
    };
  return { props: { workspace, id } };
};

export default DirectMessage;
