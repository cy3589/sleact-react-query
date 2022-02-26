import { IUser } from '@interfaces/db';
import { getWorkspaceChannelData, getMyDataUseCookie } from '@utils/fetcher';
import axios, { HeadersDefaults } from 'axios';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';

const WorkspaceIndex = () => {
  return null;
};
export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  interface CommenHeaderProperties extends HeadersDefaults {
    Cookie: string | string[];
  }
  const axiosDefaultsHeaders = axios.defaults.headers as CommenHeaderProperties;
  const cookie = ctx.req ? ctx.req.rawHeaders : '';
  axiosDefaultsHeaders.Cookie = '';
  if (ctx.req && cookie) {
    axiosDefaultsHeaders.Cookie = cookie;
  }
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { cacheTime: 2000, refetchOnWindowFocus: false },
    },
  });
  const myData: IUser = await getMyDataUseCookie();
  const { Workspaces } = myData;
  const channels = await getWorkspaceChannelData(Workspaces[0]?.name);
  if (!Workspaces || !channels)
    return { redirect: { permanent: false, destination: '/' } };
  queryClient.setQueryData('user', myData);
  queryClient.setQueryData(
    ['workspace', Workspaces[0].name, 'channel'],
    channels,
  );
  return {
    redirect: {
      permanent: false,
      destination: encodeURI(
        `/workspace/${Workspaces[0].url}/channel?channel=${channels[0].name}`,
      ),
    },
    props: {
      dehydrateState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
  //   return { props: {} };
};
export default WorkspaceIndex;
