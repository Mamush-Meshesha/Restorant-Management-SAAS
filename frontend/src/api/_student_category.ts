import type { AxiosResponse } from "axios";
import api from ".";
import type { CreateStudentCategoryData, DeleteStudentCategoryResponse, SingleStudentCategoryResponse, StudentCategoriesPaginatedResponse, StudentCategoriesResponse, StudentCategoryFilterParams, StudentCategoryStatisticsResponse, UpdateStudentCategoryData } from "@/types/__student_category";
// API Functions
export const getAllStudentCategories = (params?: StudentCategoryFilterParams): Promise<
  AxiosResponse<StudentCategoriesResponse>
> => {
  return api.get("/studentCategory/get_all_student_categories", {
    params,
  });
};

export const getActiveStudentCategories = (): Promise<
  AxiosResponse<StudentCategoriesResponse>
> => {
  return api.get("/studentCategory/get_active_student_categories");
};

export const getStudentCategoriesWithPagination = (params?: StudentCategoryFilterParams, signal?: AbortSignal):
 Promise<AxiosResponse<StudentCategoriesPaginatedResponse>> => {
  return api.get("/studentCategory/get_student_categories_with_pagination", {
    params,
    signal,
  });
};

export const getStudentCategoriesWithFilter = (
  params?: StudentCategoryFilterParams
): Promise<AxiosResponse<StudentCategoriesResponse>> => {
  return api.get("/studentCategory/get_student_categories_with_filter", {
    params,
  });
};

export const getStudentCategoryById = (
  categoryId: string
): Promise<AxiosResponse<SingleStudentCategoryResponse>> => {
  return api.get(`/studentCategory/get_student_category_by_id/${categoryId}`);
};

export const createStudentCategory = (
  payload: CreateStudentCategoryData
): Promise<AxiosResponse<SingleStudentCategoryResponse>> => {
  return api.post("/studentCategory/create_student_category", payload);
};

export const updateStudentCategory = (
  categoryId: string,
  payload: UpdateStudentCategoryData
): Promise<AxiosResponse<SingleStudentCategoryResponse>> => {
  return api.put(
    `/studentCategory/update_student_category/${categoryId}`,
    payload
  );
};

export const deleteStudentCategory = (
  categoryId: string
): Promise<AxiosResponse<DeleteStudentCategoryResponse>> => {
  return api.delete(`/studentCategory/delete_student_category/${categoryId}`);
};

export const getStudentCategoryStatistics = (): Promise<
  AxiosResponse<StudentCategoryStatisticsResponse>
> => {
  return api.get("/studentCategory/get_student_category_statistics");
};

// Legacy exports for backward compatibility
export type CreateStudentCategoryFormData = CreateStudentCategoryData;
export type CreateStudentCategoryResponse = SingleStudentCategoryResponse;
