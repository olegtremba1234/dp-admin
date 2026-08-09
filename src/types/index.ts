export type ListingType = 'sale' | 'service';
export type ListingStatus = 'active' | 'reserved' | 'archived';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  type: ListingType;
  icon?: string;
}

export interface Listing {
  _id: string;
  title: string;
  slug: string;
  type: ListingType;
  category: Category | string;
  price: number | null;
  isNegotiable: boolean;
  unit?: string;
  description: string;
  images: string[];
  attributes: Record<string, string>;
  status: ListingStatus;
  isFeatured: boolean;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export type DocumentCategory = 'about' | 'reporting' | 'charter' | 'tender' | 'financial' | 'other';

export interface OfficialDocument {
  _id: string;
  title: string;
  date: string;
  fileUrl: string;
  fileSize?: string;
  category: DocumentCategory;
}

export interface NewsItem {
  _id: string;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  image?: string;
  isPublished: boolean;
}

export type TenderStatus = 'active' | 'completed' | 'cancelled';

export interface TenderItem {
  _id: string;
  title: string;
  number: string;
  status: TenderStatus;
  publishDate: string;
  deadline?: string;
  link: string;
}

export interface ContactSubmission {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  subject: string;
  message: string;
  isResolved: boolean;
  createdAt: string;
}

export interface ListingRequest {
  _id: string;
  listing: { _id: string; title: string } | string;
  name: string;
  phone: string;
  message?: string;
  isResolved: boolean;
  createdAt: string;
}

export type EmploymentType = 'full-time' | 'part-time' | 'contract';
export type VacancyStatus = 'open' | 'closed';

export interface Vacancy {
  _id: string;
  title: string;
  department?: string;
  employmentType: EmploymentType;
  salary?: string;
  location?: string;
  description: string;
  requirements: string;
  benefits?: string;
  status: VacancyStatus;
  isFeatured: boolean;
  deadline?: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VacancyApplication {
  _id: string;
  vacancy: { _id: string; title: string } | string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  isResolved: boolean;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'editor';
}
