"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useRybbitTracking } from "@/components/rybbit-analytics"
import { Button } from "@/components/ui/button"
import { useState } from 'react'
import Link from 'next/link'

// Hardcoded demo projects data
const demoProjects = [
    {
        id: 1,
        name: 'gitmesh-core',
        full_name: 'demo-user/gitmesh-core',
        description: 'Core platform for unified Git collaboration across GitHub and GitLab',
        language: 'TypeScript',
        stargazers_count: 892,
        forks_count: 124,
        open_issues_count: 12,
        updated_at: '2025-12-15T10:30:00Z',
        provider: 'github',
        visibility: 'public'
    },
    {
        id: 2,
        name: 'ai-assistant',
        full_name: 'demo-user/ai-assistant',
        description: 'Intelligent code assistant powered by advanced language models',
        language: 'Python',
        stargazers_count: 1543,
        forks_count: 287,
        open_issues_count: 34,
        updated_at: '2025-12-14T15:45:00Z',
        provider: 'github',
        visibility: 'public'
    },
    {
        id: 3,
        name: 'cloud-infrastructure',
        full_name: 'demo-org/cloud-infrastructure',
        description: 'Infrastructure as Code for multi-cloud deployment automation',
        language: 'Go',
        stargazers_count: 456,
        forks_count: 89,
        open_issues_count: 8,
        updated_at: '2025-12-13T09:20:00Z',
        provider: 'gitlab',
        visibility: 'public'
    },
    {
        id: 4,
        name: 'mobile-sdk',
        full_name: 'demo-user/mobile-sdk',
        description: 'Cross-platform mobile SDK for iOS and Android development',
        language: 'Kotlin',
        stargazers_count: 734,
        forks_count: 156,
        open_issues_count: 19,
        updated_at: '2025-12-12T18:00:00Z',
        provider: 'github',
        visibility: 'public'
    },
    {
        id: 5,
        name: 'analytics-dashboard',
        full_name: 'demo-org/analytics-dashboard',
        description: 'Real-time analytics and monitoring dashboard with beautiful visualizations',
        language: 'Vue',
        stargazers_count: 623,
        forks_count: 143,
        open_issues_count: 15,
        updated_at: '2025-12-11T14:30:00Z',
        provider: 'gitlab',
        visibility: 'public'
    },
    {
        id: 6,
        name: 'api-gateway',
        full_name: 'demo-user/api-gateway',
        description: 'High-performance API gateway with authentication and rate limiting',
        language: 'Rust',
        stargazers_count: 1087,
        forks_count: 234,
        open_issues_count: 21,
        updated_at: '2025-12-10T11:15:00Z',
        provider: 'github',
        visibility: 'public'
    },
    {
        id: 7,
        name: 'machine-learning-pipeline',
        full_name: 'demo-org/machine-learning-pipeline',
        description: 'End-to-end ML pipeline for training and deploying models at scale',
        language: 'Python',
        stargazers_count: 2145,
        forks_count: 567,
        open_issues_count: 43,
        updated_at: '2025-12-09T16:20:00Z',
        provider: 'gitlab',
        visibility: 'public'
    },
    {
        id: 8,
        name: 'ui-components',
        full_name: 'demo-user/ui-components',
        description: 'Modern React component library with accessibility built-in',
        language: 'TypeScript',
        stargazers_count: 1876,
        forks_count: 423,
        open_issues_count: 28,
        updated_at: '2025-12-08T13:45:00Z',
        provider: 'github',
        visibility: 'public'
    },
    {
        id: 9,
        name: 'blockchain-validator',
        full_name: 'demo-user/blockchain-validator',
        description: 'Decentralized validator node for blockchain networks',
        language: 'Solidity',
        stargazers_count: 543,
        forks_count: 98,
        open_issues_count: 11,
        updated_at: '2025-12-07T10:00:00Z',
        provider: 'github',
        visibility: 'private'
    },
    {
        id: 10,
        name: 'devops-toolkit',
        full_name: 'demo-org/devops-toolkit',
        description: 'Comprehensive DevOps automation scripts and utilities',
        language: 'Shell',
        stargazers_count: 387,
        forks_count: 76,
        open_issues_count: 6,
        updated_at: '2025-12-06T08:30:00Z',
        provider: 'gitlab',
        visibility: 'public'
    },
    {
        id: 11,
        name: 'database-migrator',
        full_name: 'demo-user/database-migrator',
        description: 'Database migration tool supporting PostgreSQL, MySQL, and MongoDB',
        language: 'Java',
        stargazers_count: 267,
        forks_count: 54,
        open_issues_count: 9,
        updated_at: '2025-12-05T14:15:00Z',
        provider: 'github',
        visibility: 'public'
    },
    {
        id: 12,
        name: 'security-scanner',
        full_name: 'demo-org/security-scanner',
        description: 'Automated security vulnerability scanner for web applications',
        language: 'Python',
        stargazers_count: 945,
        forks_count: 198,
        open_issues_count: 17,
        updated_at: '2025-12-04T11:00:00Z',
        provider: 'gitlab',
        visibility: 'private'
    },
]

export default function Projects() {
    const { trackEvent } = useRybbitTracking()
    const [filter, setFilter] = useState<'all' | 'github' | 'gitlab'>('all')
    const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all')

    const filteredProjects = demoProjects.filter(project => {
        const matchesProvider = filter === 'all' || project.provider === filter
        const matchesVisibility = visibilityFilter === 'all' || project.visibility === visibilityFilter
        return matchesProvider && matchesVisibility
    })

    const handleFilterChange = (newFilter: 'all' | 'github' | 'gitlab') => {
        setFilter(newFilter)
        trackEvent('projects_filter_changed', { filter: newFilter })
    }

    const handleVisibilityFilterChange = (newFilter: 'all' | 'public' | 'private') => {
        setVisibilityFilter(newFilter)
        trackEvent('visibility_filter_changed', { filter: newFilter })
    }

    return (
        <main className="min-h-screen bg-[#FFFFFF]">
            <Navigation />

            <div className="container mx-auto px-6 py-12 space-y-10">
                {/* Header Block */}
                <div
                    className="
            bg-white border-2 border-black rounded-2xl 
            shadow-[4px_4px_0px_rgba(0,0,0,0.25)]
            p-8
          "
                >
                    <h1 className="text-4xl font-bold leading-tight text-black mb-3">
                        Projects <span className="bg-[#FF6B7A] text-white px-3 py-1 rounded-lg">Dashboard</span>
                    </h1>

                    <p className="text-lg text-gray-700 font-medium max-w-2xl">
                        Manage and explore demo repositories across GitHub and GitLab.
                    </p>
                </div>

                {/* Filters */}
                <div
                    className="
            bg-white border-2 border-black rounded-2xl 
            shadow-[4px_4px_0px_rgba(0,0,0,0.25)]
            p-6
          "
                >
                    <div className="flex flex-col md:flex-row gap-6">
                        <div>
                            <p className="text-sm font-bold mb-2">Provider</p>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleFilterChange('all')}
                                    className={`border-2 border-black rounded-lg px-4 py-2 ${filter === 'all' ? 'bg-black text-white' : 'bg-white text-black'
                                        }`}
                                >
                                    All
                                </Button>
                                <Button
                                    onClick={() => handleFilterChange('github')}
                                    className={`border-2 border-black rounded-lg px-4 py-2 ${filter === 'github' ? 'bg-black text-white' : 'bg-white text-black'
                                        }`}
                                >
                                    🐙 GitHub
                                </Button>
                                <Button
                                    onClick={() => handleFilterChange('gitlab')}
                                    className={`border-2 border-black rounded-lg px-4 py-2 ${filter === 'gitlab' ? 'bg-black text-white' : 'bg-white text-black'
                                        }`}
                                >
                                    🦊 GitLab
                                </Button>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-bold mb-2">Visibility</p>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleVisibilityFilterChange('all')}
                                    className={`border-2 border-black rounded-lg px-4 py-2 ${visibilityFilter === 'all' ? 'bg-black text-white' : 'bg-white text-black'
                                        }`}
                                >
                                    All
                                </Button>
                                <Button
                                    onClick={() => handleVisibilityFilterChange('public')}
                                    className={`border-2 border-black rounded-lg px-4 py-2 ${visibilityFilter === 'public' ? 'bg-black text-white' : 'bg-white text-black'
                                        }`}
                                >
                                    🌐 Public
                                </Button>
                                <Button
                                    onClick={() => handleVisibilityFilterChange('private')}
                                    className={`border-2 border-black rounded-lg px-4 py-2 ${visibilityFilter === 'private' ? 'bg-black text-white' : 'bg-white text-black'
                                        }`}
                                >
                                    🔒 Private
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-bold">{filteredProjects.length}</span> of {demoProjects.length} projects
                        </p>
                    </div>
                </div>

                {/* Projects Grid */}
                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            className="
                bg-white p-6 border-2 border-black rounded-xl
                shadow-[3px_3px_0px_rgba(0,0,0,0.25)]
                hover:shadow-[6px_6px_0px_rgba(0,0,0,0.25)]
                transition-all cursor-pointer
              "
                            onClick={() => trackEvent('project_clicked', { project: project.name, provider: project.provider })}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">
                                        {project.provider === 'github' ? '🐙' : '🦊'}
                                    </span>
                                    <h3 className="font-bold text-base truncate">{project.name}</h3>
                                </div>
                                <span className="text-xs px-2 py-1 bg-gray-200 border border-black rounded">
                                    {project.visibility === 'public' ? '🌐' : '🔒'}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-700 mb-4 line-clamp-2">{project.description}</p>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
                                <span className="flex items-center gap-1">
                                    ⭐ {project.stargazers_count}
                                </span>
                                <span className="flex items-center gap-1">
                                    🍴 {project.forks_count}
                                </span>
                                <span className="flex items-center gap-1">
                                    ⚠️ {project.open_issues_count}
                                </span>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between text-xs">
                                <span className="px-2 py-1 bg-blue-100 border border-black rounded font-medium">
                                    {project.language}
                                </span>
                                <span className="text-gray-600">
                                    {new Date(project.updated_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div
                    className="
            bg-white p-8 border-2 border-black rounded-2xl 
            shadow-[4px_4px_0px_rgba(0,0,0,0.25)]
          "
                >
                    <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/overview">
                            <Button
                                className="w-full bg-black text-white p-4 border-2 border-black rounded-xl text-center shadow-[3px_3px_0px_rgba(0,0,0,0.25)] hover:bg-gray-800 transition-all cursor-pointer"
                                onClick={() => trackEvent('view_overview_clicked', { from: 'projects' })}
                            >
                                <span className="mr-2">📊</span>
                                View Overview
                            </Button>
                        </Link>

                        <Link href="/">
                            <Button
                                className="w-full border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.25)] bg-white hover:bg-gray-100"
                                onClick={() => trackEvent('home_clicked', { from: 'projects' })}
                            >
                                <span className="mr-2">🏠</span>
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    )
}
