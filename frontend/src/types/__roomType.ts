export interface RoomType {
  room_type_id: string;
  name: string;
  description?: string;
  status: "Active" | "Inactive";
  created_at?: string;
  updated_at?: string;
}

export interface CreateRoomTypeData {
  name: string;
  description?: string;
  status?: "Active" | "Inactive";
}

export interface UpdateRoomTypeData {
  name?: string;
  description?: string;
  status?: "Active" | "Inactive";
}

export interface RoomTypeSearchParams {
  name ?: string;
  page?: number;
  limit?: number;
}

export interface RoomTypeSearchResponse {
  message: string;
  data: RoomType[];
  total: number;
  page: number;
  limit: number;
}
