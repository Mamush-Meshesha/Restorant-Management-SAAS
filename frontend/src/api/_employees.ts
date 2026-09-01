import api from ".";
import type { AxiosResponse } from "axios";
import type { Employee, Department, Position, EmploymentType } from "@/types/__restaurant";

// Employees
export const getEmployees = (): Promise<AxiosResponse<{ data: Employee[] }>> => api.get("/employee");
export const createEmployee = (data: Partial<Employee>): Promise<AxiosResponse<{ data: Employee }>> => api.post("/employee", data);
export const updateEmployee = (id: string, data: Partial<Employee>): Promise<AxiosResponse<{ data: Employee }>> => api.put(`/employee/${id}`, data);
export const deleteEmployee = (id: string): Promise<AxiosResponse<{ message: string }>> => api.delete(`/employee/${id}`);

// Departments
export const getDepartments = (): Promise<AxiosResponse<{ data: Department[] }>> => api.get("/employee/departments/all");
export const createDepartment = (data: Partial<Department>): Promise<AxiosResponse<{ data: Department }>> => api.post("/employee/departments", data);
export const updateDepartment = (id: string, data: Partial<Department>): Promise<AxiosResponse<{ data: Department }>> => api.put(`/employee/departments/${id}`, data);
export const deleteDepartment = (id: string): Promise<AxiosResponse<{ message: string }>> => api.delete(`/employee/departments/${id}`);

// Positions
export const getPositions = (): Promise<AxiosResponse<{ data: Position[] }>> => api.get("/employee/positions/all");
export const createPosition = (data: Partial<Position>): Promise<AxiosResponse<{ data: Position }>> => api.post("/employee/positions", data);
export const updatePosition = (id: string, data: Partial<Position>): Promise<AxiosResponse<{ data: Position }>> => api.put(`/employee/positions/${id}`, data);
export const deletePosition = (id: string): Promise<AxiosResponse<{ message: string }>> => api.delete(`/employee/positions/${id}`);

// Employment Types
export const getEmploymentTypes = (): Promise<AxiosResponse<{ data: EmploymentType[] }>> => api.get("/employee/employment-types/all");
export const createEmploymentType = (data: Partial<EmploymentType>): Promise<AxiosResponse<{ data: EmploymentType }>> => api.post("/employee/employment-types", data);
export const updateEmploymentType = (id: string, data: Partial<EmploymentType>): Promise<AxiosResponse<{ data: EmploymentType }>> => api.put(`/employee/employment-types/${id}`, data);
export const deleteEmploymentType = (id: string): Promise<AxiosResponse<{ message: string }>> => api.delete(`/employee/employment-types/${id}`);
