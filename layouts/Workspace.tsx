import {
  AddButton,
  //   AddButton,
  Channels,
  Chats,
  Header,
  LogOutButton,
  MenuScroll,
  ProfileImg,
  ProfileModal,
  RightMenu,
  WorkspaceButton,
  WorkspaceModal,
  //   WorkspaceButton,
  //   WorkspaceModal,
  WorkspaceName,
  Workspaces,
  WorkspaceWrapper,
} from '@styles/workspace-styled';
import {
  FC,
  MouseEvent,
  useCallback,
  useEffect,
  useState,
  KeyboardEvent,
  FormEvent,
} from 'react';
import gravatar from 'gravatar';
import { useQuery, useQueryClient } from 'react-query';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getUserDataUseCookie, logoutFetcher } from '@utils/fetcher';
import { user } from '@interfaces/userInterface';
import Menu from '@components/Menu';
import { Button, Input, Label } from '@styles/signup-styled';
import useInput from '@hooks/useInput';
import Modal from '@components/Modal';
import CreateChannelModal from '@components/CreateChannelModal';

const Workspace: FC = ({ children }) => {
  const queryClient = useQueryClient();

  toast.configure();
  const router = useRouter();
  const { data, isLoading }: { data?: user; isLoading: boolean } = useQuery(
    'user',
    getUserDataUseCookie,
  );
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] =
    useState<boolean>(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState<boolean>(false);
  const [showCreateChannelModal, setShowCreateChannelModal] =
    useState<boolean>(false);
  const [newWorkspace, onChangeNewWorkspace] = useInput('');
  const [newUrl, onChangeNewUrl] = useInput('');

  const onClickAddChannel = useCallback(() => {
    setShowCreateChannelModal(true);
  }, []);
  const logoutFunction = useCallback(async () => {
    await logoutFetcher();
    queryClient.setQueryData('user', '');
  }, [queryClient]);
  const toggleWorkspaceModal = useCallback(() => {
    setShowWorkspaceModal((prev) => !prev);
  }, []);
  const onClickUserProfile = useCallback(
    (e: MouseEvent<HTMLSpanElement | HTMLDivElement> | KeyboardEvent) => {
      e.stopPropagation();
      setShowUserMenu((prev) => !prev);
    },
    [],
  );
  const onClickLogOutButton = useCallback(async () => {
    await logoutFetcher();
    queryClient.setQueryData('user', '');
  }, [queryClient]);
  const onClickCreateWorkspace = useCallback(() => {
    setShowCreateWorkspaceModal((prev) => !prev);
  }, []);
  const onCreateWorkSpace = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!newWorkspace || !newWorkspace.trim() || !newUrl || !newUrl.trim())
        return;
      try {
        await axios.post('/workspaces', {
          workspace: newWorkspace,
          url: newUrl,
        });
        queryClient.refetchQueries('user');
        setShowCreateWorkspaceModal(false);
      } catch (error: unknown) {
        if (axios.isAxiosError(error))
          toast.error(error.response?.data, { position: 'bottom-center' });
        // console.error(error);
      }
    },
    [newUrl, newWorkspace, queryClient],
  );

  const onCloseModal = useCallback(() => {
    setShowCreateWorkspaceModal(false);
    setShowCreateChannelModal(false);
  }, []);

  useEffect(() => {
    if (!data && !isLoading) router.replace('/login'); // 로딩이 끝났는데 data가 없다면 login으로 이동
  }, [data, router, isLoading]);
  if (!data) {
    return null;
  }
  if (isLoading) return <div>Loading...</div>;
  return (
    <div>
      <Header>
        <RightMenu>
          <span
            onClick={onClickUserProfile}
            onKeyDown={onClickUserProfile}
            role="button"
            tabIndex={0}
          >
            <ProfileImg
              src={gravatar.url(data.nickname, { s: '28px', d: 'retro' })}
              alt={data.nickname}
            />
            {showUserMenu && (
              <Menu
                style={{ right: 0, top: 38 }}
                show={showUserMenu}
                onCloseModal={onClickUserProfile}
              >
                <ProfileModal>
                  <div style={{ position: 'relative' }}>
                    <Image
                      src={gravatar
                        .url(data.nickname, { s: '36px', d: 'retro' })
                        .replace('//', 'https://')}
                      alt={data.nickname}
                      width="36px"
                      height="36px"
                      layout="fixed"
                    />
                  </div>
                  <div>
                    <span id="profile-name">{data.nickname}</span>
                    <span id="profile-active">Active</span>
                  </div>
                </ProfileModal>
                <LogOutButton onClick={onClickLogOutButton}>
                  로그아웃
                </LogOutButton>
              </Menu>
            )}
          </span>
        </RightMenu>
      </Header>
      <WorkspaceWrapper>
        <Workspaces>
          {data?.Workspaces.map((ws) => (
            <Link
              key={ws.id}
              href={`/workspace/${ws.id}/channel/일반`}
              passHref
            >
              <WorkspaceButton>{ws.name.slice(0, 1)}</WorkspaceButton>
            </Link>
          ))}
          <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
        </Workspaces>
        <Channels>
          <WorkspaceName onClick={toggleWorkspaceModal}>Sleact</WorkspaceName>
          <MenuScroll>
            <Menu
              show={showWorkspaceModal}
              onCloseModal={toggleWorkspaceModal}
              style={{ top: 95, left: 80 }}
            >
              <WorkspaceModal>
                <h2>Sleact</h2>
                <button onClick={onClickAddChannel} type="button">
                  채널 만들기
                </button>
                <button onClick={logoutFunction} type="button">
                  Logout
                </button>
              </WorkspaceModal>
            </Menu>
          </MenuScroll>
        </Channels>
        <Chats>{children}</Chats>
      </WorkspaceWrapper>
      <Modal show={showCreateWorkspaceModal} onCloseModal={onCloseModal}>
        <form onSubmit={onCreateWorkSpace}>
          <Label id="workspace-label">
            <span>워크스페이스 이름</span>
            <Input
              id="workspace"
              value={newWorkspace}
              onChange={onChangeNewWorkspace}
            />
          </Label>
          <Label id="workspace-url-label">
            <span>워크스페이스 url</span>
            <Input id="workspace" value={newUrl} onChange={onChangeNewUrl} />
          </Label>
          <Button type="submit">생성하기</Button>
        </form>
      </Modal>
      <CreateChannelModal
        show={showCreateChannelModal}
        onCloseModal={onCloseModal}
      />
    </div>
  );
};
export default Workspace;
