// Filtros para el endpoint
export interface ICampaignDispatchFilter {
  // Paginación
  page?: number;
  limit?: number;
  // Filtros de búsqueda
  search?: string;
  // Filtros por fechas
  startDate?: string; // ISO date string
  endDate?: string;   // ISO date string
  // Filtros por campaña
  campaignId?: string;
  // Ordenamiento
  sortBy?: 'createdAt' | 'updatedAt' | 'scheduledAt' | 'sentAt' | 'deliveredAt';
  sortOrder?: 'asc' | 'desc';
}
