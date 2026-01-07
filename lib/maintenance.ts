import { supabase } from '@/lib/supabase'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

/**
 * Utility functions for managing maintenance mode
 */

export interface MaintenanceConfig {
  enabled: boolean
  message: string
  estimatedDuration: string
  contactEmail: string
}

interface CachedConfig extends MaintenanceConfig {
  lastUpdated: number
}

const CACHE_FILE = path.join(os.tmpdir(), 'gitmesh_maintenance_cache.json')
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Checks if the site should redirect to maintenance page.
 * Uses a file-based cache to avoid hitting the DB on every request.
 */
export async function checkMaintenanceRedirection(): Promise<boolean> {
  try {
    // 1. Try to read from cache
    const cacheData = await fs.readFile(CACHE_FILE, 'utf-8').catch(() => null)
    
    if (cacheData) {
      const cached: CachedConfig = JSON.parse(cacheData)
      const now = Date.now()
      
      // If cache is fresh (< 5 mins), use it
      if (now - cached.lastUpdated < CACHE_TTL) {
        return cached.enabled
      }
    }

    // 2. Cache is missing or stale, fetch fresh data
    const config = await getMaintenanceConfig()
    
    // 3. Update cache
    await updateMaintenanceCache(config)

    return config.enabled

  } catch (error) {
    console.error('Error in checkMaintenanceRedirection:', error)
    // Fail safe: If caching fails, check DB directly to be safe.
    return isMaintenanceMode()
  }
}

/**
 * Manually update the cache.
 * Useful when admin updates settings to propagate changes immediately (to this instance).
 */
export async function updateMaintenanceCache(config: MaintenanceConfig): Promise<void> {
  try {
    const newCache: CachedConfig = {
      ...config,
      lastUpdated: Date.now()
    }
    await fs.writeFile(CACHE_FILE, JSON.stringify(newCache))
  } catch (error) {
    console.error('Failed to update maintenance cache:', error)
  }
}

/**
 * Direct check for real-time status (Admin usage)
 */
export async function isMaintenanceMode(): Promise<boolean> {
  const config = await getMaintenanceConfig()
  return config.enabled
}

/**
 * Fetch configuration directly from Supabase (Real-time)
 */
export async function getMaintenanceConfig(): Promise<MaintenanceConfig> {
  const defaults: MaintenanceConfig = {
    enabled: false,
    message: 'We are currently performing scheduled maintenance.',
    estimatedDuration: '1-2 hours',
    contactEmail: 'support@gitmesh.dev'
  }

  try {
    const { data, error } = await supabase
      .from('maintenance_config')
      .select('*')
      .eq('id', 1)
      .single()

    if (error) {
      console.error('Error fetching maintenance config:', error)
      return defaults
    }

    if (data) {
      return {
        enabled: data.enabled,
        message: data.message,
        estimatedDuration: data.estimated_duration,
        contactEmail: data.contact_email
      }
    }
  } catch (error) {
    console.error('Unexpected error checking maintenance mode:', error)
  }

  return defaults
}
