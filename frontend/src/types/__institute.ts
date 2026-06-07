export interface Institute {
  chapa: any;
//   Name
// Branch name
// Tin number 
// School motto 
// School code 
// Branch code
// Academic year
// School code
// Phone no
// Tel no
// Po box
// Email
// Wereda
// kebele
// address
// Fax No
// Logo
// Stamp
// Description

  id: string;
  name: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  isActive: boolean;

  academic_year: string;
  school_code: string;

  logo: string;
  stamp?: File | null;
  website?: string;
  kebele?: string;
  wereda?: string;
  po_box?: string;
  branch_code?: string;
  school_motto?: string;
  branch_name?: string;
  tin_number?: string;
  tel_no?: string;
  fax_no?: string;
  chapa_image_url?: string;

  description: string;
}
