import { create } from 'zustand';

interface RoomDimensions {
  width: number;
  length: number;
  height: number;
  seats: number;
  tableSize: number;
  tableOffset: number;
  tableType: string;
  unitSystem: 'metric' | 'imperial';
}

interface Product {
  id: number;
  category: string;
  model_name: string;
  brand: string;
  base_price: number;
}

interface LeadInfo {
  name: string;
  email: string;
  phone: string;
  useCase?: string;
  companyName?: string;
}

interface RoomConfigState {
  step: number;
  subStep: number;
  userRole: 'customer' | 'partner' | null;
  leadInfo: LeadInfo;
  region: string;
  country: string;
  state: string;
  city: string;
  industry: string;
  platform: 'teams' | 'delta-os' | null;
  productForm: 'windows' | 'android' | null;
  warranty: string | null;
  pivot: string | null;
  selectedDisplay: string | null;
  roomType: {
    id: number | null;
    name: string;
    slug: string;
  };
  dimensions: RoomDimensions;
  recommendedProducts: Product[];
  selectedProducts: Product[];
  
  // Actions
  setStep: (step: number) => void;
  setSubStep: (subStep: number) => void;
  setWarranty: (warranty: string | null) => void;
  setPivot: (pivot: string | null) => void;
  setSelectedDisplay: (display: string | null) => void;
  setUserRole: (role: 'customer' | 'partner') => void;
  setLeadInfo: (info: Partial<LeadInfo>) => void;
  setRegionInfo: (region: string, country: string, state: string, city: string, industry: string) => void;
  setPlatform: (platform: 'teams' | 'delta-os') => void;
  setProductForm: (form: 'windows' | 'android') => void;
  setRoomType: (type: { id: number; name: string; slug: string }) => void;
  updateDimensions: (dimensions: Partial<RoomDimensions>) => void;
  setRecommendedProducts: (products: Product[]) => void;
  toggleProduct: (product: Product) => void;
  resetConfig: () => void;
}

export const useRoomConfigStore = create<RoomConfigState>((set) => ({
  step: 1, // Start at 1 for the first wizard step
  subStep: 1,
  userRole: null,
  leadInfo: {
    name: '',
    email: '',
    phone: '',
    useCase: '',
    companyName: '',
  },
  region: '',
  country: '',
  state: '',
  city: '',
  industry: '',
  platform: null,
  productForm: null,
  warranty: null,
  pivot: null,
  selectedDisplay: null,
  roomType: { id: null, name: '', slug: '' },
  dimensions: {
    width: 8,
    length: 6,
    height: 2.8,
    seats: 8,
    tableSize: 1,
    tableOffset: 0,
    tableType: 'rectangular',
    unitSystem: 'metric',
  },
  recommendedProducts: [],
  selectedProducts: [],

  setStep: (step) => set({ step }),
  setSubStep: (subStep) => set({ subStep }),
  setWarranty: (warranty) => set({ warranty }),
  setPivot: (pivot) => set({ pivot }),
  setSelectedDisplay: (selectedDisplay) => set({ selectedDisplay }),
  
  setUserRole: (role) => set({ userRole: role }),

  setLeadInfo: (info) => set((state) => ({
    leadInfo: { ...state.leadInfo, ...info }
  })),

  setRegionInfo: (region, country, state, city, industry) => 
    set({ region, country, state, city, industry }),

  setPlatform: (platform) => set({ platform }),

  setProductForm: (productForm) => set({ productForm }),
    
  setRoomType: (type) => set((state) => {
    let newDims = { ...state.dimensions, tableOffset: 0 };
    
    // Auto-configure optimal space and table type based on user room choice
    if (type.slug === 'focus-room') {
      newDims = { 
        ...newDims, 
        width: 3.0, 
        length: 4.0, 
        seats: 4, 
        tableSize: 0.8, 
        tableType: 'half' 
      };
    } else if (type.slug === 'small-room') {
      newDims = { 
        ...newDims, 
        width: 4.5, 
        length: 5.5, 
        seats: 6, 
        tableSize: 1.2, 
        tableType: 'round' 
      };
    } else if (type.slug === 'medium-room') {
      newDims = { 
        ...newDims, 
        width: 6.0, 
        length: 7.5, 
        seats: 10, 
        tableSize: 2.0, 
        tableType: 'rectangular' 
      };
    }
    
    return { roomType: type, dimensions: newDims };
  }),
  
  updateDimensions: (newDims) => set((state) => {
    let nextDims = { ...state.dimensions, ...newDims };
    
    // --- Smart Physics Engine Constants ---
    const TABLE_BASE_LENGTH = 2.11;
    const CLEARANCE = 1.8; // Total clearance needed
    
    // 1. If Room Length changes, auto-scale the table to fit comfortably
    if (newDims.length !== undefined) {
      const optimalTableSize = Math.max(0.5, (nextDims.length - CLEARANCE) / TABLE_BASE_LENGTH);
      nextDims.tableSize = optimalTableSize;
      nextDims.tableOffset = 0; // Re-center table when room size changes
    }
    
    // 2. Constrain Table Size so it never exceeds room bounds minus clearance
    if (newDims.tableSize !== undefined || newDims.length !== undefined) {
      const maxTableSize = Math.max(0.5, (nextDims.length - CLEARANCE) / TABLE_BASE_LENGTH);
      if (nextDims.tableSize > maxTableSize) {
        nextDims.tableSize = maxTableSize;
      }
    }

    // 3. Constrain Table Offset so it never hits the walls
    const actualTableLength = TABLE_BASE_LENGTH * nextDims.tableSize;
    const maxOffset = Math.max(0, (nextDims.length / 2) - (actualTableLength / 2) - (CLEARANCE / 2));
    
    if (nextDims.tableOffset > maxOffset) nextDims.tableOffset = maxOffset;
    if (nextDims.tableOffset < -maxOffset) nextDims.tableOffset = -maxOffset;

    return { dimensions: nextDims };
  }),
  
  setRecommendedProducts: (products) => set({ recommendedProducts: products, selectedProducts: products }),
  
  toggleProduct: (product) => set((state) => {
    const exists = state.selectedProducts.find(p => p.id === product.id);
    if (exists) {
      return { selectedProducts: state.selectedProducts.filter(p => p.id !== product.id) };
    } else {
      return { selectedProducts: [...state.selectedProducts, product] };
    }
  }),
  
  resetConfig: () => set({
    step: 1,
    subStep: 1,
    userRole: null,
    leadInfo: {
      name: '',
      email: '',
      phone: '',
      useCase: '',
      companyName: '',
    },
    region: '',
    country: '',
    state: '',
    city: '',
    industry: '',
    platform: null,
    productForm: null,
    warranty: null,
    pivot: null,
    selectedDisplay: null,
    roomType: { id: null, name: '', slug: '' },
    dimensions: {
      width: 6,
      length: 6,
      height: 2.8,
      seats: 8,
      tableSize: 1,
      tableOffset: 0,
      tableType: 'rectangular',
      unitSystem: 'metric',
    },
    recommendedProducts: [],
    selectedProducts: [],
  }),
}));
