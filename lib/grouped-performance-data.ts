export type GroupedPerformanceRow = {
  practiceName: string;
  qualityMeasureId: string;
  performanceRate: number;
};

export const GROUPED_PERFORMANCE_ROWS: GroupedPerformanceRow[] = [
  { practiceName: "Spokane Valley ENT", qualityMeasureId: "Quality ID #047", performanceRate: 90.17 },
  { practiceName: "Spokane Valley ENT", qualityMeasureId: "Quality ID #093", performanceRate: 98.65 },
  { practiceName: "Spokane Valley ENT", qualityMeasureId: "Quality ID #128", performanceRate: 92.11 },
  { practiceName: "Spokane Valley ENT", qualityMeasureId: "Quality ID #130", performanceRate: 100.0 },
  { practiceName: "Spokane Valley ENT", qualityMeasureId: "Quality ID #238", performanceRate: 4.17 },
  { practiceName: "Spokane Valley ENT", qualityMeasureId: "Quality ID #331", performanceRate: 94.32 },
  { practiceName: "Spokane Valley ENT", qualityMeasureId: "Quality ID #358", performanceRate: 100.0 },
];
