import {
  CSSProperties,
  FC,
  useCallback,
  MouseEvent,
  KeyboardEvent,
} from 'react';
import { CloseModalButton, CreateMenu } from '@styles/menu-styled';

interface Props {
  style?: CSSProperties | undefined;
  show?: boolean;
  onCloseModal: (
    // eslint-disable-next-line no-unused-vars
    e: any,
  ) => void;
  closeButton?: boolean;
}
const Menu: FC<Props> = ({
  children,
  style,
  show,
  onCloseModal,
  closeButton,
}) => {
  const stopPropagation = useCallback(
    (e: MouseEvent<HTMLDivElement> | KeyboardEvent) => {
      e.stopPropagation();
    },
    [],
  );
  if (!show) return null;
  return (
    <CreateMenu onClick={onCloseModal}>
      <div
        style={style}
        onClick={stopPropagation}
        onKeyPress={stopPropagation}
        role="button"
        tabIndex={0}
      >
        {children}
        {closeButton && (
          <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>
        )}
      </div>
    </CreateMenu>
  );
};
Menu.defaultProps = {
  style: undefined,
  show: false,
  closeButton: true,
};

export default Menu;
