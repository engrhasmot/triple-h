// Re-export model interfaces for use in components
export type { IProject, IProjectImage } from '@/models/project.model';
export type { IInquiry, ServiceType, InquirySource, InquiryStatus } from '@/models/inquiry.model';
export type {
  IPlanStatus,
  PlanStatusType,
  IStatusHistoryEntry,
  IPlanDocument,
} from '@/models/plan-status.model';
export type { IAppointment, AppointmentType, AppointmentStatus } from '@/models/appointment.model';
export type { IUser, UserRole } from '@/models/user.model';

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Cost Estimator types
export interface CostBreakdown {
  foundation: { min: number; max: number };
  structural: { min: number; max: number };
  finishing: { min: number; max: number };
  total: { min: number; max: number };
}

export interface CostEstimation {
  area: number;
  floors: number;
  quality: 'standard' | 'premium' | 'luxury';
  totalArea: number;
  breakdown: CostBreakdown;
}
