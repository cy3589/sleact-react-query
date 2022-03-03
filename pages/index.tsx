import type { GetServerSideProps, NextPage } from 'next';
// import { logoutFetcher } from '@utils/fetcher';
// import Head from 'next/head';
// import Image from 'next/image';
// import { useRouter } from 'next/router';
// import { useCallback } from 'react';
// import { useQueryClient } from 'react-query';
// import styles from '@styles/Home.module.css';

const Home: NextPage = () => {
  // const router = useRouter();
  // const queryClient = useQueryClient();
  // const logoutFunction = useCallback(async () => {
  //   await logoutFetcher();
  //   queryClient.setQueryData('user', '');
  // }, [queryClient]);
  return null;
};
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: '/login', permanent: false },
});

export default Home;
