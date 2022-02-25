import Modal from '@components/Modal';
import useInput from '@hooks/useInput';
import { Button, Input, Label } from '@styles/signup-styled';
import { useCallback, VFC } from 'react';

interface CreateChannelModalProps {
  show: boolean;
  onCloseModal: () => void;
}
const CreateChannelModal: VFC<CreateChannelModalProps> = ({
  show,
  onCloseModal,
}) => {
  const [newChannel, onChangeNewChannel] = useInput('');
  const onCreateChannel = useCallback(() => {}, []);

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onCreateChannel}>
        <Label id="channel-label">
          <span>채널</span>
          <Input
            id="channel"
            value={newChannel}
            onChange={onChangeNewChannel}
          />
        </Label>
        <Button type="submit">생성하기</Button>
      </form>
    </Modal>
  );
};
export default CreateChannelModal;