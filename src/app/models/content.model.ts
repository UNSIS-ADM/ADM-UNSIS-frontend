
export interface ContentPartDTO {
  id?: number;
  partKey: string;
  title?: string;
  htmlContent: string;
  orderIndex?: number;
}

export interface ContentDTO {
  id?: number;
  keyName: string;
  title?: string;
  language?: string;
  active?: boolean;
  parts?: ContentPartDTO[];
}



