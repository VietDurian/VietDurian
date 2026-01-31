import { useState, useEffect } from 'react';
import { Users, UserCheck, MessageSquareText, Newspaper, Loader2 } from 'lucide-react';

import { ControlCenter } from './ControlCenter';
import { GardenHeatmap } from './GardenHeatmap';
import { MarketTrendChart } from './MarketTrendChart';
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

    // State to store previous month data
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
        
        if (change > 0) {
            return `+${change.toFixed(1)}%`;
        } else if (change < 0) {
            return `${change.toFixed(1)}%`;
        } else {
            return '0%';
        }
    };

    // Function to get data for specific time period
    const getStatsForPeriod = (data, startDate, endDate) => {
        return data.filter(item => {
            const itemDate = new Date(item.created_at || item.createdAt);
            return itemDate >= startDate && itemDate <= endDate;
        });
    };

    // Function to fetch data by month
    const fetchMonthlyData = async () => {
        try {
            // Calculate time periods
            const now = new Date();
            const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            
            const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

            console.log('Current month:', currentMonthStart, 'to', currentMonthEnd);
            console.log('Previous month:', previousMonthStart, 'to', previousMonthEnd);

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

            // Filter data for current month
            const currentMonthUsers = getStatsForPeriod(mappedUsers, currentMonthStart, currentMonthEnd);
            const currentMonthBlogs = getStatsForPeriod(blogsData, currentMonthStart, currentMonthEnd);
            const currentMonthPosts = getStatsForPeriod(postsData, currentMonthStart, currentMonthEnd);

            // Filter data for previous month
            const previousMonthUsers = getStatsForPeriod(mappedUsers, previousMonthStart, previousMonthEnd);
            const previousMonthBlogs = getStatsForPeriod(blogsData, previousMonthStart, previousMonthEnd);
            const previousMonthPosts = getStatsForPeriod(postsData, previousMonthStart, previousMonthEnd);

            // Calculate current month stats
            const totalUsers = mappedUsers.length || 0; // Total all users
            const experts = mappedUsers.filter(user => user.role === 'contentExpert').length || 0;
            const posts = postsData.length || 0; // Total all posts
            const blogs = blogsData.length || 0; // Total all blogs

            // Calculate previous month stats (cumulative total up to end of previous month)
            const usersAtEndOfPreviousMonth = mappedUsers.filter(user => {
                const userDate = new Date(user.created_at);
                return userDate <= previousMonthEnd;
            }).length;

            const expertsAtEndOfPreviousMonth = mappedUsers.filter(user => {
                const userDate = new Date(user.created_at);
                return userDate <= previousMonthEnd && user.role === 'contentExpert';
            }).length;

            const postsAtEndOfPreviousMonth = postsData.filter(post => {
                const postDate = new Date(post.created_at || post.createdAt);
                return postDate <= previousMonthEnd;
            }).length;

            const blogsAtEndOfPreviousMonth = blogsData.filter(blog => {
                const blogDate = new Date(blog.created_at || blog.createdAt);
                return blogDate <= previousMonthEnd;
            }).length;

            console.log('Current stats:', { totalUsers, experts, posts, blogs });
            console.log('Previous month stats:', {
                totalUsers: usersAtEndOfPreviousMonth,
                experts: expertsAtEndOfPreviousMonth,
                posts: postsAtEndOfPreviousMonth,
                blogs: blogsAtEndOfPreviousMonth
            });

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

    // Determine changeType based on change value
    const getChangeType = (changeStr) => {
        if (changeStr.startsWith('+')) return 'increase';
        if (changeStr.startsWith('-')) return 'decrease';
        return 'neutral';
    };

    // Loading state
    if (stats.loading) {
        return (
            <div className="p-4 md:p-8">
                <div className="flex items-center justify-center min-h-[400px]">
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
                <div className="flex items-center justify-center min-h-[400px]">
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
                <MarketTrendChart />
            </div>
        </div>
    );
}