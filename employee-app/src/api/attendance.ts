import api from './client';

export const clockInQrApi = async (payload: { branch_id: string; token: string; lat?: number; lng?: number }) => {
  const { data } = await api.post('/attendance/clock-in-qr', payload);
  return data;
};

export const clockInApi = async (payload: { branch_id: string; employee_id: string }) => {
  const { data } = await api.post('/attendance/clock-in', payload);
  return data;
};
