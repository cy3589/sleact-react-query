import { Dispatch, FC, FormEvent, SetStateAction, useCallback } from 'react';
import Modal from '@components/Modal';
import { Button, Input, Label } from '@styles/signup-styled';
import useInput from '@hooks/useInput';
import { inviteChannelMemberFetcher } from '@utils/fetcher';
import { useQueryClient } from 'react-query';

interface InviteChannelModalProps {
  workspace: string;
  show: boolean;
  onCloseModal: () => void;
  setShowInviteChannelModal: Dispatch<SetStateAction<boolean>>;
  channel: string;
}
const InviteChannelModal: FC<InviteChannelModalProps> = ({
  workspace,
  show = false,
  onCloseModal,
  setShowInviteChannelModal,
  channel,
}) => {
  const queryClient = useQueryClient();
  const [newMember, onChangeNewMember, setNewMember] = useInput('');
  const onInviteMember = useCallback(
    async (e: FormEvent): Promise<void> => {
      e.preventDefault();
      if (!newMember || !newMember.trim()) return;
      await inviteChannelMemberFetcher({
        email: newMember,
        workspace,
        channel,
      });
      queryClient.refetchQueries([
        'workspace',
        workspace,
        'channel',
        channel,
        'member',
      ]);
      setShowInviteChannelModal(false);
      setNewMember('');
    },
    [
      newMember,
      queryClient,
      setNewMember,
      workspace,
      setShowInviteChannelModal,
      channel,
    ],
  );
  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteMember}>
        <Label id="member-label">
          <span>이메일</span>
          <Input
            id="member"
            type="email"
            value={newMember}
            onChange={onChangeNewMember}
          />
        </Label>
        <Button type="submit">초대하기</Button>
      </form>
    </Modal>
  );
};
export default InviteChannelModal;
