import type { AxiosResponse } from "axios";
import api from ".";
import type { Employee } from "@/types/__restaurant";

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  branch_id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: string;
  employee?: Employee;
}

export const clockInQR = (data: {
  branch_id: string;
  token: string;
  lat?: number;
  lng?: number;
}): Promise<AxiosResponse<{ message: string; data: AttendanceRecord }>> =>
  api.post("/attendance/clock-in/qr", data);

export const getAttendanceLogs = (): Promise<AxiosResponse<{ data: AttendanceRecord[] }>> =>
  api.get("/attendance");

export const createAttendance = (data: Partial<AttendanceRecord>): Promise<AxiosResponse<{ data: AttendanceRecord }>> =>
  api.post("/attendance", data);

export const updateAttendance = (id: string, data: Partial<AttendanceRecord>): Promise<AxiosResponse<{ data: AttendanceRecord }>> =>
  api.put(`/attendance/${id}`, data);
