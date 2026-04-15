export type IaPerformanceRow = {
  practiceName: string;
  providerName: string;
  activityId: string;
  performanceRate: number;
};

export const IA_PERFORMANCE_ROWS: IaPerformanceRow[] = [
  { practiceName: "Spokane Valley ENT", providerName: "Eric Leavitt", activityId: "IA_PM_16", performanceRate: 96.2 },
  { practiceName: "Spokane Valley ENT", providerName: "Eric Leavitt", activityId: "IA_EPA_2", performanceRate: 92.8 },
  { practiceName: "Spokane Valley ENT", providerName: "Eric Leavitt", activityId: "IA_BMH_8", performanceRate: 94.1 },
  { practiceName: "Spokane Valley ENT", providerName: "Geoffrey Julian", activityId: "IA_PM_16", performanceRate: 93.4 },
  { practiceName: "Spokane Valley ENT", providerName: "Geoffrey Julian", activityId: "IA_EPA_2", performanceRate: 90.6 },
  { practiceName: "Spokane Valley ENT", providerName: "Geoffrey Julian", activityId: "IA_BMH_8", performanceRate: 91.7 },
  { practiceName: "Spokane Valley ENT", providerName: "Jeffrey Falco", activityId: "IA_PM_16", performanceRate: 95.1 },
  { practiceName: "Spokane Valley ENT", providerName: "Jeffrey Falco", activityId: "IA_EPA_2", performanceRate: 91.9 },
  { practiceName: "Spokane Valley ENT", providerName: "Jeffrey Falco", activityId: "IA_BMH_8", performanceRate: 93.5 },
];
