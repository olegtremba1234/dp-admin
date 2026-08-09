import api from './client';
import type {
  Listing,
  Category,
  OfficialDocument,
  NewsItem,
  TenderItem,
  ContactSubmission,
  ListingRequest,
  Vacancy,
  VacancyApplication,
  AdminUser,
} from '../types';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export async function login(email: string, password: string) {
  const { data } = await api.post<{ token: string; admin: AdminUser }>('/auth/login', {
    email,
    password,
  });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get<AdminUser>('/auth/me');
  return data;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export const categoriesApi = {
  list: () => api.get<Category[]>('/categories').then((r) => r.data),
  create: (payload: Partial<Category>) => api.post<Category>('/categories', payload).then((r) => r.data),
  update: (id: string, payload: Partial<Category>) =>
    api.put<Category>(`/categories/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete(`/categories/${id}`).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------
export interface PaginatedListings {
  items: Listing[];
  total: number;
  page: number;
  pages: number;
}

export const listingsApi = {
  listAll: (page = 1, limit = 15) =>
    api
      .get<PaginatedListings>('/listings/admin/all', { params: { page, limit } })
      .then((r) => r.data),
  getById: (id: string) => api.get<Listing>(`/listings/${id}`).then((r) => r.data),
  create: (payload: Partial<Listing>) => api.post<Listing>('/listings', payload).then((r) => r.data),
  update: (id: string, payload: Partial<Listing>) =>
    api.put<Listing>(`/listings/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete(`/listings/${id}`).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------
export const documentsApi = {
  list: () => api.get<OfficialDocument[]>('/documents').then((r) => r.data),
  create: (payload: Partial<OfficialDocument>) =>
    api.post<OfficialDocument>('/documents', payload).then((r) => r.data),
  update: (id: string, payload: Partial<OfficialDocument>) =>
    api.put<OfficialDocument>(`/documents/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete(`/documents/${id}`).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// News
// ---------------------------------------------------------------------------
export const newsApi = {
  list: () => api.get<NewsItem[]>('/news?all=true').then((r) => r.data),
  create: (payload: Partial<NewsItem>) => api.post<NewsItem>('/news', payload).then((r) => r.data),
  update: (id: string, payload: Partial<NewsItem>) =>
    api.put<NewsItem>(`/news/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete(`/news/${id}`).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Tenders
// ---------------------------------------------------------------------------
export const tendersApi = {
  list: () => api.get<TenderItem[]>('/tenders').then((r) => r.data),
  create: (payload: Partial<TenderItem>) => api.post<TenderItem>('/tenders', payload).then((r) => r.data),
  update: (id: string, payload: Partial<TenderItem>) =>
    api.put<TenderItem>(`/tenders/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete(`/tenders/${id}`).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Vacancies
// ---------------------------------------------------------------------------
export const vacanciesApi = {
  list: () => api.get<Vacancy[]>('/vacancies?all=true').then((r) => r.data),
  create: (payload: Partial<Vacancy>) => api.post<Vacancy>('/vacancies', payload).then((r) => r.data),
  update: (id: string, payload: Partial<Vacancy>) =>
    api.put<Vacancy>(`/vacancies/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete(`/vacancies/${id}`).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Contact submissions & listing requests
// ---------------------------------------------------------------------------
export const contactApi = {
  list: () => api.get<ContactSubmission[]>('/forms/contact').then((r) => r.data),
  setResolved: (id: string, isResolved: boolean) =>
    api.patch(`/forms/contact/${id}`, { isResolved }).then((r) => r.data),
  remove: (id: string) => api.delete(`/forms/contact/${id}`).then((r) => r.data),
};

export const listingRequestsApi = {
  list: () => api.get<ListingRequest[]>('/forms/listing-requests').then((r) => r.data),
  setResolved: (id: string, isResolved: boolean) =>
    api.patch(`/forms/listing-requests/${id}`, { isResolved }).then((r) => r.data),
  remove: (id: string) => api.delete(`/forms/listing-requests/${id}`).then((r) => r.data),
};

export const vacancyApplicationsApi = {
  list: () => api.get<VacancyApplication[]>('/forms/vacancy-applications').then((r) => r.data),
  setResolved: (id: string, isResolved: boolean) =>
    api.patch(`/forms/vacancy-applications/${id}`, { isResolved }).then((r) => r.data),
  remove: (id: string) => api.delete(`/forms/vacancy-applications/${id}`).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Uploads
// ---------------------------------------------------------------------------
export const uploadApi = {
  image: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<{ url: string }>('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url;
  },
  images: async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    const { data } = await api.post<{ urls: string[] }>('/uploads/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.urls;
  },
  document: async (file: File): Promise<{ url: string; fileSize: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<{ url: string; fileSize: string }>('/uploads/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
