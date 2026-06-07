export function getRouteMeta(path: string) {
  // Handle routes with query parameters generically
  const [basePath] = path.split("?");

  if (routeMetaMap[basePath]) {
    return routeMetaMap[basePath];
  }
  return {
    title: "Unknown Page",
    description: "No description available for this route.",
  };
}

export const routeMetaMap: Record<
  string,
  { title: string; description: string }
> = {
  // Dashboard
  "/dashboard": {
    title: "Dashboard",
    description:
      "Overview of key statistics and recent activity in the admin panel.",
  },

  // Institute Management
  "/institute/view-profile": {
    title: "Institute Profile",
    description: "View and manage educational institute details and settings.",
  },
  "/institute/update-profile": {
    title: "Update Institute Profile",
    description: "Update the details of the institute profile.",
  },

  // Academic Management
  "/academic-years": {
    title: "Academic Years",
    description: "Define and manage academic years and their configurations.",
  },
  "/quarters": {
    title: "Quarters",
    description: "Manage academic quarters within academic years.",
  },
  "/cycles": {
    title: "Cycles",
    description: "Manage academic cycles and their configurations.",
  },
  "/grade-levels": {
    title: "Grade Levels",
    description: "Manage grade levels and their configurations.",
  },

  // Class Management
  "/classes": {
    title: "Classes",
    description: "Organize and manage academic classes.",
  },
  "/classes/new": {
    title: "New Class",
    description: "Create a new academic class.",
  },
  "/classes/update-class/:id": {
    title: "Update Class",
    description: "Update the details of an existing class.",
  },
  "/classes/view-class-detail": {
    title: "View Class Detail",
    description: "View the details of a specific class.",
  },
  "/classes/edit": {
    title: "Edit Class",
    description: "Edit class information and settings.",
  },

  // Academic Structure
  "/sections": {
    title: "Sections",
    description: "Manage class sections under each academic class.",
  },
  "/rooms": {
    title: "Rooms",
    description: "Manage classroom assignments and room configurations.",
  },
  "/subjects": {
    title: "Subjects",
    description: "Define and manage academic subjects offered.",
  },

  // Student Management
  "/student-categories": {
    title: "Student Categories",
    description: "Manage student categories and their configurations.",
  },
  "/students": {
    title: "Students",
    description: "Manage student profiles and academic records.",
  },
  "/students/new": {
    title: "New Student",
    description: "Register a new student in the system.",
  },
  "/students/:id": {
    title: "View Student",
    description: "View the details of a specific student.",
  },
  "/students/update-student/:id": {
    title: "Update Student",
    description: "Update student information and details.",
  },

  // Guardian Management
  "/guardians": {
    title: "Guardians",
    description: "Manage guardian information linked to students.",
  },
  "/guardians/view/:id": {
    title: "View Guardian",
    description: "View guardian details and information.",
  },

  // Staff Management
  "/employees": {
    title: "Employees",
    description: "Manage administrative and support staff information.",
  },
  "/staff": {
    title: "Staff",
    description: "Manage staff members and their information.",
  },
  "/staff/new": {
    title: "New Staff",
    description: "Add a new staff member to the system.",
  },
  "/staff/view/:id": {
    title: "View Staff",
    description: "View staff member details and information.",
  },
  "/staff/edit/:id": {
    title: "Edit Staff",
    description: "Edit staff member information and details.",
  },

  // Staff Configuration
  "/designations": {
    title: "Designations",
    description: "Manage job designations and titles for staff members.",
  },
  "/departments": {
    title: "Departments",
    description: "Manage organizational departments and their structure.",
  },
  "/contract-types": {
    title: "Contract Types",
    description: "Manage different types of employment contracts.",
  },

  // Payment Management
  "/payment-types": {
    title: "Payment Types",
    description: "Define types of payments (e.g., tuition, transport).",
  },
  "/class-payment-types": {
    title: "Class Payment Types",
    description: "Associate payment types with specific classes.",
  },
  "/payments": {
    title: "Payments",
    description: "Handle student fees, invoices, and payment tracking.",
  },
  "/payment-schedule": {
    title: "Payment Schedule",
    description: "Manage payment schedules and due dates.",
  },

  // Attendance Management
  "/student-attendance": {
    title: "Student Attendance",
    description: "Track and manage student attendance records.",
  },
  "/add-student-attendance": {
    title: "Add Student Attendance",
    description: "Add student attendance records.",
  },

  // Academic Assessment
  "/exam-types": {
    title: "Exam Types",
    description: "Manage different types of examinations and assessments.",
  },
  "/subject-wise-marks": {
    title: "Subject Wise Marks",
    description: "Record and manage student marks by subject.",
  },

  // User Management
  "/users": {
    title: "Users",
    description: "Manage system users and assign access credentials.",
  },
  "/roles": {
    title: "Roles",
    description: "Define user roles and permission access levels.",
  },
  "/roles/view/:id": {
    title: "View Role",
    description: "View role details and permissions.",
  },
  "/roles/new": {
    title: "New Role",
    description: "Create a new user role with specific permissions.",
  },

  // Authentication
  "/auth/login": {
    title: "Login",
    description: "Sign in to access the school management system.",
  },
  "/auth/register": {
    title: "Register",
    description: "Create a new account in the system.",
  },
  "/auth/404": {
    title: "Page Not Found",
    description: "The requested page could not be found.",
  },
};
