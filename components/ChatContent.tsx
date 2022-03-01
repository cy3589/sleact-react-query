import regexifyString from 'regexify-string';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactElement, VFC } from 'react';

interface ChatContentProps {
  content: string;
}
const ChatContent: VFC<ChatContentProps> = ({ content }) => {
  const router = useRouter();
  return regexifyString({
    input: content,
    pattern: /@\[.+?\]\(\d+?\)|\n/g,
    decorator: (match, index) => {
      const arr = match.match(/@\[(.+?)\]\((\d+?)\)/)!;
      if (arr)
        return (
          <Link
            key={match + index}
            href={`/workspace/${router.query.workspace}/dm?id=${arr[2]}`}
          >
            {`@${arr[1]}`}
          </Link>
        );
      return <br key={index} />;
    },
  }) as unknown as ReactElement;
};

export default ChatContent;
