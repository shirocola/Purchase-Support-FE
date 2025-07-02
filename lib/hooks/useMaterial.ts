import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialService } from '@/lib/api/material';
import { 
  Material, 
  MaterialListParams, 
  MaterialListResponse, 
  MaterialUpdateData 
} from '@/lib/types/po';

// Material list hook
export function useMaterialList(params: MaterialListParams = {}) {
  return useQuery<MaterialListResponse, Error>({
    queryKey: ['materials', params],
    queryFn: () => MaterialService.getMaterials(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Single material hook
export function useMaterial(id: string) {
  return useQuery<Material | null, Error>({
    queryKey: ['material', id],
    queryFn: () => MaterialService.getMaterial(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Material categories hook
export function useMaterialCategories() {
  return useQuery<string[], Error>({
    queryKey: ['material-categories'],
    queryFn: () => MaterialService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Material search hook for autocomplete
export function useMaterialSearch(query: string, limit: number = 10) {
  return useQuery<Material[], Error>({
    queryKey: ['material-search', query, limit],
    queryFn: () => MaterialService.searchMaterials(query, limit),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Update material mutation
export function useUpdateMaterial() {
  const queryClient = useQueryClient();

  return useMutation<Material, Error, { id: string; data: MaterialUpdateData }>({
    mutationFn: ({ id, data }) => MaterialService.updateMaterial(id, data),
    onSuccess: (updatedMaterial, { id }) => {
      // Update the material in cache
      queryClient.setQueryData(['material', id], updatedMaterial);
      
      // Invalidate material list to refetch
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
}
