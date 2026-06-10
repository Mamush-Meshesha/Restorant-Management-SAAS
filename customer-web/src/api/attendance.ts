import type { AxiosResponse } from "axios";
import api from "./client";

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  branch_id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: string;
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
