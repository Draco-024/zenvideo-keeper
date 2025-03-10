
export interface Video {
  id: string;
  title: string;
  url: string;
  category: 'aptitude' | 'reasoning' | 'english';
  thumbnail?: string;
  createdAt: number;
}

export type Category = 'aptitude' | 'reasoning' | 'english';
