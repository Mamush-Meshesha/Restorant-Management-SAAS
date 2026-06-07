import type { AxiosResponse } from "axios";
import api from ".";
import type {

RoomFilterParams,
RoomSearchParams,
RoomsSearchResponse,
SingleRoomResponse,
CreateRoomData,
UpdateRoomData,
DeleteRoomResponse,
RoomStatisticsResponse,
RoomsResponse,
} from "@/types/__rooms";
// API Functions
export const getAllRooms = (params?: RoomFilterParams): Promise<AxiosResponse<RoomsResponse>> => {
  return api.get("/room/get_all_rooms", { params });
};

export const searchRoomsPaginated = (
  params?: RoomSearchParams,
  signal?: AbortSignal
): Promise<AxiosResponse<RoomsSearchResponse>> => {
  return api.get("/room/search", { params, signal });
};

export const getRoomById = (
  roomId: string
): Promise<AxiosResponse<SingleRoomResponse>> => {
  return api.get(`/room/get_room/${roomId}`);
};

export const createRoom = (
  payload: CreateRoomData
): Promise<AxiosResponse<SingleRoomResponse>> => {
  return api.post("/room/create_room", payload);
};

export const updateRoom = (
  roomId: string,
  payload: UpdateRoomData
): Promise<AxiosResponse<SingleRoomResponse>> => {
  return api.put(`/room/update_room/${roomId}`, payload);
};

export const deleteRoom = (
  roomId: string
): Promise<AxiosResponse<DeleteRoomResponse>> => {
  return api.delete(`/room/delete_room/${roomId}`);
};

// Legacy functions for backward compatibility
export const getRoomsWithFilter = (
  params?: RoomFilterParams
): Promise<AxiosResponse<RoomsResponse>> => {
  return getAllRooms(params);
};

export const searchRooms = (
  params?: RoomSearchParams,
  signal?: AbortSignal
): Promise<AxiosResponse<RoomsSearchResponse>> => {
  // Prefer the paginated search endpoint when available
  return api.get("/room/search", { params, signal }) as Promise<AxiosResponse<RoomsSearchResponse>>;
};

export const getRoomStatistics = (): Promise<
  AxiosResponse<RoomStatisticsResponse>
> => {
  return api.get("/room/statistics");
};

// Legacy exports for backward compatibility
export type CreateRoomFormData = CreateRoomData;
export type CreateRoomResponse = SingleRoomResponse;
