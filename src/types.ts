export interface Note {
  id: string;
  title: string;
  content: string;
  lastModified: number;
  isFavorite?: boolean;
  isLocked?: boolean;
  lockPin?: string;
  category?: string;
}
