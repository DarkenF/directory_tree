import { DirectoryElement } from '../store/store';

const generateItems = (parentId: string) => {
  const data = [];
  const count = 4;

  for (let i = 0; i < count; i++) {
    const id = `${parentId ? parentId + '_' : ''}${i}`;
    data.push({
      id,
      title: id,
      parentId,
      hasChildren: Math.random() < 0.9,
    });
  }

  return data;
};

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export const fetchDirectoryItemsApi = async (
  parentId = '',
): Promise<DirectoryElement[]> => {
  return new Promise<DirectoryElement[]>((resolve, reject) => {
    setTimeout(() => {
      if (randomIntFromInterval(0, 10) === 2) {
        reject('error');
      }
      resolve(generateItems(parentId));
    }, 500);
  });
};
