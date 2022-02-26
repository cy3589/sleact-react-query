import {
  ChatArea,
  EachMention,
  Form,
  MentionsTextarea,
  SendButton,
  Toolbox,
} from '@styles/chat-box-styled';
import {
  VFC,
  Dispatch,
  FormEvent,
  useCallback,
  KeyboardEvent,
  useRef,
  useEffect,
  ReactNode,
} from 'react';
import autosize from 'autosize';
import {
  Mention,
  OnChangeHandlerFunc,
  SuggestionDataItem,
} from 'react-mentions';
import { useQuery } from 'react-query';
import { getMyDataUseCookie, getWorkspaceMembersData } from '@utils/fetcher';
import { IUser, IUserWithOnline } from '@interfaces/db';
import Image from 'next/image';
import gravatar from 'gravatar';

interface ChatBoxProps {
  chat: string;
  workspace: string;
  onSubmitForm: Dispatch<FormEvent>;
  onChangeChat: OnChangeHandlerFunc;
  placeholder?: string;
}
const ChatBox: VFC<ChatBoxProps> = ({
  chat,
  workspace,
  onSubmitForm,
  onChangeChat,
  placeholder,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: myData, isLoading: isLoadingMydata } = useQuery<IUser>(
    'user',
    getMyDataUseCookie,
  );
  const { data: membersData } = useQuery<IUserWithOnline[]>(
    ['workspace', workspace, 'member'],
    () => getWorkspaceMembersData({ workspace }),
    { enabled: !!myData },
  );

  const onKeyDownChat = useCallback(
    (
      e: KeyboardEvent<HTMLTextAreaElement> | KeyboardEvent<HTMLInputElement>,
    ) => {
      if (e.key === 'Enter' && !e.shiftKey) onSubmitForm(e);
    },
    [onSubmitForm],
  );
  const renderSuggestion = useCallback(
    (
      suggestion: SuggestionDataItem,
      search: string,
      highlightedDisplay: ReactNode,
      index: number,
      focused: boolean,
    ): ReactNode => {
      if (!membersData) return null;
      return (
        <EachMention focus={focused}>
          <div style={{ position: 'relative' }}>
            <Image
              src={gravatar
                .url(membersData[index].nickname, { s: '36px', d: 'retro' })
                .replace('//', 'https://')}
              alt={membersData[index].nickname}
              width="36px"
              height="36px"
              layout="fixed"
            />
          </div>
          <span>{highlightedDisplay}</span>
        </EachMention>
      );
    },
    [membersData],
  );

  useEffect(() => {
    if (textareaRef.current) autosize(textareaRef.current);
  }, []);
  if (isLoadingMydata) return null;
  return (
    <ChatArea>
      <Form onSubmit={onSubmitForm}>
        <MentionsTextarea
          id="editor-chat"
          value={chat}
          onChange={onChangeChat}
          onKeyDown={onKeyDownChat}
          placeholder={placeholder}
          inputRef={textareaRef}
          allowSuggestionsAboveCursor
        >
          <Mention
            appendSpaceOnAdd
            trigger="@"
            data={
              membersData?.map((v) => ({ id: v.id, display: v.nickname })) || []
            }
            renderSuggestion={renderSuggestion}
          />
        </MentionsTextarea>
        <Toolbox>
          <SendButton
            className={`c-button-unstyled c-icon_button c-icon_button--light c-icon_button--size_medium c-texty_input__button c-texty_input__button--send ${
              chat?.trim() ? '' : ' c-texty_input__button--disabled'
            }`}
            data-qa="texty_send_button"
            aria-label="Send message"
            data-sk="tooltip_parent"
            type="submit"
            disabled={!chat?.trim()}
          >
            <i
              className="c-icon c-icon--paperplane-filled"
              aria-hidden="true"
            />
          </SendButton>
        </Toolbox>
      </Form>
    </ChatArea>
  );
};
ChatBox.defaultProps = {
  placeholder: '',
};
export default ChatBox;
