interface Range {
  from?: number;
  to?: number;
}

export interface ParsedActivityQuery {
  dateRange?: Range;
  movingTimeRange?: Range;
  distanceRange?: Range;
  athletes?: string[];
  names?: string[];
  types?: string[];
}
