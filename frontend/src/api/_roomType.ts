import type { AxiosResponse } from "axios";
import api from ".";
import type {
  RoomType,
  CreateRoomTypeData,
  UpdateRoomTypeData,
  RoomTypeSearchParams,
  RoomTypeSearchResponse,
} from "@/types/__roomType";

// ...existing code...

export const getPaginatedRoomTypes = (
  params?: RoomTypeSearchParams,
  signal?: AbortSignal
): Promise<AxiosResponse<RoomTypeSearchResponse>> => {
  // paginated search endpoint
  return api.get("/roomType/get_room_types_paginated", { params, signal });
};

export const getAllRoomTypes = (
  params?: RoomTypeSearchParams,
  signal?: AbortSignal
): Promise<AxiosResponse<RoomTypeSearchResponse>> => {
  // non-paginated / filter endpoint (if you want a separate call)
  return api.get("/roomType/get_all_room_types", { params, signal });
};

export const getRoomTypesWithFilter = (
  params?: RoomTypeSearchParams,
  signal?: AbortSignal
): Promise<AxiosResponse<RoomTypeSearchResponse>> => {
  return api.get("/roomType/get_room_types_with_filter", { params, signal });
};

export const createRoomType = (
  payload: CreateRoomTypeData
): Promise<AxiosResponse<{ message: string; data: RoomType }>> => {
  return api.post("/roomType/create_room_type", payload);
};

// ...existing code...
export const updateRoomType = (
  room_type_id: string,
  payload: UpdateRoomTypeData
): Promise<AxiosResponse<{ message: string; data: RoomType }>> => {
  return api.put(`/roomType/update_room_type/${room_type_id}`, payload);
};

export const deleteRoomType = (room_type_id: string): Promise<AxiosResponse<{ message: string }>> => {
  return api.delete(`roomType/delete_room_type/${room_type_id}`);
};

export const getRoomTypeById = (room_type_id: string): Promise<AxiosResponse<{ message: string; data: RoomType }>> => {
  return api.get(`/roomType/${room_type_id}`);
};
// ...existing code...