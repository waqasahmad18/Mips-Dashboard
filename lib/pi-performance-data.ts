export type PiPerformanceRow = {
  practiceName: string;
  providerName: string;
  objectiveName: string;
  qualityMeasureId: string;
  performanceRate: number;
};

export const PI_PERFORMANCE_ROWS: PiPerformanceRow[] = [
  { practiceName: "Spokane Valley ENT", providerName: "Eric Leavitt", objectiveName: "Electronic Prescribing", qualityMeasureId: "QID#331", performanceRate: 92.6 },
  { practiceName: "Spokane Valley ENT", providerName: "Eric Leavitt", objectiveName: "Health Information Exchange", qualityMeasureId: "QID#130", performanceRate: 89.2 },
  { practiceName: "Spokane Valley ENT", providerName: "Eric Leavitt", objectiveName: "Provider To Patient Exchange", qualityMeasureId: "QID#128", performanceRate: 91.4 },
  { practiceName: "Spokane Valley ENT", providerName: "Eric Leavitt", objectiveName: "Public Health And Clinical Data Exchange", qualityMeasureId: "QID#047", performanceRate: 87.9 },
  { practiceName: "Spokane Valley ENT", providerName: "Geoffrey Julian", objectiveName: "Electronic Prescribing", qualityMeasureId: "QID#331", performanceRate: 90.7 },
  { practiceName: "Spokane Valley ENT", providerName: "Geoffrey Julian", objectiveName: "Health Information Exchange", qualityMeasureId: "QID#130", performanceRate: 86.8 },
  { practiceName: "Spokane Valley ENT", providerName: "Geoffrey Julian", objectiveName: "Provider To Patient Exchange", qualityMeasureId: "QID#128", performanceRate: 89.5 },
  { practiceName: "Spokane Valley ENT", providerName: "Geoffrey Julian", objectiveName: "Public Health And Clinical Data Exchange", qualityMeasureId: "QID#047", performanceRate: 85.9 },
  { practiceName: "Spokane Valley ENT", providerName: "Jeffrey Falco", objectiveName: "Electronic Prescribing", qualityMeasureId: "QID#331", performanceRate: 94.1 },
  { practiceName: "Spokane Valley ENT", providerName: "Jeffrey Falco", objectiveName: "Health Information Exchange", qualityMeasureId: "QID#130", performanceRate: 90.5 },
  { practiceName: "Spokane Valley ENT", providerName: "Jeffrey Falco", objectiveName: "Provider To Patient Exchange", qualityMeasureId: "QID#128", performanceRate: 93.3 },
  { practiceName: "Spokane Valley ENT", providerName: "Jeffrey Falco", objectiveName: "Public Health And Clinical Data Exchange", qualityMeasureId: "QID#047", performanceRate: 88.4 },
];
