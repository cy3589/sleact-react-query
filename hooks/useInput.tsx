import {
  ChangeEvent,
  ChangeEventHandler,
  Dispatch,
  SetStateAction,
  useCallback,
  useState,
} from 'react';

const useInput = <T,>(
  initialData: T,
): [T, ChangeEventHandler<HTMLInputElement>, Dispatch<SetStateAction<T>>] => {
  const [input, setInput] = useState(initialData);
  const onChangeInput = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      setInput(e.target.value as unknown as T);
    },
    [],
  );
  return [input, onChangeInput, setInput];
};
export default useInput;
