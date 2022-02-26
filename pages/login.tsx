import { useMutation, useQuery, useQueryClient } from 'react-query';
import axios, { AxiosError } from 'axios';
import { FormEvent, useCallback, useState } from 'react';

import useInput from '@hooks/useInput';
import {
  Form,
  Error,
  Label,
  Input,
  LinkContainer,
  Button,
  Header,
} from '@styles/signup-styled';
import { IUser } from '@interfaces/db';
import { getMyDataUseCookie } from '@utils/fetcher';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Login = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [logInError, setLogInError] = useState(false);
  const [email, onChangeEmail] = useInput('');
  const [password, onChangePassword] = useInput('');
  const { data: myData, isLoading } = useQuery<IUser>(
    'user',
    getMyDataUseCookie,
  );
  const mutation = useMutation<
    IUser,
    AxiosError,
    { email: string; password: string }
  >(
    'user',
    (mutationData) =>
      axios.post('/users/login', mutationData).then((r) => r.data),
    {
      onMutate() {
        setLogInError(false);
      },
      onSuccess() {
        queryClient.refetchQueries('user');
      },
      onError(error) {
        setLogInError(error.response?.data?.code === 401);
      },
    },
  );
  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      mutation.mutate({ email, password });
    },
    [email, mutation, password],
  );
  if (myData && !isLoading)
    router.replace(
      `/workspace/${myData.Workspaces[0].url}/channel?channel=일반`,
    );
  if (isLoading) return <div>Loading...</div>;
  return (
    <div id="container">
      <Header>Sleact</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>이메일 주소</span>
          <div>
            <Input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChangeEmail}
            />
          </div>
        </Label>
        <Label id="password-label">
          <span>비밀번호</span>
          <div>
            <Input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChangePassword}
            />
          </div>
          {logInError && (
            <Error>이메일과 비밀번호 조합이 일치하지 않습니다.</Error>
          )}
        </Label>
        <Button type="submit">로그인</Button>
      </Form>
      <LinkContainer>
        아직 회원이 아니신가요?&nbsp;
        <Link href="/signup">회원가입 하러가기</Link>
      </LinkContainer>
    </div>
  );
};
export default Login;
