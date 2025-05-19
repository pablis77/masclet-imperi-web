import { Toaster, toast } from 'react-hot-toast';

interface ApiResponse {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  data?: any;
  duration: number;
  position: string;
}

const handleApiResponse = (response: ApiResponse) => {
  toast[response.type](response.message, {
    duration: response.duration,
    position: 'bottom-center',
  });
};

export const showMessage = (
  message: string, 
  type: 'success' | 'error' | 'info' = 'info',
  duration: number = 3000
) => {
  toast[type](message, {
    duration,
    position: 'bottom-center',
  });
};