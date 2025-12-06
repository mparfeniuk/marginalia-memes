export interface PremadeImage {
  id: string;
  name: string;
  path: string;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface MemeData {
  imageUrl?: string;
  texts: Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    style: TextStyle;
  }>;
}

export interface MemeSaveRequest {
  memeData: MemeData;
  imageData: string; // base64 encoded image
}
