import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useState,
} from 'react';

const useInput = <T,>(
  initialData: T,
): [
  T,
  // eslint-disable-next-line no-unused-vars
  (e: ChangeEvent<HTMLInputElement>) => void,
  Dispatch<SetStateAction<T>>,
] => {
  const [input, setInput] = useState(initialData);
  const onChangeInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      setInput(e.target.value as unknown as T);
    },
    [],
  );
  return [input, onChangeInput, setInput];
};
export default useInput;
