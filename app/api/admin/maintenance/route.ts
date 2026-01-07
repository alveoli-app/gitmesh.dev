import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getMaintenanceConfig, updateMaintenanceCache } from '@/lib/maintenance'
import { validateAdminAccess } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin using the project's validation utility
    const { isValid, error: authError } = await validateAdminAccess()
    
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized', details: authError }, { status: 401 })
    }

    const { enabled, message, duration, contactEmail } = await request.json()
    
    const updateData: any = {
      enabled,
      message,
      estimated_duration: duration,
      updated_at: new Date().toISOString()
    }

    if (contactEmail) {
      updateData.contact_email = contactEmail
    }
    
    // Update Database and return the full updated row
    const { data, error } = await supabase
      .from('maintenance_config')
      .upsert({
        id: 1,
        ...updateData
      })
      .select() // <--- Request the updated data
      .single()

    if (error) {
      console.error('Error updating maintenance mode:', error)
      return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 })
    }
    
    // Update Local Cache using the AUTHORITATIVE data from DB
    if (data) {
      await updateMaintenanceCache({
        enabled: data.enabled,
        message: data.message,
        estimatedDuration: data.estimated_duration,
        contactEmail: data.contact_email
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}` 
    })
  } catch (error) {
    console.error('Error toggling maintenance mode:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  const config = await getMaintenanceConfig()
  return NextResponse.json(config)
}