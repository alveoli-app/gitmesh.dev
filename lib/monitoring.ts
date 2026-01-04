/**
 * Application monitoring and health check utilities
 */

import { logError, logInfo, logWarn } from './error-handling'
import { createGitHubClient } from './github-client'
import { getEmailService } from './email-service'

export interface HealthCheck {
  name: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  message?: string
  responseTime?: number
  lastChecked: Date
  details?: Record<string, any>
}

export interface SystemHealth {
  overall: 'healthy' | 'unhealthy' | 'degraded'
  checks: HealthCheck[]
  timestamp: Date
  uptime: number
  version: string
  environment: string
}

export interface PerformanceMetrics {
  requestCount: number
  averageResponseTime: number
  errorRate: number
  lastReset: Date
  endpoints: Record<string, {
    count: number
    totalTime: number
    errors: number
  }>
}

/**
 * Health check implementations
 */
class HealthChecker {
  private metrics: PerformanceMetrics = {
    requestCount: 0,
    averageResponseTime: 0,
    errorRate: 0,
    lastReset: new Date(),
    endpoints: {}
  }

  /**
   * Check GitHub API connectivity
   */
  async checkGitHub(): Promise<HealthCheck> {
    const startTime = Date.now()
    
    try {
      const client = createGitHubClient()
      const result = await client.testConnection()
      const responseTime = Date.now() - startTime

      return {
        name: 'GitHub API',
        status: result.success ? 'healthy' : 'unhealthy',
        message: result.success ? 'Connected successfully' : result.error,
        responseTime,
        lastChecked: new Date(),
        details: {
          token: process.env.GITHUB_TOKEN ? 'configured' : 'missing',
          repo: process.env.GITHUB_REPO || 'not configured'
        }
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      
      return {
        name: 'GitHub API',
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
        lastChecked: new Date(),
        details: {
          error: error instanceof Error ? error.stack : String(error)
        }
      }
    }
  }

  /**
   * Check email service connectivity
   */
  async checkEmailService(): Promise<HealthCheck> {
    const startTime = Date.now()
    
    try {
      const emailService = getEmailService()
      
      // For now, just check if the service can be instantiated
      // In a real implementation, you might send a test email to a known address
      const responseTime = Date.now() - startTime

      return {
        name: 'Email Service',
        status: 'healthy',
        message: 'Service initialized successfully',
        responseTime,
        lastChecked: new Date(),
        details: {
          provider: process.env.EMAIL_PROVIDER || 'sendgrid',
          fromEmail: process.env.FROM_EMAIL || 'not configured'
        }
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      
      return {
        name: 'Email Service',
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
        lastChecked: new Date(),
        details: {
          error: error instanceof Error ? error.stack : String(error)
        }
      }
    }
  }

  /**
   * Check file system access
   */
  async checkFileSystem(): Promise<HealthCheck> {
    const startTime = Date.now()
    
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      const os = await import('os')
      
      // Check if we can read/write to the data directory
      const tempDir = os.tmpdir()
      const testFile = path.join(tempDir, '.health-check')
      
      // Try to write a test file
      await fs.writeFile(testFile, JSON.stringify({ timestamp: new Date() }))
      
      // Try to read it back
      const content = await fs.readFile(testFile, 'utf-8')
      JSON.parse(content)
      
      // Clean up
      await fs.unlink(testFile).catch(() => {}) // Ignore cleanup errors
      
      const responseTime = Date.now() - startTime

      return {
        name: 'File System',
        status: 'healthy',
        message: 'Read/write operations successful',
        responseTime,
        lastChecked: new Date()
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      
      return {
        name: 'File System',
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
        lastChecked: new Date(),
        details: {
          error: error instanceof Error ? error.stack : String(error)
        }
      }
    }
  }

  /**
   * Check environment configuration
   */
  async checkEnvironment(): Promise<HealthCheck> {
    const startTime = Date.now()
    
    const requiredEnvVars = [
      'NEXTAUTH_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GITMESH_CE_ADMIN_EMAILS'
    ]

    const optionalEnvVars = [
      'GITHUB_TOKEN',
      'GITHUB_REPO',
      'SENDGRID_API_KEY',
      'FROM_EMAIL'
    ]

    const missing = requiredEnvVars.filter(key => !process.env[key])
    const optional = optionalEnvVars.filter(key => !process.env[key])
    
    const responseTime = Date.now() - startTime
    
    let status: HealthCheck['status'] = 'healthy'
    let message = 'All required environment variables configured'
    
    if (missing.length > 0) {
      status = 'unhealthy'
      message = `Missing required environment variables: ${missing.join(', ')}`
    } else if (optional.length > 0) {
      status = 'degraded'
      message = `Missing optional environment variables: ${optional.join(', ')}`
    }

    return {
      name: 'Environment',
      status,
      message,
      responseTime,
      lastChecked: new Date(),
      details: {
        required: requiredEnvVars.reduce((acc, key) => {
          acc[key] = process.env[key] ? 'configured' : 'missing'
          return acc
        }, {} as Record<string, string>),
        optional: optionalEnvVars.reduce((acc, key) => {
          acc[key] = process.env[key] ? 'configured' : 'missing'
          return acc
        }, {} as Record<string, string>)
      }
    }
  }

  /**
   * Run all health checks
   */
  async runHealthChecks(): Promise<SystemHealth> {
    const startTime = Date.now()
    
    logInfo('Running system health checks')
    
    try {
      const checks = await Promise.all([
        this.checkEnvironment(),
        this.checkFileSystem(),
        this.checkGitHub(),
        this.checkEmailService()
      ])

      // Determine overall health
      const hasUnhealthy = checks.some(check => check.status === 'unhealthy')
      const hasDegraded = checks.some(check => check.status === 'degraded')
      
      let overall: SystemHealth['overall'] = 'healthy'
      if (hasUnhealthy) {
        overall = 'unhealthy'
      } else if (hasDegraded) {
        overall = 'degraded'
      }

      const health: SystemHealth = {
        overall,
        checks,
        timestamp: new Date(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }

      const duration = Date.now() - startTime
      
      logInfo('Health checks completed', {
        overall,
        duration,
        checksCount: checks.length
      })

      return health
    } catch (error) {
      logError('Health checks failed', error as Error)
      
      return {
        overall: 'unhealthy',
        checks: [{
          name: 'Health Check System',
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Unknown error',
          lastChecked: new Date()
        }],
        timestamp: new Date(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    }
  }

  /**
   * Record API request metrics
   */
  recordRequest(endpoint: string, responseTime: number, isError: boolean = false) {
    this.metrics.requestCount++
    
    if (!this.metrics.endpoints[endpoint]) {
      this.metrics.endpoints[endpoint] = {
        count: 0,
        totalTime: 0,
        errors: 0
      }
    }
    
    const endpointMetrics = this.metrics.endpoints[endpoint]
    endpointMetrics.count++
    endpointMetrics.totalTime += responseTime
    
    if (isError) {
      endpointMetrics.errors++
    }
    
    // Recalculate averages
    this.metrics.averageResponseTime = Object.values(this.metrics.endpoints)
      .reduce((sum, ep) => sum + ep.totalTime, 0) / this.metrics.requestCount
    
    this.metrics.errorRate = Object.values(this.metrics.endpoints)
      .reduce((sum, ep) => sum + ep.errors, 0) / this.metrics.requestCount
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      requestCount: 0,
      averageResponseTime: 0,
      errorRate: 0,
      lastReset: new Date(),
      endpoints: {}
    }
    
    logInfo('Performance metrics reset')
  }
}

// Export singleton instance
export const healthChecker = new HealthChecker()

/**
 * Middleware to record API performance metrics
 */
export function withMetrics<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  endpoint: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now()
    let isError = false
    
    try {
      const result = await handler(...args)
      return result
    } catch (error) {
      isError = true
      throw error
    } finally {
      const responseTime = Date.now() - startTime
      healthChecker.recordRequest(endpoint, responseTime, isError)
    }
  }
}

/**
 * Simple uptime monitor
 */
class UptimeMonitor {
  private startTime = Date.now()
  private checks: Array<{ timestamp: Date; status: boolean }> = []
  private maxChecks = 100 // Keep last 100 checks

  /**
   * Record an uptime check
   */
  recordCheck(isHealthy: boolean) {
    this.checks.push({
      timestamp: new Date(),
      status: isHealthy
    })

    // Keep only the last maxChecks
    if (this.checks.length > this.maxChecks) {
      this.checks = this.checks.slice(-this.maxChecks)
    }
  }

  /**
   * Get uptime statistics
   */
  getStats() {
    const now = Date.now()
    const uptimeMs = now - this.startTime
    
    const recentChecks = this.checks.slice(-20) // Last 20 checks
    const successfulChecks = recentChecks.filter(check => check.status).length
    const availability = recentChecks.length > 0 
      ? (successfulChecks / recentChecks.length) * 100 
      : 100

    return {
      uptime: uptimeMs,
      uptimeFormatted: this.formatUptime(uptimeMs),
      availability: Math.round(availability * 100) / 100,
      totalChecks: this.checks.length,
      recentChecks: recentChecks.length,
      successfulChecks
    }
  }

  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }
}

export const uptimeMonitor = new UptimeMonitor()

/**
 * Scheduled health check runner
 */
export async function runScheduledHealthCheck() {
  try {
    const health = await healthChecker.runHealthChecks()
    const isHealthy = health.overall === 'healthy'
    
    uptimeMonitor.recordCheck(isHealthy)
    
    if (!isHealthy) {
      logWarn('System health check failed', {
        overall: health.overall,
        failedChecks: health.checks
          .filter(check => check.status !== 'healthy')
          .map(check => ({ name: check.name, status: check.status, message: check.message }))
      })
    }
    
    return health
  } catch (error) {
    logError('Scheduled health check failed', error as Error)
    uptimeMonitor.recordCheck(false)
    throw error
  }
}