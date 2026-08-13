import { create } from 'zustand';
import { officeConfig, RoomConfig } from '@/data/officeConfig';

interface ExperienceState {
  // Navigation State
  activeRoom: string;
  selectedRoom: string | null;
  viewMode: 'guided' | 'walkthrough';
  isWalking: boolean;
  
  // Camera/Tour State
  cameraTarget: [number, number, number];
  cameraPosition: [number, number, number];
  tourRunning: boolean;
  
  // UI State
  showMap: boolean;
  
  // Actions
  setActiveRoom: (id: string) => void;
  setSelectedRoom: (id: string | null) => void;
  setViewMode: (mode: 'guided' | 'walkthrough') => void;
  setWalking: (isWalking: boolean) => void;
  navigateToRoom: (id: string) => void;
  startTour: () => void;
  stopTour: () => void;
  toggleMap: () => void;
  updateCamera: (pos: [number, number, number], lookAt: [number, number, number]) => void;
}

export const useExperienceStore = create<ExperienceState>((set, get) => ({
  activeRoom: 'lobby',
  selectedRoom: null,
  viewMode: 'guided',
  isWalking: false,
  
  cameraTarget: officeConfig[0].lookAt,
  cameraPosition: officeConfig[0].cameraPosition,
  tourRunning: false,
  
  showMap: true,
  
  setActiveRoom: (id) => set({ activeRoom: id }),
  
  setSelectedRoom: (id) => set({ selectedRoom: id }),
  
  setViewMode: (mode) => set({ 
    viewMode: mode,
    isWalking: mode === 'walkthrough' 
  }),
  
  setWalking: (isWalking) => set({ isWalking }),
  
  navigateToRoom: (id) => {
    const room = officeConfig.find(r => r.id === id);
    if (room) {
      set({ 
        activeRoom: id, 
        selectedRoom: id,
        cameraTarget: room.lookAt,
        cameraPosition: room.cameraPosition,
        viewMode: 'guided',
        isWalking: false
      });
    }
  },
  
  startTour: () => set({ tourRunning: true }),
  
  stopTour: () => set({ tourRunning: false }),
  
  toggleMap: () => set((state) => ({ showMap: !state.showMap })),
  
  updateCamera: (pos, lookAt) => set({ 
    cameraPosition: pos, 
    cameraTarget: lookAt 
  }),
}));
