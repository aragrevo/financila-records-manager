import { summaryData, type SummaryData } from '../data/summary';

export class SummaryService {
  async getSummary(): Promise<SummaryData> {
    return summaryData;
  }

  async getCategories() {
    return summaryData.categories;
  }

  async getMonthlyTrend() {
    return summaryData.monthlyTrend;
  }
}

export const summaryService = new SummaryService();
