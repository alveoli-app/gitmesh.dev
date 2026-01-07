import React from "react"
import { Terminal, AlertTriangle, ExternalLink } from "lucide-react"
import { getMaintenanceConfig } from "@/lib/maintenance"

export const dynamic = "force-dynamic"

export default async function MaintenancePage() {
  const config = await getMaintenanceConfig()
  const charGif = "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZHBvM3p1eG1zZGthNGs5bHkwa3l4Mjc4ZGVzN2RveTNwamw5eHZ1dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/qIMZVXWJHQI0Qu3Pe9/giphy.gif"

  return (
    <div className="min-h-screen bg-[#E3E3E3] font-mono flex flex-col items-center justify-center p-0 relative overflow-hidden">
      {/* Background Grid Pattern - Very Roblox Studio */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, backgroundSize: '40px 40px' }} 
      />

      {/* Top Warning Bar */}
      <div className="w-full bg-[#FFB800] border-b-4 border-black p-2 flex justify-center items-center gap-4 overflow-hidden whitespace-nowrap">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-2 text-black font-black uppercase text-sm">
            <AlertTriangle size={16} /> SYSTEM MAINTENANCE IN PROGRESS
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl px-6 py-12">
        
        {/* Robotic Head / Character Unit */}
        <div className="relative mb-8">
          <div className="bg-white border-4 border-black p-2 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <img 
              src={charGif} 
              alt="System Bot" 
              className="w-64 h-64 object-cover border-4 border-black"
            />
          </div>
          {/* Status Tag */}
          <div className="absolute -bottom-4 -right-4 bg-[#00E0FF] border-4 border-black px-4 py-1 font-black text-black rotate-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            OFFLINE
          </div>
        </div>

        {/* Interaction Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Status Box */}
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 border-b-4 border-black pb-2 mb-4">
              <Terminal size={20} />
              <span className="font-black uppercase">System Logs</span>
            </div>
            <ul className="space-y-3 text-sm font-bold uppercase">
              <li className="flex justify-between">
                <span>Status:</span> 
                <span className="text-[#FFB800]">Maintenance Mode</span>
              </li>
              <li className="flex justify-between">
                <span>Eta:</span> 
                <span>{config.estimatedDuration || 'TBD'}</span>
              </li>
              <li className="flex flex-col gap-2 mt-4 border-t-4 border-black pt-4">
                 <span className="text-[10px] opacity-50">Transmission from Admin:</span>
                 <span className="text-sm normal-case leading-tight text-blue-600 bg-blue-50 p-2 border-2 border-dashed border-blue-200">
                   {config.message}
                 </span>
              </li>
            </ul>
          </div>

          {/* Action Box */}
          <div className="bg-[#00A2FF] border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <p className="font-black text-white uppercase text-sm mb-2 leading-tight">
                Need help?
              </p>
              <p className="text-white text-xs font-bold uppercase mb-4 opacity-80">
                Our support lines are still active during the repair phase.
              </p>
            </div>
            <a 
              href={`mailto:${config.contactEmail}`}
              className="w-full bg-white border-4 border-black py-3 text-center font-black uppercase text-black hover:bg-yellow-300 transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-2"
            >
              Contact Support <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </main>

      {/* Bottom Footer Bar */}
      <footer className="w-full border-t-4 border-black bg-white p-4 flex flex-col md:flex-row justify-between items-center gap-4 px-10">
        <div className="flex items-center gap-4">
          <div className="w-4 h-4 bg-[#FF3131] border-2 border-black animate-pulse" />
          <span className="font-black text-sm uppercase">Secure Node: ACTIVE</span>
        </div>
        <p className="font-black text-xs uppercase opacity-50">
          Property of GitMesh CE // 2026
        </p>
      </footer>

      {/* Floating Decorative Blobs */}
      <div className="absolute top-20 left-10 w-12 h-12 bg-[#FF3131] border-4 border-black hidden md:block" />
      <div className="absolute bottom-40 right-10 w-16 h-16 bg-[#00E0FF] border-4 border-black rotate-12 hidden md:block" />
    </div>
  )
}
