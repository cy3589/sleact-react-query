import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import '../styles/globals.css';

const MyApp = ({ Component, pageProps }: AppProps) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { cacheTime: 2000 } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default MyApp;
