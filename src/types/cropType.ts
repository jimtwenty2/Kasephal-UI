export interface Crop {
  cropId: string;
  cropName: string;
  cropTypeId: string;
  cropTypeName?: string;
}

export interface CropType {
  cropTypeId: string;
  typeName: string;
  createdBy?: string;
  crops: Crop[];
}

export interface CropTypeResponse {
  status: number;
  message: string;
  payload: CropType[];
  success: boolean;
  timestamp: string;
}

export interface CropResponse {
  status: number;
  message: string;
  payload: Crop[];
  success: boolean;
  timestamp: string;
}