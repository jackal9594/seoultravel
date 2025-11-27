
export interface Destination {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rating: number;
  tags: string[];
  googleMapLink?: string;
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  isThinking?: boolean;
}

export type ViewState = 'itinerary' | 'cafes' | 'architecture' | 'info' | 'details';

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}
