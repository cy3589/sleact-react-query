import { IChannel } from '@interfaces/db';
import CollapseButton from '@styles/dm-list-styled';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, memo, useCallback, useState } from 'react';

interface ChannelListProps {
  channels?: IChannel[];
  workspace: string;
}
const ChannelList: FC<ChannelListProps> = ({ channels, workspace }) => {
  const router = useRouter();
  const [channelCollapse, setChannelCollapse] = useState<boolean>(false);

  const toggleChannelCollapse = useCallback(() => {
    setChannelCollapse((prev) => !prev);
  }, []);

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
        <span>Channels</span>
      </h2>
      <div>
        {!channelCollapse &&
          channels?.map((channel) => {
            const href = encodeURI(
              `/workspace/${workspace}/channel?channel=${channel.name}`,
            );

            return (
              <Link key={channel.id} passHref href={href}>
                <a
                  href={href}
                  className={router.asPath === href ? 'selected' : ''}
                >
                  <span>{channel.name}</span>
                </a>
              </Link>
            );
          })}
      </div>
    </>
  );
};
ChannelList.defaultProps = { channels: [] };
export default memo(ChannelList);
