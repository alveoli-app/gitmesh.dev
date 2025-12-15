"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useRybbitTracking } from "@/components/rybbit-analytics"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

// Hardcoded demo data
const demoStats = {
    totalRepos: 42,
    totalStars: 1234,
    totalPRs: 56,
    totalIssues: 23,
    totalBranches: 128,
    totalLanguages: 8,
    totalOrganizations: 3,
    totalForks: 89,
}

const demoRecentRepos = [
    {
        id: 1,
        name: 'awesome-project',
        description: 'A revolutionary web application built with Next.js and TypeScript',
        language: 'TypeScript',
        stars: 342,
        updated_at: '2025-12-15T10:30:00Z',
        provider: 'github'
    },
    {
        id: 2,
        name: 'machine-learning-toolkit',
        description: 'Advanced ML toolkit for data scientists and researchers',
        language: 'Python',
        stars: 567,
        updated_at: '2025-12-14T15:45:00Z',
        provider: 'github'
    },
    {
        id: 3,
        name: 'api-gateway',
        description: 'High-performance API gateway with rate limiting and authentication',
        language: 'Go',
        stars: 234,
        updated_at: '2025-12-13T09:20:00Z',
        provider: 'gitlab'
    },
    {
        id: 4,
        name: 'mobile-app',
        description: 'Cross-platform mobile application using React Native',
        language: 'JavaScript',
        stars: 445,
        updated_at: '2025-12-12T18:00:00Z',
        provider: 'github'
    },
    {
        id: 5,
        name: 'devops-scripts',
        description: 'Collection of useful DevOps automation scripts and tools',
        language: 'Shell',
        stars: 178,
        updated_at: '2025-12-11T14:30:00Z',
        provider: 'gitlab'
    },
    {
        id: 6,
        name: 'ui-component-library',
        description: 'Beautiful and accessible UI component library',
        language: 'TypeScript',
        stars: 892,
        updated_at: '2025-12-10T11:15:00Z',
        provider: 'github'
    },
]

export default function Overview() {
    const { trackEvent } = useRybbitTracking()

    const handleRefreshClick = () => {
        trackEvent('refresh_stats_clicked', { page: 'overview' })
    }

    return (
        <main className="min-h-screen bg-[#FFFFFF]">
            <Navigation />

            <div className="p-8 container mx-auto">
                {/* HEADER CARD */}
                <div
                    className="
            mb-10 bg-white border-2 border-black rounded-2xl p-8 
            shadow-[4px_4px_0px_rgba(0,0,0,0.25)]
          "
                >
                    <div className="flex items-center justify-between">
                        <h1 className="text-4xl font-bold">
                            Hub <span className="bg-[#FF6B7A] text-white px-3 py-1 rounded-md">Overview</span>
                        </h1>

                        <Button
                            onClick={handleRefreshClick}
                            className="
                border-2 border-black rounded-xl bg-white 
                hover:bg-gray-100 shadow-[3px_3px_0px_rgba(0,0,0,0.25)]
              "
                        >
                            <span className="mr-2">🔄</span>
                            Refresh Stats
                        </Button>
                    </div>

                    <p className="text-[#393939] mt-3 font-medium">
                        Demo repository statistics and activity across connected platforms.
                    </p>
                </div>

                {/* STATS CARDS */}
                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10"
                >
                    {[
                        {
                            title: 'Total Repositories',
                            value: demoStats.totalRepos,
                            color: 'bg-blue-500',
                            icon: '📁',
                        },
                        {
                            title: 'Total Stars',
                            value: demoStats.totalStars,
                            color: 'bg-yellow-500',
                            icon: '⭐',
                        },
                        {
                            title: 'Pull Requests',
                            value: demoStats.totalPRs,
                            color: 'bg-purple-500',
                            icon: '🔀',
                        },
                        {
                            title: 'Active Issues',
                            value: demoStats.totalIssues,
                            color: 'bg-orange-500',
                            icon: '⚠️',
                        },
                    ].map((stat, i) => (
                        <div
                            key={i}
                            className="
                bg-white p-6 border-2 border-black rounded-xl 
                shadow-[3px_3px_0px_rgba(0,0,0,0.25)]
              "
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-[#666] mb-1">{stat.title}</p>
                                    <p className="text-3xl font-bold text-black">{stat.value.toLocaleString()}</p>
                                </div>
                                <div className={`${stat.color} p-3 rounded-xl border-2 border-black`}>
                                    <span className="text-white text-xl">{stat.icon}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* EXTRA STATS */}
                <div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10"
                >
                    {[
                        {
                            icon: '🌿',
                            label: 'Total Branches',
                            value: demoStats.totalBranches,
                            color: 'bg-green-500',
                        },
                        {
                            icon: '💻',
                            label: 'Languages',
                            value: demoStats.totalLanguages,
                            color: 'bg-red-500',
                        },
                        {
                            icon: '🏢',
                            label: 'Organizations',
                            value: demoStats.totalOrganizations,
                            color: 'bg-indigo-500',
                        },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="
                bg-white p-6 border-2 border-black rounded-xl 
                shadow-[3px_3px_0px_rgba(0,0,0,0.25)]
              "
                        >
                            <div className="flex items-center gap-4">
                                <div className={`${item.color} p-3 rounded-xl border-2 border-black`}>
                                    <span className="text-white text-xl">{item.icon}</span>
                                </div>

                                <div>
                                    <p className="text-sm text-[#666]">{item.label}</p>
                                    <p className="text-2xl font-bold">{item.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CONNECTED PLATFORMS */}
                <div
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10"
                >
                    <div
                        className="
              bg-white p-6 border-2 border-black rounded-2xl 
              shadow-[3px_3px_0px_rgba(0,0,0,0.25)]
            "
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center border-2 border-black">
                                <span className="text-white text-xl">🐙</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-black">GitHub</h3>
                                <p className="text-[#666] text-sm">Connected</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-black font-medium">User: demo-user</p>
                            <p className="text-sm text-[#444]">Repos: 28</p>
                        </div>
                    </div>

                    <div
                        className="
              bg-white p-6 border-2 border-black rounded-2xl 
              shadow-[3px_3px_0px_rgba(0,0,0,0.25)]
            "
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center border-2 border-black">
                                <span className="text-white text-xl">🦊</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-black">GitLab</h3>
                                <p className="text-[#666] text-sm">Connected</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-black font-medium">User: demo-user</p>
                            <p className="text-sm text-[#444]">Projects: 14</p>
                        </div>
                    </div>
                </div>

                {/* RECENT REPOSITORIES */}
                <div
                    className="
            bg-white p-8 border-2 border-black rounded-2xl mb-10
            shadow-[4px_4px_0px_rgba(0,0,0,0.25)]
          "
                >
                    <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {demoRecentRepos.map((repo) => (
                            <div
                                key={repo.id}
                                className="
                  bg-white p-6 border-[1.5px] border-black rounded-xl
                  shadow-[3px_3px_0px_rgba(0,0,0,0.25)]
                "
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-base">
                                        {repo.provider === 'github' ? '🐙' : '🦊'}
                                    </span>
                                    <h3 className="font-semibold text-black text-sm truncate">{repo.name}</h3>
                                </div>

                                <p className="text-xs text-[#555] truncate mb-3">{repo.description}</p>

                                <div className="flex justify-between text-xs text-[#555]">
                                    <div className="flex gap-3">
                                        <span>{repo.language}</span>
                                        <span>⭐ {repo.stars}</span>
                                    </div>
                                    <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* QUICK ACTIONS */}
                <div
                    className="
            bg-white p-8 border-2 border-black rounded-2xl 
            shadow-[4px_4px_0px_rgba(0,0,0,0.25)]
          "
                >
                    <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/projects">
                            <Button
                                className="w-full bg-black text-white p-4 border-2 border-black rounded-xl text-center shadow-[3px_3px_0px_rgba(0,0,0,0.25)] hover:bg-gray-800 transition-all cursor-pointer"
                                onClick={() => trackEvent('view_projects_clicked', { from: 'overview' })}
                            >
                                <span className="mr-2">📁</span>
                                View All Projects
                            </Button>
                        </Link>

                        <Link href="/">
                            <Button
                                className="w-full border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.25)] bg-white hover:bg-gray-100"
                                onClick={() => trackEvent('home_clicked', { from: 'overview' })}
                            >
                                <span className="mr-2">🏠</span>
                                Back to Home
                            </Button>
                        </Link>                </Button>
                </Link>
            </div>
        </div>
            </div >

        <Footer />
        </main >
    )
}
