import { IChat, IDM } from '@interfaces/db';
import dayjs from 'dayjs';

const makeSection = (chatList: Array<IChat | IDM>) => {
  const sections: { [key: string]: Array<IChat | IDM> } = {};
  chatList.forEach((chat) => {
    const monthDate = dayjs(chat.createdAt).format('YYYY-MM-DD');
    if (Array.isArray(sections[monthDate])) {
      sections[monthDate].push(chat);
    } else {
      sections[monthDate] = [chat];
    }
  });
  return sections;
};
export default makeSection;
