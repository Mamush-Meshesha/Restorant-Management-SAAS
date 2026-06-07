import type { GradeLevel } from "./__gradeLevels";
import type { PaymentFrequency, PaymentType } from "./__payments";
import type { Section } from "./__section";

export interface ClassPaymentMapping {
    id: string;
    class_payment_mapping_id: string;
    name: string;

    grade_level: GradeLevel;    
    section?: Section;
    payment_type: PaymentType;
    frequency?: PaymentFrequency;
    amount: number;
    status: "Active" | "Inactive";
    description?: string;
    created_at: string;
    updated_at: string;

    // for frontend use
    grade_level_id?: string;
    section_id?: string;
    payment_type_id?: string;
    frequency_id?: string;
    paymentType?: PaymentType;
    gradeLevel?: GradeLevel;
    sectionData?: Section;
    paymentFrequency?: PaymentFrequency;
}
