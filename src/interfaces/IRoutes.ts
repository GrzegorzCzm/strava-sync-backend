export interface Range {
  from: number;
  to: number;
}

export interface ParsedActivityQuery {
  date?: Range;
  movingTime?: Range;
  distance?: Range;
  athlete?: string[];
  name?: string[];
  type?: string[];
}

export interface ParsedQuery {
  [fieldName: string]: Range | string[] | string;
}
