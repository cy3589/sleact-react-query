import { IChannel } from '@interfaces/db';
import axios from 'axios';
import { axiosBaseApiURL } from '@config/axiosConfig';

axios.defaults.baseURL = axiosBaseApiURL;
axios.defaults.withCredentials = true;

const getMyDataUseCookie = async () => {
  const { data } = await axios.get(`/users`, {
    withCredentials: true,
  });
  return data;
};

const logoutFetcher = async () => {
  try {
    await axios.post('/users/logout');
  } catch (error) {
    // console.error(error);
  }
};
const signUpFetcher = async (mutationData: {
  email: string;
  password: string;
  nickname: string;
}) => {
  const { data } = await axios.post('/users', mutationData);
  return data;
};
const getWorkspaceChannelData = async (
  workspace: string,
): Promise<IChannel[]> => {
  if (!workspace) return [];
  const { data }: { data: IChannel[] } = await axios.get(
    `/workspaces/${workspace}/channels`,
  );
  return data;
};
const getChannelData = async ({
  workspace,
  channel,
}: {
  workspace: string;
  channel: string;
}) => {
  const { data } = await axios.get(
    `/workspaces/${workspace}/channels/${channel}`,
  );
  return data;
};
const createChannelFetcher = async ({
  workspace,
  name,
}: {
  workspace: string;
  name: string;
}) => {
  try {
    const { data } = await axios.post(`/workspaces/${workspace}/channels`, {
      name,
    });
    return data;
  } catch (error) {
    // console.dir(error);
    return [];
  }
};
const inviteMemberFetcher = async ({
  workspace,
  email,
}: {
  workspace: string;
  email: string;
}): Promise<void> => {
  await axios.post(`/workspaces/${workspace}/members`, { email });
};
const inviteChannelMemberFetcher = async ({
  workspace,
  email,
  channel,
}: {
  workspace: string;
  email: string;
  channel: string;
}): Promise<void> => {
  await axios.post(`/workspaces/${workspace}/channels/${channel}/members`, {
    email,
  });
};
const getChannelMembersData = async ({
  workspace,
  channel,
}: {
  workspace: string;
  channel: string;
}) => {
  const { data } = await axios.get(
    `/workspaces/${workspace}/channels/${channel}/members`,
  );
  return data;
};
const getWorkspaceMembersData = async ({
  workspace,
}: {
  workspace: string;
}) => {
  const { data } = await axios.get(`/workspaces/${workspace}/members`);
  return data;
};
const getUserDataFetcher = async ({
  workspace,
  id,
}: {
  workspace: string;
  id: string | number;
}) => {
  const { data } = await axios.get(`/workspaces/${workspace}/users/${id}`);
  return data;
};
const onSubmitChatDM = async ({
  workspace,
  id,
  chat,
}: {
  workspace: string;
  id: string;
  chat: string;
}) => {
  try {
    await axios.post(`/workspaces/${workspace}/dms/${id}/chats`, {
      content: chat,
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && process.env.NODE_ENV !== 'production')
      // eslint-disable-next-line no-console
      console.error(error);
  }
};
const getDMChatData = async ({
  workspace,
  id,
  pageParam = 0,
}: {
  workspace: string;
  id: string;
  pageParam: number;
}) => {
  const { data } = await axios.get(
    `/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${pageParam + 1}`,
  );
  return data;
};
const getChannelChatData = async ({
  workspace,
  channel,
  pageParam = 0,
}: {
  workspace: string;
  channel: string;
  pageParam: number;
}) => {
  const { data } = await axios.get(
    `/workspaces/${workspace}/channels/${channel}/chats?perPage=20&page=${
      pageParam + 1
    }`,
  );
  return data;
};
const onSubmitChatChannel = async ({
  workspace,
  channel,
  chat,
}: {
  workspace: string;
  channel: string;
  chat: string;
}) => {
  try {
    await axios.post(`/workspaces/${workspace}/channels/${channel}/chats`, {
      content: chat,
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && process.env.NODE_ENV !== 'production')
      // eslint-disable-next-line no-console
      console.error(error);
  }
};

export {
  getMyDataUseCookie,
  logoutFetcher,
  signUpFetcher,
  getWorkspaceChannelData,
  getChannelData,
  createChannelFetcher,
  inviteMemberFetcher,
  inviteChannelMemberFetcher,
  getChannelMembersData,
  getWorkspaceMembersData,
  getUserDataFetcher,
  onSubmitChatDM,
  getDMChatData,
  getChannelChatData,
  onSubmitChatChannel,
};
