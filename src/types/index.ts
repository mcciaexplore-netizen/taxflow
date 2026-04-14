export type UserRole = 'client' | 'staff' | 'admin';
export type EntityType = 'Individual' | 'HUF' | 'Partnership Firm' | 'Limited Liability Partnership' | 'Private Limited Company' | 'Public Limited Company';

export interface BankAccount {
  accountNumber: string;
  ifsc: string;
  branch: string;
  address: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  phoneNumber?: string;
  createdAt: any;
}

export type ReturnStatus = 'New' | 'In Progress' | 'Query Raised' | 'Review' | 'Filed';

export interface TaxReturn {
  id: string;
  userId: string;
  financialYear: string;
  entityType: EntityType;
  status: ReturnStatus;
  assignedStaffId?: string;
  questionnaire?: {
    natureOfIncome: string[];
    bankAccounts: BankAccount[];
    portalPassword?: string;
  };
  computationSummary?: Record<string, any>;
  createdAt: any;
  updatedAt: any;
}

export interface TaxDocument {
  id: string;
  userId: string;
  uploaderId: string;
  returnId: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: any;
}

export interface TaxQuery {
  id: string;
  returnId: string;
  senderId: string;
  senderRole: UserRole;
  senderName: string;
  message: string;
  timestamp: any;
}
