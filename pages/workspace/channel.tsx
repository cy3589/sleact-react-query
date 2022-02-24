import Workspace from '@layouts/Workspace';
import { getUserDataUseCookie } from '@utils/fetcher';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { Container, Header } from '@styles/channel-styled';

const Channel = () => {
  const router = useRouter();
  const { data, isLoading } = useQuery('user', getUserDataUseCookie);
  if (isLoading) return <div>Loading...</div>;
  if (!isLoading && !data) {
    router.replace('/login');
    return null;
  }
  return (
    <Workspace>
      <Container>
        <Header>채널!</Header>
      </Container>
    </Workspace>
  );
};
export default Channel;
