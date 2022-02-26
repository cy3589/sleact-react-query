import { Dispatch, FC, FormEvent, SetStateAction, useCallback } from 'react';
import Modal from '@components/Modal';
import { Button, Input, Label } from '@styles/signup-styled';
import useInput from '@hooks/useInput';
import { inviteMemberFetcher } from '@utils/fetcher';
import { useQueryClient } from 'react-query';

interface InviteWorkspaceModalProps {
  workspace: string;
  show: boolean;
  onCloseModal: () => void;
  setShowInviteWorkspaceModal: Dispatch<SetStateAction<boolean>>;
}
const InviteWorkspaceModal: FC<InviteWorkspaceModalProps> = ({
  workspace,
  show = false,
  onCloseModal,
  setShowInviteWorkspaceModal,
}) => {
  const queryClient = useQueryClient();
  const [newMember, onChangeNewMember, setNewMember] = useInput('');
  const onInviteMember = useCallback(
    async (e: FormEvent): Promise<void> => {
      e.preventDefault();
      if (!newMember || !newMember.trim()) return;
      await inviteMemberFetcher({ email: newMember, workspace });
      queryClient.refetchQueries(['workspace', workspace, 'channel']);
      setShowInviteWorkspaceModal(false);
      setNewMember('');
    },
    [
      newMember,
      queryClient,
      setNewMember,
      workspace,
      setShowInviteWorkspaceModal,
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
export default InviteWorkspaceModal;
