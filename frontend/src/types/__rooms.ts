import type { Pagination } from "./__index";

export interface Room {
  room_id: string;
  name: string;
  room_number: string;
  capacity: number;
  description?: string;
  location?: string;
  type?: string;
  room_type_id?: string;
  roomType?: { name: string }; // Assuming roomType has at least a name property
  is_available: boolean;
  is_active: boolean;
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string
}

export interface CreateRoomData {
  name: string;
  room_number: string;
  capacity: number;
  description?: string;
  location?: string;
  type?: string;
}

export interface UpdateRoomData {
  name?: string;
  room_number?: string;
  capacity?: number;
  description?: string;
  location?: string;
  type?: string;
  is_available?: boolean;
  is_active?: boolean;
}
// API Response Types
export interface RoomsResponse {
  message: string;
  rooms: Room[];
}

// Backend actually returns rooms array directly

export interface SingleRoomResponse {
  message: string;
  room: Room;
}

export interface DeleteRoomResponse {
  message: string;
}

// Request Types
export interface CreateRoomData {
  name: string;
  room_number: string;
  capacity: number;
  description?: string;
  location?: string;
  type?: string;
  is_available?: boolean;
  is_active?: boolean;
}

export interface UpdateRoomData {
  name?: string;
  room_number?: string;
  capacity?: number;
  description?: string;
  location?: string;
  type?: string;
  is_available?: boolean;
  is_active?: boolean;
}

export interface RoomFilterParams {
  page?: number;
  limit?: number;
  name?: string;
}

export interface RoomSearchParams {
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export interface RoomsSearchResponse {
  message: string;
  rooms: Room[];
  total: number;
  page: number;
  limit: number;
}

export interface RoomStatisticsResponse {
  message: string;
  statistics: {
    totalRooms: number;
    availableRooms: number;
    unavailableRooms: number;
    roomsByType: Record<string, number>;
  };
}

export interface RoomsResponse {
  message: string;
  data: Room[];
  pagination: Pagination;
}
