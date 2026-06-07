import type { ClassPaymentMapping } from "./__class_payment_mapping";
import type { Pagination } from "./__pagination";
import type { Student } from "./__student";

export interface PaymentType {
  id: string;
  payment_type_id: string;
  type_name: string;
  description?: string;
  is_one_time?: string;
  status?: "Active" | "Inactive";
  start_date?: Date;
  end_date?: Date;
  is_mandatory: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentTypeFormData
{
  
  type_name: string;
  description?: string;
  is_one_time?: boolean;
  status?: "Active" | "Inactive";
  is_mandatory: boolean;
  created_at?: string;
  updated_at?: string;
}
export interface CreatePaymentTypeResponse {
  message: string;
  payment: Payment;
}

export interface GetAllPaymentTypesResponse {
  message: string;
  data: PaymentType[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetSinglePaymentTypeResponse {
  message: string;
  payment: Payment;
}


export interface PaymentTypeSearchParams {
  name?: string;
  status?: "Active" | "Inactive";
  is_mandatory?: boolean;
  is_one_time?: boolean;
  page?: number;
  limit?: number;
}

export interface PaymentFrequency {
  id: string;
  frequency_id: string;
  name: string;
  start_date: Date ;
  end_date : Date ;
  status: "Active" | "Inactive";
  description?: string;
  created_at?: string;
  updated_at?: string;
  paymentType?: PaymentType;
}

export interface PaymentFrequencyFormData
{
  
  name: string;
  start_date: Date;
  end_date? : Date;
  status: "Active" | "Inactive";
  description?: string;
  created_at?: string;
  updated_at?: string;
}
export interface CreatePaymentFrequencyResponse {
  message: string;
  paymentFrequency: PaymentFrequency;
}

export interface GetAllPaymentFrequenciesResponse {
  message: string;
  data: PaymentFrequency[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetSinglePaymentFrequencyResponse {
  message: string;
  paymentFrequency: PaymentFrequency;
}


export interface PaymentFrequencySearchParams {
  name?: string;
  status?: "Active" | "Inactive";
  is_mandatory?: boolean;
  isOnetime?: boolean;
  page?: number;
  limit?: number;
}


// payments = [
//     {
//         "id": 1,
//         "studentId": "uuid",
//         "paymentTypes": [
//             {
//                "id": 1,
//                 "name": " tuition fee", 
//                 "cycleId": "uuid",
//                 "status": "active",
//                 "description": "fee for tuition",
//                 "amount": 5000,
//             },
//             {
//                 "id": 2,
//                 "name": " library fee", 
//                 "cycleId": "uuid",
//                 "status": "active",
//                 "description": "fee for library",
//                 "amount": 2000,
//             }

//         ],
//         "amountPaid": 7000,
//         "paymentDate": "2023-01-15",
//         "status": "completed",
//         "description": "payment for january tuition fee"
//     }
// ]
export interface Payments {
  id: string;
  student: Student;
  classPaymentInfo: ClassPaymentMapping[];
  paymentReceiptNumbers?: string[]; // URLs or identifiers for payment receipts
  amountPaid: number;
  totalAmount: number;
  waiverAmount?: number;
  unpaidAmount?: number;
  paymentMethod?: string;
  paymentDate: string;
  status: "Completed" | "Pending" | "Failed";
  description?: string;
  created_at: string;
  updated_at: string;
  recorded_by?: string;
  bank_name?: string;
  receipt_reference?: string;
  

}

export interface PaymentsPaginatedResponse {
  message: string;
  data: PaymentSummary[] | Payment[];
  pagination: Pagination;
}

export interface PaymentDetails extends Payments {
  bank_name?: string;
  receipt_reference?: string;
  description?: string;
}

export interface ClassPaymentType {
  id: string;
  class_id: string;
  class_name?: string;

  payment_type_id: string;
  payment_type_name?: string;

  academic_year_id?: string;
  academic_year_name?: string;

  amount: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  student_name?: string;

  class_payment_type_id: string;
  class_payment_type_name?: string;

  amount_paid: number;
  payment_date: string;
  payment_method?: string;

  recorded_by: string;
  recorded_by_name?: string;

  created_at: string;
  updated_at: string;
}

export interface PaymentSummary {
  id: string;
  student_id: string;
  student_name: string;
  total_amount_due: number;
  amount_paid: number;
  waiver_amount: number;
  unpaid_amount: number;
  status: "Paid" | "Partial" | "Unpaid";
  last_payment_date?: string;
  due_date?: string;
  grade_level?: string;
  section?: string;
  academic_year?: string;
}

export interface PaymentSchedule {
  id: string;
  name: string;
  payment_type_id: string;
  payment_type_name?: string;
  academic_year_id: string;
  academic_year_name?: string;
  start_date: string;
  end_date?: string;
  frequency: "Monthly" | "Quarterly" | "Annually" | "Bi-Annually" | "Weekly";
  amount_per_installment: number;
  status: "Active" | "Inactive" | "Completed";
  description?: string;
  created_at: string;
  updated_at: string;
}
