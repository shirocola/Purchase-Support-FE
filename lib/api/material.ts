import { 
  Material, 
  MaterialListParams, 
  MaterialListResponse, 
  MaterialUpdateData,
  MaterialFilter,
} from '@/lib/types/po';

// Mock Material Data
const mockMaterials: Material[] = [
  {
    id: 'mat-001',
    materialCode: 'MAT-2024-001',
    materialName: 'Advanced Chemical Compound X',
    category: 'Chemical',
    description: 'High-grade chemical compound for specialized applications',
    isConfidential: true,
    aliasName: 'Green Material A',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
    createdBy: 'system',
    updatedBy: 'user-mc-001',
  },
  {
    id: 'mat-002',
    materialCode: 'MAT-2024-002',
    materialName: 'Standard Steel Rod 10mm',
    category: 'Metal',
    description: 'Standard construction steel rod',
    isConfidential: false,
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-10T09:15:00Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'mat-003',
    materialCode: 'MAT-2024-003',
    materialName: 'Military Grade Composite',
    category: 'Composite',
    description: 'Confidential composite material for defense applications',
    isConfidential: true,
    aliasName: 'Blue Material B',
    createdAt: '2024-01-12T14:20:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    createdBy: 'system',
    updatedBy: 'user-mc-001',
  },
  {
    id: 'mat-004',
    materialCode: 'MAT-2024-004',
    materialName: 'Plastic Container 500ml',
    category: 'Plastic',
    description: 'Standard plastic container for general use',
    isConfidential: false,
    createdAt: '2024-01-08T11:30:00Z',
    updatedAt: '2024-01-08T11:30:00Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'mat-005',
    materialCode: 'MAT-2024-005',
    materialName: 'Encrypted Processing Unit',
    category: 'Electronic',
    description: 'Confidential electronic component with encryption capabilities',
    isConfidential: true,
    aliasName: 'Red Component C',
    createdAt: '2024-01-05T13:45:00Z',
    updatedAt: '2024-01-22T08:15:00Z',
    createdBy: 'system',
    updatedBy: 'user-mc-002',
  },
  {
    id: 'mat-006',
    materialCode: 'MAT-2024-006',
    materialName: 'Standard Aluminum Sheet',
    category: 'Metal',
    description: 'Standard aluminum sheet for construction',
    isConfidential: false,
    createdAt: '2024-01-03T10:00:00Z',
    updatedAt: '2024-01-03T10:00:00Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
];

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MaterialService {
  static async getMaterials(params: MaterialListParams = {}): Promise<MaterialListResponse> {
    await delay(500); // Simulate API delay

    const {
      page = 1,
      limit = 10,
      filter = {},
      sort = { sortBy: 'materialCode', sortOrder: 'asc' }
    } = params;

    // Apply filters
    let filteredMaterials = [...mockMaterials];

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filteredMaterials = filteredMaterials.filter(material =>
        material.materialCode.toLowerCase().includes(searchLower) ||
        material.materialName.toLowerCase().includes(searchLower) ||
        material.category.toLowerCase().includes(searchLower) ||
        (material.aliasName && material.aliasName.toLowerCase().includes(searchLower))
      );
    }

    if (filter.category) {
      filteredMaterials = filteredMaterials.filter(material =>
        material.category === filter.category
      );
    }

    if (filter.isConfidential !== undefined) {
      filteredMaterials = filteredMaterials.filter(material =>
        material.isConfidential === filter.isConfidential
      );
    }

    if (filter.hasAlias !== undefined) {
      filteredMaterials = filteredMaterials.filter(material =>
        filter.hasAlias ? !!material.aliasName : !material.aliasName
      );
    }

    // Apply sorting
    filteredMaterials.sort((a, b) => {
      const aValue = a[sort.sortBy] || '';
      const bValue = b[sort.sortBy] || '';
      
      if (sort.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMaterials = filteredMaterials.slice(startIndex, endIndex);

    return {
      items: paginatedMaterials,
      total: filteredMaterials.length,
      page,
      limit,
      totalPages: Math.ceil(filteredMaterials.length / limit),
    };
  }

  static async getMaterial(id: string): Promise<Material | null> {
    await delay(300);
    return mockMaterials.find(material => material.id === id) || null;
  }

  static async updateMaterial(id: string, data: MaterialUpdateData): Promise<Material> {
    await delay(500);
    
    const materialIndex = mockMaterials.findIndex(material => material.id === id);
    if (materialIndex === -1) {
      throw new Error('Material not found');
    }

    const updatedMaterial = {
      ...mockMaterials[materialIndex],
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: 'user-mc-001', // Mock user
    };

    mockMaterials[materialIndex] = updatedMaterial;
    return updatedMaterial;
  }

  static async getCategories(): Promise<string[]> {
    await delay(200);
    const categories = Array.from(new Set(mockMaterials.map(m => m.category)));
    return categories.sort();
  }

  // Search materials for autocomplete
  static async searchMaterials(query: string, limit: number = 10): Promise<Material[]> {
    await delay(300);
    
    if (!query || query.length < 2) {
      return [];
    }

    const searchLower = query.toLowerCase();
    const results = mockMaterials.filter(material =>
      material.materialCode.toLowerCase().includes(searchLower) ||
      material.materialName.toLowerCase().includes(searchLower)
    );

    return results.slice(0, limit);
  }
}
