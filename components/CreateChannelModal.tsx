import Modal from '@components/Modal';
import useInput from '@hooks/useInput';
import { Button, Input, Label } from '@styles/signup-styled';
import { createChannelFetcher } from '@utils/fetcher';
import { FormEvent, memo, useCallback, VFC } from 'react';
import { useQueryClient } from 'react-query';

interface CreateChannelModalProps {
  workspace: string;
  show: boolean;
  onCloseModal: () => void;
}
const CreateChannelModal: VFC<CreateChannelModalProps> = ({
  workspace,
  show,
  onCloseModal,
}) => {
  const queryClient = useQueryClient();
  const [newChannel, onChangeNewChannel] = useInput('');
  const onCreateChannel = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      await createChannelFetcher({
        workspace,
        name: newChannel,
      });
      queryClient.refetchQueries(['workspace', workspace, 'channel']);
      onCloseModal();
    },
    [newChannel, onCloseModal, queryClient, workspace],
  );

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
export default memo(CreateChannelModal);
