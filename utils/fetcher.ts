import axios from 'axios';

const fetcher = async ({ queryKey }: { queryKey: string }) => {
  const { data } = await axios.get(queryKey, { withCredentials: true });
  return data;
};

const getUserDataUseCookie = async () => {
  const { data } = await axios.get(`/users`, {
    withCredentials: true,
  });
  return data;
};

const logoutFetcher = async () => {
  try {
    await axios.post('/users/logout', {}, { withCredentials: true });
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
export default fetcher;
export { getUserDataUseCookie, logoutFetcher, signUpFetcher };
