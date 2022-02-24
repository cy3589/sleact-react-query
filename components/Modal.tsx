import { CloseModalButton, CreateModal } from '@styles/modal-styled';
import { FC, MouseEvent, useCallback, KeyboardEvent } from 'react';

interface ModalProps {
  show: boolean;
  onCloseModal: () => void;
}
const Modal: FC<ModalProps> = ({ children, show, onCloseModal }) => {
  const stopPropagation = useCallback(
    (e: MouseEvent<HTMLDivElement> | KeyboardEvent) => {
      e.stopPropagation();
    },
    [],
  );
  if (!show) return null;
  return (
    <CreateModal onClick={onCloseModal}>
      <div
        onClick={stopPropagation}
        onKeyPress={stopPropagation}
        role="button"
        tabIndex={0}
      >
        <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>
        {children}
      </div>
    </CreateModal>
  );
};
export default Modal;
