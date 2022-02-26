import useSocket from '@hooks/useSocket';
import { IUser, IUserWithOnline } from '@interfaces/db';
import CollapseButton from '@styles/dm-list-styled';
import { getWorkspaceMembersData } from '@utils/fetcher';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-query';

const DMList: FC<{ myData: IUser; workspace: string }> = ({
  myData,
  workspace,
}) => {
  const router = useRouter();
  const { socket, disconnect } = useSocket(workspace);
  const [channelCollapse, setChannelCollapse] = useState<boolean>(false);
  const [countList, setCountList] = useState<{ [key: string]: number }>({});
  const [onlineList, setOnlineList] = useState<number[]>([]);

  const { data: memberData } = useQuery<IUserWithOnline[]>(
    ['workspace', workspace, 'member'],
    () => getWorkspaceMembersData({ workspace }),
    { enabled: !!myData },
  );
  const toggleChannelCollapse = useCallback(() => {
    setChannelCollapse((prev) => !prev);
  }, []);

  const resetCount = useCallback(
    (id) => () => {
      setCountList((list) => {
        return {
          ...list,
          [id]: 0,
        };
      });
    },
    [],
  );
  useEffect(() => {
    socket?.on('onlineList', (data: number[]) => {
      setOnlineList(data);
    });
    return () => {
      socket?.off('onlineList');
    };
  }, [socket]);
  return (
    <>
      <h2>
        <CollapseButton
          collapse={channelCollapse}
          onClick={toggleChannelCollapse}
        >
          <i
            className="c-icon p-channel_sidebar__section_heading_expand p-channel_sidebar__section_heading_expand--show_more_feature c-icon--caret-right c-icon--inherit c-icon--inline"
            data-qa="channel-section-collapse"
            aria-hidden="true"
          />
        </CollapseButton>
        <span>Direct Messages</span>
      </h2>
      <div>
        {!channelCollapse &&
          memberData?.map((member) => {
            const isOnline = onlineList.indexOf(member.id) !== -1;
            const href = `/workspace/${workspace}/dm?id=${member.id}`;
            return (
              <Link key={member.id} passHref href={href}>
                <a
                  href={href}
                  className={router.asPath === href ? 'selected' : ''}
                >
                  <i
                    className={`c-icon p-channel_sidebar__presence_icon p-channel_sidebar__presence_icon--dim_enabled c-presence ${
                      isOnline
                        ? 'c-presence--active c-icon--presence-online'
                        : 'c-icon--presence-offline'
                    }`}
                    aria-hidden="true"
                    data-qa="presence_indicator"
                    data-qa-presence-self="false"
                    data-qa-presence-active="false"
                    data-qa-presence-dnd="false"
                  />
                  <span>{member.nickname}</span>
                  {member.id === myData?.id && <span> (나)</span>}
                </a>
              </Link>
            );
          })}
      </div>
    </>
  );
};
export default memo(DMList);
