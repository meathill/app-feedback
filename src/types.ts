export type FeedbackStatus = 'pending' | 'processed' | 'archived' | 'deleted';

export interface Feedback {
  id: number;
  appId: string;
  version?: string;
  content: string;
  contentEn?: string | null;
  contact?: string;
  deviceInfo?: object;
  location?: object;
  status: FeedbackStatus;
  notes?: string | null;
  tags: string[];
  createdAt: number;
}

export interface FeedbackSubmission {
  appId: string;
  version?: string;
  content: string;
  contact?: string;
  deviceInfo?: object;
  location?: object;
  tags?: string[];
}
