import { useEffect, useMemo, useState } from 'react';
import {
	Area,
	AreaChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

import { useLanguage } from '../context/LanguageContext';
import { blogAPI, getOwnPosts } from '../../../../lib/api';

const toMonthKey = (date) => {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	return `${year}-${String(month).padStart(2, '0')}`;
};

const toMonthLabel = (key) => {
	const [year, mm] = String(key).split('-');
	const month = Number(mm);
	return `T${month}/${year}`;
};

const safeDate = (v) => {
	if (!v) return null;
	const raw =
		v instanceof Date
			? v
			: typeof v === 'object' && v?.$date
				? v.$date
				: v;
	const d = new Date(raw);
	return Number.isNaN(d.getTime()) ? null : d;
};

const normalizeList = (res) => {
	if (Array.isArray(res)) return res;
	if (Array.isArray(res?.data)) return res.data;
	if (Array.isArray(res?.data?.data)) return res.data.data;
	return [];
};

const monthDiff = (a, b) => (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());

const buildMonthSeries = ({ startDate, endDate, maxMonths = 24 }) => {
	const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
	const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
	let startIdx = 0;
	const totalMonths = monthDiff(start, end) + 1;
	if (totalMonths > maxMonths) startIdx = totalMonths - maxMonths;

	const result = [];
	for (let i = startIdx; i < totalMonths; i++) {
		const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
		const key = toMonthKey(d);
		result.push({ key, label: toMonthLabel(key) });
	}
	return result;
};

export function PostBlogChart() {
	const { t } = useLanguage();
	const [chartData, setChartData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const colors = useMemo(
		() => ({
			posts: '#1a4d2e',
			blogs: '#F59E0B',
		}),
		[]
	);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);

				const [postsRes, blogsRes] = await Promise.all([getOwnPosts(), blogAPI.getAllBlogs()]);

				const posts = normalizeList(postsRes);
				const blogs = normalizeList(blogsRes);

				const postDates = posts
					.map((p) => safeDate(p?.created_at || p?.createdAt))
					.filter(Boolean);
				const blogDates = blogs
					.map((b) => safeDate(b?.created_at || b?.createdAt))
					.filter(Boolean);

				const allDates = [...postDates, ...blogDates];
				if (allDates.length === 0) {
					setChartData([]);
					setError(null);
					return;
				}

				const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
				const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

				// Build a timeline based on DB created_at (capped to 24 months)
				const months = buildMonthSeries({ startDate: minDate, endDate: maxDate, maxMonths: 24 });
				const allowed = new Set(months.map((m) => m.key));

				const postCounts = new Map();
				for (const p of posts) {
					const d = safeDate(p?.created_at || p?.createdAt);
					if (!d) continue;
					const k = toMonthKey(d);
					if (!allowed.has(k)) continue;
					postCounts.set(k, (postCounts.get(k) || 0) + 1);
				}

				const blogCounts = new Map();
				for (const b of blogs) {
					const d = safeDate(b?.created_at || b?.createdAt);
					if (!d) continue;
					const k = toMonthKey(d);
					if (!allowed.has(k)) continue;
					blogCounts.set(k, (blogCounts.get(k) || 0) + 1);
				}

				setChartData(
					months.map((m) => ({
						time: m.label,
						posts: postCounts.get(m.key) || 0,
						blogs: blogCounts.get(m.key) || 0,
					}))
				);
				setError(null);
			} catch (e) {
				setError(e?.message || String(e));
				setChartData([]);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) {
		return (
			<div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
				<div className="mb-4 md:mb-6">
					<h2 className="text-base md:text-lg font-bold text-[#1a4d2e]">{t('post_blog_trend_title')}</h2>
					<p className="text-xs md:text-sm text-gray-500">{t('post_blog_trend_subtitle')}</p>
				</div>
				<div className="h-75 flex items-center justify-center">
					<div className="text-gray-500">Đang tải dữ liệu...</div>
				</div>
			</div>
		);
	}

	if (error && chartData.length === 0) {
		return (
			<div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
				<div className="mb-4 md:mb-6">
					<h2 className="text-base md:text-lg font-bold text-[#1a4d2e]">{t('post_blog_trend_title')}</h2>
					<p className="text-xs md:text-sm text-gray-500">{t('post_blog_trend_subtitle')}</p>
				</div>
				<div className="h-75 flex items-center justify-center">
					<div className="text-red-500">Lỗi tải dữ liệu: {error}</div>
				</div>
			</div>
		);
	}

	const total = chartData.reduce((s, r) => s + (r.posts || 0) + (r.blogs || 0), 0);
	if (!chartData || chartData.length === 0 || total === 0) {
		return (
			<div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
				<div className="mb-4 md:mb-6">
					<h2 className="text-base md:text-lg font-bold text-[#1a4d2e]">{t('post_blog_trend_title')}</h2>
					<p className="text-xs md:text-sm text-gray-500">{t('post_blog_trend_subtitle')}</p>
				</div>
				<div className="h-75 flex items-center justify-center">
					<div className="text-gray-500 text-center">
						<p className="mb-2">📈 Chưa có dữ liệu</p>
						<p className="text-sm">Chưa có bài Post/Blog trong 8 tháng gần đây</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
			<div className="mb-4 md:mb-6">
				<h2 className="text-base md:text-lg font-bold text-[#1a4d2e]">{t('post_blog_trend_title')}</h2>
				<p className="text-xs text-gray-500">{t('post_blog_trend_subtitle')}</p>
			</div>
			<ResponsiveContainer width="100%" height={320}>
				<AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
					<defs>
						<linearGradient id="postsFill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor={colors.posts} stopOpacity={0.35} />
							<stop offset="95%" stopColor={colors.posts} stopOpacity={0.05} />
						</linearGradient>
						<linearGradient id="blogsFill" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor={colors.blogs} stopOpacity={0.35} />
							<stop offset="95%" stopColor={colors.blogs} stopOpacity={0.05} />
						</linearGradient>
					</defs>
					<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
					<XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: 12 }} minTickGap={16} />
					<YAxis stroke="#1a4d2e" allowDecimals={false} style={{ fontSize: 12 }} />
					<Tooltip
						contentStyle={{
							backgroundColor: 'white',
							border: '1px solid #e5e7eb',
							borderRadius: '8px',
							fontSize: '12px',
						}}
						formatter={(value, name) => {
							const label = name === 'posts' ? (t('posts') || 'Posts') : (t('blogs') || 'Blogs');
							return [`${Number(value).toLocaleString('vi-VN')}`, label];
						}}
						labelStyle={{ fontWeight: 'bold', color: '#1a4d2e' }}
					/>
					<Legend
						wrapperStyle={{ fontSize: 12 }}
						formatter={(value) => (value === 'posts' ? t('posts') : t('blogs'))}
					/>
					<Area
						type="monotone"
						dataKey="posts"
						name="posts"
						stroke={colors.posts}
						fill="url(#postsFill)"
						strokeWidth={2}
						dot={false}
					/>
					<Area
						type="monotone"
						dataKey="blogs"
						name="blogs"
						stroke={colors.blogs}
						fill="url(#blogsFill)"
						strokeWidth={2}
						dot={false}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
