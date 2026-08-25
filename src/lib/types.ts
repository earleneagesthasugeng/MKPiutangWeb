export type DebtStatus = "UNPAID" | "PARTIAL" | "PAID";

export type PaymentMethod = "TRANSFER_BCA" | "TRANSFER_MANDIRI" | "CASH" | "OTHER";

export type PaymentDTO = {
  id: string;
  amount: number;
  method: PaymentMethod;
  note: string | null;
  paidAt: string;
};

export type DebtDTO = {
  id: string;
  customerId: number;
  customerIdFormatted: string;
  customerName: string;
  customerBusinessName: string;
  customerAddress: string;
  customerPhone: string;
  amount: number;
  amountPaid: number;
  remaining: number;
  status: DebtStatus;
  dueDate: string;
  createdAt: string;
  paidAt: string | null;
  isOverdue: boolean;
  createdByDisplayName: string;
};

export type CustomerListItemDTO = {
  id: number;
  idFormatted: string;
  fullName: string;
  businessName: string;
  address: string;
  phone: string;
  outstandingAmount: number;
  overdueCount: number;
};

export type CustomerDTO = {
  id: number;
  idFormatted: string;
  fullName: string;
  businessName: string;
  address: string;
  phone: string;
};

export type CustomerDetailDTO = {
  customer: CustomerDTO;
  totalUnpaidOutstanding: number;
  totalPaid: number;
  overdueCount: number;
  canDelete: boolean;
};

export type AdminUserDTO = {
  id: string;
  username: string;
  displayName: string;
  role: "BOSS" | "STAFF";
};
