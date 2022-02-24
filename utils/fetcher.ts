import axios from 'axios';

const BACKEND_API_URL = 'http://192.168.219.100:3095/api';
const fetcher = async ({ queryKey }: { queryKey: string }) => {
  const { data } = await axios.get(queryKey, { withCredentials: true });
  return data;
};

const getUserDataUseCookie = async () => {
  console.log('h1');
  const { data } = await axios.get(`${BACKEND_API_URL}/users`, {
    withCredentials: true,
  });
  console.log(data);
  return data;
};

const logoutFetcher = async () => {
  try {
    await axios.post(
      'http://192.168.219.100:3095/api/users/logout',
      {},
      { withCredentials: true },
    );
  } catch (error) {
    // console.error(error);
  }
};
export default fetcher;
export { getUserDataUseCookie, logoutFetcher };
