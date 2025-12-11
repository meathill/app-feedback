export interface Feedback {
  id: number;
  appId: string;
  version?: string;
  content: string;
  contact?: string;
  deviceInfo?: object;
  location?: object;
  status: 'pending' | 'processed';
  createdAt: number;
}

export interface FeedbackSubmission {
  appId: string;
  version?: string;
  content: string;
  contact?: string;
  deviceInfo?: object;
  location?: object;
}
