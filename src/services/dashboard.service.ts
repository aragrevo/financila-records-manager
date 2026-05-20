import { dashboardData } from '../data/dashboard';

export class DashboardService {
  async getFullDashboard() {
    return dashboardData;
  }

  async getSummaryCards() {
    return dashboardData.summaryCards;
  }

  async getChartEntities() {
    return dashboardData.chartEntities;
  }

  async getRecentMovements() {
    return dashboardData.recentMovements;
  }

  async getFundStatus() {
    return dashboardData.fundStatus;
  }

  async getEntitySummary() {
    return dashboardData.entitySummary;
  }

  async getEntitySummaryFooter() {
    return dashboardData.entitySummaryFooter;
  }

  async getDistributionFunds() {
    return dashboardData.distributionFunds;
  }

  async getAccountCards() {
    return dashboardData.accountCards;
  }

  async getRecentTransactions() {
    return dashboardData.recentTransactions;
  }

  async getMovements() {
    return dashboardData.movements;
  }

  async getMovementAccounts() {
    return dashboardData.movementAccounts;
  }

  async getMovementTypes() {
    return dashboardData.movementTypes;
  }
}

export const dashboardService = new DashboardService();
