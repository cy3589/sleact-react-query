import Link from 'next/link';
import { useCallback, FormEvent, useState, ChangeEvent } from 'react';
import { useMutation, useQuery } from 'react-query';
import useInput from '@hooks/useInput';
import {
  Form,
  Label,
  Input,
  LinkContainer,
  Button,
  Header,
  Error,
  Success,
} from '@styles/signup-styled';
import { getMyDataUseCookie, signUpFetcher } from '@utils/fetcher';
import { AxiosError } from 'axios';
import { IUser } from '@interfaces/db';
import { useRouter } from 'next/router';

const SignUp = () => {
  const router = useRouter();
  const [email, onChangeEmail] = useInput('');
  const [nickname, onChangeNickname] = useInput('');
  const [password, , setPassword] = useInput('');
  const [passwordCheck, , setPasswordCheck] = useInput('');
  const [mismatchError, setMismatchError] = useState(false);
  const [signUpError, setSignUpError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const { data } = useQuery('user', getMyDataUseCookie);
  const mutation = useMutation<
    IUser,
    AxiosError,
    { email: string; password: string; nickname: string }
  >('user', signUpFetcher, {
    onMutate() {
      setSignUpError('');
      setSignUpSuccess(false);
    },
    onSuccess() {
      setSignUpSuccess(true);
    },
    onError(mutationError) {
      setSignUpError(mutationError.response?.data);
    },
  });
  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!mismatchError && nickname) {
        mutation.mutate({ email, nickname, password });
      }
    },
    [email, mismatchError, mutation, nickname, password],
  );
  const onChangePassword = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      setMismatchError(e.target.value !== passwordCheck);
    },
    [passwordCheck, setPassword],
  );
  const onChangePasswordCheck = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setPasswordCheck(e.target.value);
      setMismatchError(e.target.value !== password);
    },
    [password, setPasswordCheck],
  );
  if (data) {
    router.replace('/');
    return null;
  }
  return (
    <div id="container">
      <Header>Sleact</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>????????? ??????</span>
          <div>
            <Input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChangeEmail}
              required
            />
          </div>
        </Label>
        <Label id="nickname-label">
          <span>?????????</span>
          <div>
            <Input
              type="text"
              id="nickname"
              name="nickname"
              value={nickname}
              onChange={onChangeNickname}
              required
            />
          </div>
        </Label>
        <Label id="password-label">
          <span>????????????</span>
          <div>
            <Input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChangePassword}
              required
            />
          </div>
        </Label>
        <Label id="password-check-label">
          <span>???????????? ??????</span>
          <div>
            <Input
              type="password"
              id="password-check"
              name="password-check"
              value={passwordCheck}
              onChange={onChangePasswordCheck}
              required
            />
          </div>
          {mismatchError && <Error>??????????????? ???????????? ????????????.</Error>}
          {/* {!nickname && <Error>???????????? ??????????????????.</Error>} */}
          {signUpError && <Error>{signUpError}</Error>}
          {signUpSuccess && (
            <Success>???????????????????????????! ?????????????????????.</Success>
          )}
        </Label>
        <Button type="submit">????????????</Button>
      </Form>
      <LinkContainer>
        ?????? ???????????????????&nbsp;
        <Link href="/login">????????? ????????????</Link>
      </LinkContainer>
    </div>
  );
};
export default SignUp;
