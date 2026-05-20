export interface Tag {
  id: string;
  name: string;
}

export const tagsData: Tag[] = [
  { id: 'tag-001', name: 'recurring' },
  { id: 'tag-002', name: 'salary' },
  { id: 'tag-003', name: 'essentials' },
  { id: 'tag-004', name: 'passive-income' },
  { id: 'tag-005', name: 'bills' },
  { id: 'tag-006', name: 'dining' },
  { id: 'tag-007', name: 'freelance' },
  { id: 'tag-008', name: 'income' },
  { id: 'tag-009', name: 'transportation' },
  { id: 'tag-010', name: 'entertainment' },
  { id: 'tag-011', name: 'savings' },
  { id: 'tag-012', name: 'transfer' },
  { id: 'tag-013', name: 'healthcare' },
  { id: 'tag-014', name: 'investment' },
  { id: 'tag-015', name: 'stocks' },
  { id: 'tag-016', name: 'housing' },
];

export const getTagById = (id: string): Tag | undefined => {
  return tagsData.find(tag => tag.id === id);
};

export const getTagsByName = (names: string[]): Tag[] => {
  return tagsData.filter(tag => names.includes(tag.name));
};
