import {
  AddButton,
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
  ChangeEventHandler,
} from 'react';
import gravatar from 'gravatar';
import { useQuery, useQueryClient } from 'react-query';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getMyDataUseCookie, logoutFetcher } from '@utils/fetcher';
import Menu from '@components/Menu';
import { Button, Input, Label } from '@styles/signup-styled';
import useInput from '@hooks/useInput';
import Modal from '@components/Modal';
import CreateChannelModal from '@components/CreateChannelModal';
import { IChannel, IUser } from '@interfaces/db';
import InviteWorkspaceModal from '@components/InviteWorkspaceModal';
import ChannelList from '@components/ChannelList';
import DMList from '@components/DMList';
import useSocket from '@hooks/useSocket';

interface WorkspaceProps {
  workspace: string;
  channels?: IChannel[];
}
const Workspace: FC<WorkspaceProps> = ({ children, workspace, channels }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  toast.configure();
  const { socket, disconnect } = useSocket(workspace);
  const { data: myData, isLoading: isLoadingMydata } = useQuery<IUser>(
    'user',
    getMyDataUseCookie,
  );
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] =
    useState<boolean>(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState<boolean>(false);
  const [showCreateChannelModal, setShowCreateChannelModal] =
    useState<boolean>(false);
  const [newWorkspace, onChangeNewWorkspace] = useInput('');
  const [newUrl, onChangeNewUrl] = useInput('');
  const [showInviteWorkspaceModal, setShowInviteWorkspaceModal] =
    useState(false);

  useEffect(() => {
    if (channels && myData && socket) {
      socket.emit('login', {
        id: myData.id,
        channels: channels.map((v) => v.id),
      });
    }
  }, [channels, myData, socket, workspace]);
  useEffect(() => {
    return () => disconnect();
  }, [disconnect, workspace]);
  const logoutFunction = useCallback(async () => {
    await logoutFetcher();
    queryClient.setQueryData('user', '');
  }, [queryClient]);
  const onClickAddChannel = useCallback(() => {
    setShowCreateChannelModal(true);
  }, []);
  const onClickInviteWorkspace = useCallback(() => {
    setShowInviteWorkspaceModal(true);
  }, []);
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
        await axios.post(
          '/workspaces',
          {
            workspace: newWorkspace,
            url: newUrl,
          },
          { withCredentials: true },
        );
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
    setShowCreateWorkspaceModal(false);
    setShowInviteWorkspaceModal(false);
    setShowInviteWorkspaceModal(false);
  }, []);

  useEffect(() => {
    if (!myData && !isLoadingMydata) router.replace('/login'); // ????????? ???????????? data??? ????????? login?????? ??????
  }, [myData, router, isLoadingMydata]);
  if (!myData) {
    return null;
  }
  if (isLoadingMydata) return <div>Loading...</div>;
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
              src={gravatar.url(myData.nickname, { s: '28px', d: 'retro' })}
              alt={myData.nickname}
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
                        .url(myData.nickname, { s: '36px', d: 'retro' })
                        .replace('//', 'https://')}
                      alt={myData.nickname}
                      width="36px"
                      height="36px"
                      layout="fixed"
                    />
                  </div>
                  <div>
                    <span id="profile-name">{myData.nickname}</span>
                    <span id="profile-active">Active</span>
                  </div>
                </ProfileModal>
                <LogOutButton onClick={onClickLogOutButton}>
                  ????????????
                </LogOutButton>
              </Menu>
            )}
          </span>
        </RightMenu>
      </Header>
      <WorkspaceWrapper>
        <Workspaces>
          {myData?.Workspaces.map((ws) => (
            <Link
              key={ws.id}
              href={`/workspace/${ws.url}/channel?channel=??????`}
              // ?????? ????????? Default????????? ???????????? ??????????????? ??????
              passHref
            >
              <WorkspaceButton>{ws.name.slice(0, 1)}</WorkspaceButton>
            </Link>
          ))}
          <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
        </Workspaces>
        <Channels>
          <WorkspaceName onClick={toggleWorkspaceModal}>Clone</WorkspaceName>
          <MenuScroll>
            <Menu
              show={showWorkspaceModal}
              onCloseModal={toggleWorkspaceModal}
              style={{ top: 95, left: 80 }}
            >
              <WorkspaceModal>
                <h2>Sleact</h2>
                <button onClick={onClickInviteWorkspace} type="button">
                  ????????????????????? ????????? ??????
                </button>
                <button onClick={onClickAddChannel} type="button">
                  ?????? ?????????
                </button>
                <button onClick={logoutFunction} type="button">
                  Logout
                </button>
              </WorkspaceModal>
            </Menu>
            <ChannelList channels={channels} workspace={workspace} />
            <DMList myData={myData} workspace={workspace} />
          </MenuScroll>
        </Channels>
        <Chats>{children}</Chats>
      </WorkspaceWrapper>
      <Modal show={showCreateWorkspaceModal} onCloseModal={onCloseModal}>
        <form onSubmit={onCreateWorkSpace}>
          <Label id="workspace-label">
            <span>?????????????????? ??????</span>
            <Input
              id="workspace"
              value={newWorkspace}
              onChange={
                onChangeNewWorkspace as ChangeEventHandler<HTMLInputElement>
              }
            />
          </Label>
          <Label id="workspace-url-label">
            <span>?????????????????? url</span>
            <Input
              id="workspace"
              value={newUrl}
              onChange={onChangeNewUrl as ChangeEventHandler<HTMLInputElement>}
            />
          </Label>
          <Button type="submit">????????????</Button>
        </form>
      </Modal>
      <CreateChannelModal
        workspace={workspace}
        show={showCreateChannelModal}
        onCloseModal={onCloseModal}
      />
      <InviteWorkspaceModal
        workspace={workspace}
        show={showInviteWorkspaceModal}
        setShowInviteWorkspaceModal={setShowInviteWorkspaceModal}
        onCloseModal={onCloseModal}
      />
    </div>
  );
};
Workspace.defaultProps = {
  channels: [],
};
export default Workspace;
