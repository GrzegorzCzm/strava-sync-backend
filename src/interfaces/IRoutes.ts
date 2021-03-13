export interface Range {
  from: string;
  to: string;
}

export interface ParsedActivityQuery {
  date?: { type: string; data: Range };
  movingTime?: { type: string; data: Range };
  distance?: { type: string; data: Range };
  athlete?: { type: string; data: string[] };
  name?: { type: string; data: string[] };
  type?: { type: string; data: string[] };
}

export interface ParsedQuery {
  [fieldName: string]: { type: string; data: Range | string[] | string };
}
