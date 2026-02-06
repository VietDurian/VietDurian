import { useState, useEffect } from 'react';
import { Users, UserCheck, MessageSquareText, Newspaper, Loader2 } from 'lucide-react';

import { GardenHeatmap } from './GardenHeatmap';
import { UserChart } from './UserChart';
import { PostBlogChart } from './PostBlogChart';
import { StatsCard } from './StatsCard';
import { useLanguage } from '../context/LanguageContext';
import { usersAPI, blogAPI, getOwnPosts } from '../../../../lib/api';

export function DashboardPage({ onNavigate }) {
    const { t } = useLanguage();
    
    // State to store statistics data
    const [stats, setStats] = useState({
        totalUsers: 0,
        experts: 0,
        posts: 0,
        blogs: 0,
        loading: true,
        error: null
    });

    // State to store previous month data (cumulative totals up to end of previous month)
    const [previousMonthStats, setPreviousMonthStats] = useState({
        totalUsers: 0,
        experts: 0,
        posts: 0,
        blogs: 0
    });

    // Function to calculate percentage change compared to previous month
    const calculateChange = (current, previous) => {
        if (previous === 0) {
            return current > 0 ? '+100%' : '0%';
        }

        const change = ((current - previous) / previous) * 100;
        if (change > 0) return `+${change.toFixed(1)}%`;
        if (change < 0) return `${change.toFixed(1)}%`;
        return '0%';
    };

    // Determine changeType based on change value
    const getChangeType = (changeStr) => {
        if (changeStr.startsWith('+')) return 'increase';
        if (changeStr.startsWith('-')) return 'decrease';
        return 'neutral';
    };

    // Function to fetch dashboard statistics
    const fetchMonthlyData = async () => {
        try {
            // Calculate end of previous month
            const now = new Date();
            const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

            // Fetch all data (without time filter from API)
            const [usersResponse, blogsResponse, postsResponse] = await Promise.all([
                usersAPI.filterUsers({}), // Get all users
                blogAPI.getAllBlogs(),
                getOwnPosts()
            ]);

            // Process users data
            const usersList = Array.isArray(usersResponse?.data) ? usersResponse.data : [];
            const mappedUsers = usersList.map(u => ({
                id: u._id || u.id,
                name: u.full_name || 'No Name',
                email: u.email,
                phone: u.phone || 'N/A',
                role: u.role,
                status: u.is_banned ? 'blocked' : 'active',
                created_at: u.created_at || u.createdAt,
                joinDate: (u.created_at || u.createdAt)
                    ? new Date(u.created_at || u.createdAt).toLocaleDateString('vi-VN')
                    : 'N/A',
                location: u.location || 'Unknown',
            }));

            // Process blogs data
            const blogsData = Array.isArray(blogsResponse?.data) ? blogsResponse.data : [];
            
            // Process posts data
            const postsData = Array.isArray(postsResponse) ? postsResponse : 
                             Array.isArray(postsResponse?.data) ? postsResponse.data : [];

            // Calculate current month stats
            // Platform users should NOT include admins
            const totalUsers = mappedUsers.filter(user => user.role !== 'admin').length || 0;
            const experts = mappedUsers.filter(user => user.role === 'contentExpert').length || 0;
            const posts = postsData.length || 0; // Total all posts
            const blogs = blogsData.length || 0; // Total all blogs

            // Previous month cumulative totals
            const isOnOrBeforePrevMonthEnd = (dateValue) => {
                if (!dateValue) return false;
                const d = new Date(dateValue);
                return !Number.isNaN(d.getTime()) && d <= previousMonthEnd;
            };

            const usersAtEndOfPreviousMonth = mappedUsers.filter((u) => isOnOrBeforePrevMonthEnd(u.created_at) && u.role !== 'admin').length;
            const expertsAtEndOfPreviousMonth = mappedUsers.filter((u) => isOnOrBeforePrevMonthEnd(u.created_at) && u.role === 'contentExpert').length;
            const postsAtEndOfPreviousMonth = postsData.filter((p) => isOnOrBeforePrevMonthEnd(p.created_at || p.createdAt)).length;
            const blogsAtEndOfPreviousMonth = blogsData.filter((b) => isOnOrBeforePrevMonthEnd(b.created_at || b.createdAt)).length;

            // Update state
            setStats({
                totalUsers,
                experts,
                posts,
                blogs,
                loading: false,
                error: null
            });

            setPreviousMonthStats({
                totalUsers: usersAtEndOfPreviousMonth,
                experts: expertsAtEndOfPreviousMonth,
                posts: postsAtEndOfPreviousMonth,
                blogs: blogsAtEndOfPreviousMonth
            });

        } catch (error) {
            console.error('Error fetching monthly data:', error);
            setStats(prev => ({
                ...prev,
                loading: false,
                error: error.message
            }));
        }
    };

    // useEffect to fetch data when component mounts
    useEffect(() => {
        fetchMonthlyData();
        
        // Refresh data every hour (since data changes daily)
        const interval = setInterval(fetchMonthlyData, 60 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, []);

    // Calculate percentage changes
    const changes = {
        totalUsers: calculateChange(stats.totalUsers, previousMonthStats.totalUsers),
        experts: calculateChange(stats.experts, previousMonthStats.experts),
        posts: calculateChange(stats.posts, previousMonthStats.posts),
        blogs: calculateChange(stats.blogs, previousMonthStats.blogs)
    };

    // Loading state
    if (stats.loading) {
        return (
            <div className="p-4 md:p-8">
                <div className="flex items-center justify-center min-h-100">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-[#1a4d2e]" />
                        <p className="text-gray-600">Loading data...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (stats.error) {
        return (
            <div className="p-4 md:p-8">
                <div className="flex items-center justify-center min-h-100">
                    <div className="text-center">
                        <p className="text-red-600 mb-2">Error loading data: {stats.error}</p>
                        <button 
                            onClick={fetchMonthlyData} 
                            className="px-4 py-2 bg-[#1a4d2e] text-white rounded hover:bg-[#2a5d3e]"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-[#1a4d2e] mb-2">
                    {t('welcome')}
                </h1>
                <p className="text-sm md:text-base text-gray-600">{t('overview')}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                <StatsCard
                    title={t('total_platform_users')}
                    value={stats.totalUsers.toLocaleString()}
                    change={changes.totalUsers}
                    changeType={getChangeType(changes.totalUsers)}
                    icon={Users}
                    onClick={() => onNavigate?.('users')}
                />
                <StatsCard
                    title={t('experts')}
                    value={stats.experts.toLocaleString()}
                    change={changes.experts}
                    changeType={getChangeType(changes.experts)}
                    icon={UserCheck}
                />
                <StatsCard
                    title={t('total_posts')}
                    value={stats.posts.toLocaleString()}
                    change={changes.posts}
                    changeType={getChangeType(changes.posts)}
                    icon={Newspaper}
                    onClick={() => onNavigate?.('posts')}
                />
                <StatsCard
                    title={t('total_blogs')}
                    value={stats.blogs.toLocaleString()}
                    change={changes.blogs}
                    changeType={getChangeType(changes.blogs)}
                    icon={MessageSquareText}
                    onClick={() => onNavigate?.('blogs')}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                <UserChart />
                <GardenHeatmap />
                <PostBlogChart />
            </div>
        </div>
    );
}