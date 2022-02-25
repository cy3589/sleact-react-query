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
import { getUserDataUseCookie, signUpFetcher } from '@utils/fetcher';
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
  const { data } = useQuery('user', getUserDataUseCookie);
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
          <span>이메일 주소</span>
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
          <span>닉네임</span>
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
          <span>비밀번호</span>
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
          <span>비밀번호 확인</span>
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
          {mismatchError && <Error>비밀번호가 일치하지 않습니다.</Error>}
          {/* {!nickname && <Error>닉네임을 입력해주세요.</Error>} */}
          {signUpError && <Error>{signUpError}</Error>}
          {signUpSuccess && (
            <Success>회원가입되었습니다! 로그인해주세요.</Success>
          )}
        </Label>
        <Button type="submit">회원가입</Button>
      </Form>
      <LinkContainer>
        이미 회원이신가요?&nbsp;
        <Link href="/login">로그인 하러가기</Link>
      </LinkContainer>
    </div>
  );
};
export default SignUp;
