export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export const usersData: User[] = [
  {
    id: 'user-001',
    email: 'john.doe@example.com',
    name: 'John Doe',
    createdAt: '2025-01-15T10:30:00Z',
  },
];

export const getUserById = (id: string): User | undefined => {
  return usersData.find(user => user.id === id);
};

export const getUserByEmail = (email: string): User | undefined => {
  return usersData.find(user => user.email === email);
};
