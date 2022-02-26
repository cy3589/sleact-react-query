import {
  ChangeEvent,
  ChangeEventHandler,
  Dispatch,
  SetStateAction,
  useCallback,
  useState,
} from 'react';
import { OnChangeHandlerFunc } from 'react-mentions';

const useInput = <T,>(
  initialData: T,
): [
  T,
  ChangeEventHandler<HTMLInputElement> | OnChangeHandlerFunc,
  Dispatch<SetStateAction<T>>,
] => {
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
