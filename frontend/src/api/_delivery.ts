import type { AxiosResponse } from "axios";
import api from ".";
import type { DeliveryZone, Driver, DeliveryOrder } from "@/types/__restaurant";

export const getDrivers = (): Promise<AxiosResponse<{ data: Driver[] }>> =>
  api.get("/delivery/drivers");

export const createDriver = (data: Partial<Driver>): Promise<AxiosResponse<{ data: Driver }>> =>
  api.post("/delivery/drivers", data);

export const updateDriver = (id: string, data: Partial<Driver>): Promise<AxiosResponse<{ data: Driver }>> =>
  api.put(`/delivery/drivers/${id}`, data);

export const deleteDriver = (id: string): Promise<AxiosResponse> =>
  api.delete(`/delivery/drivers/${id}`);

export const getDeliveryZones = (): Promise<AxiosResponse<{ data: DeliveryZone[] }>> =>
  api.get("/delivery/zones");

export const createDeliveryZone = (data: Partial<DeliveryZone>): Promise<AxiosResponse<{ data: DeliveryZone }>> =>
  api.post("/delivery/zones", data);

export const updateDeliveryZone = (id: string, data: Partial<DeliveryZone>): Promise<AxiosResponse<{ data: DeliveryZone }>> =>
  api.put(`/delivery/zones/${id}`, data);

export const deleteDeliveryZone = (id: string): Promise<AxiosResponse> =>
  api.delete(`/delivery/zones/${id}`);

export const getActiveDeliveries = (): Promise<AxiosResponse<{ data: DeliveryOrder[], pending: any[] }>> =>
  api.get("/delivery/orders");

export const createDeliveryOrder = (data: Partial<DeliveryOrder>): Promise<AxiosResponse<{ data: DeliveryOrder }>> =>
  api.post("/delivery/orders", data);

export const assignDriver = (id: string, driver_id: string, estimated_time?: string): Promise<AxiosResponse<{ data: DeliveryOrder }>> =>
  api.put(`/delivery/orders/${id}/assign`, { driver_id, estimated_time });

export const updateDeliveryStatus = (id: string, status: string): Promise<AxiosResponse<{ data: DeliveryOrder }>> =>
  api.put(`/delivery/orders/${id}/status`, { status });
