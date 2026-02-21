export type BlessStatus = 'Prayer' | 'Listen' | 'Eat' | 'Serve' | 'Story';

export interface Interaction {
  id: string;
  type: 'status_change' | 'note' | 'prayer_point' | 'creation';
  content?: string; // For notes or prayer points
  status?: BlessStatus; // For status changes
  timestamp: string; // ISO date
}

export interface Resident {
  id: string;
  coordinate: [number, number]; // [lng, lat]
  address: string;
  residentName: string;
  currentBlessStatus: BlessStatus;
  prayerRequests?: string; // Persistent prayer list
  interactions: Interaction[]; // History trail
  lastInteraction: string; // ISO date
}
