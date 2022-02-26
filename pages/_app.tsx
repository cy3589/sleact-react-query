import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider, Hydrate } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import axios from 'axios';
import '@styles/globals.css';
import { useRef } from 'react';

axios.defaults.baseURL = 'http://192.168.219.117:3095/api';
axios.defaults.withCredentials = true;

const MyApp = ({ Component, pageProps }: AppProps) => {
  const queryClientRef = useRef<QueryClient>();
  if (!queryClientRef.current)
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: { cacheTime: 2000, refetchOnWindowFocus: false },
      },
    });
  return (
    <QueryClientProvider client={queryClientRef.current}>
      <Hydrate state={pageProps.dehydrateState}>
        <Component {...pageProps} />
      </Hydrate>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default MyApp;
