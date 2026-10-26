import { InstallmentStatus } from "../../common/enums/installment-status.enum";

export const OPEN_INSTALLMENT_STATUSES = [
  InstallmentStatus.PENDING,
  InstallmentStatus.OVERDUE,
  InstallmentStatus.PARTIAL,
];
