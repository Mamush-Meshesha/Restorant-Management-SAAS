import api from './client';

export const loginApi = async (payload: any) => {
  const { data } = await api.post('/auth/login', payload);
  return data;
};
