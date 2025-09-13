// 모니터링 관련 타입 정의

// AnalyticsCard 타입
export interface AnalyticsData {
  success?: boolean;
  error?: string;
  message?: string;
  details?: string;
  visitors: number;
  pageviews: number;
  sessions?: number;
  newUsers?: number;
  bounceRate?: number;
  avgDuration?: number;
}

// ErrorLogsCard 타입
export interface ErrorLog {
  timestamp: string;
  level: string;
  message: string;
}

// SystemStatusCard 타입
export interface SystemStatusData {
  timestamp: string;
  health: {
    status: string;
    timestamp: string;
    uptime: number;
    responseTime: string;
    version: string;
    performance: {
      totalResponseTime: string;
      databaseResponseTime: string;
      cpu: {
        user: number;
        system: number;
        total: number;
      };
    };
    system: {
      farmCount: number;
      visitorCount: number;
      memory: {
        used: number;
        total: number;
        external: number;
        status: string;
      };
      cpu: {
        user: number;
        system: number;
        total: number;
        threshold: number;
        status: string;
      };
      nodeVersion: string;
      platform: string;
      arch: string;
      techStack?: {
        framework?: string;
        runtime?: string;
        react?: string;
        typescript?: string;
        database?: string;
        authentication?: string;
        deployment?: string;
        ui?: string;
        state?: string;
        pwa?: string;
        pushNotifications?: string;
        monitoring?: string;
        analytics?: string;
      };
    };
    services: {
      database: string;
      api: string;
      memory: string;
    };
  };
}

// TechStackCard 타입
export interface TechStackData {
  framework?: string;
  runtime?: string;
  react?: string;
  typescript?: string;
  database?: string;
  authentication?: string;
  deployment?: string;
  ui?: string;
  state?: string;
  pwa?: string;
  pushNotifications?: string;
  monitoring?: string;
  analytics?: string;
}

// UptimeCard 타입
export interface UptimeData {
  monitors?: Array<{
    id: number;
    friendly_name: string;
    status: number;
    all_time_uptime_ratio: number;
    custom_uptime_ratio?: number;
    url?: string;
    interval?: number;
    type?: number;
    port?: string;
    create_datetime?: number;
  }>;
  success?: boolean;
  error?: string;
  message?: string;
  details?: string;
}
