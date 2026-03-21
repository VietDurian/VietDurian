"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-28 pb-16 px-4 lg:px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        {t('about_hero_title')}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        {t('about_hero_subtitle')}
                    </p>
                </div>
            </section>

            {/* Video Section */}
            <section className="px-4 lg:px-6 pb-16">
                <div className="max-w-6xl mx-auto">
                    <div className="relative w-full h-0 pb-[56.25%] rounded-2xl overflow-hidden shadow-2xl">
                        <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src="https://www.youtube.com/embed/Kp27BlfAl3Y"
                            title="VietDurian Video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="py-16 bg-emerald-500">
                <div className="max-w-[1400px] mx-auto px-4 lg:px-6 space-y-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="text-white">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('about_mission_title')}</h2>
                            <p className="text-lg text-emerald-50 leading-relaxed">{t('about_mission_desc')}</p>
                        </div>
                        <div className="relative h-72 rounded-xl overflow-hidden shadow-lg">
                            <Image src="/images/Durian3.jpg" alt="Sầu riêng trồng bền vững" fill className="object-cover" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="relative h-72 rounded-xl overflow-hidden shadow-lg order-2 lg:order-1">
                            <Image src="/images/Durian5.jpg" alt="Tầm nhìn phát triển" fill className="object-cover" />
                        </div>
                        <div className="order-1 lg:order-2 text-white">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('about_vision_title')}</h2>
                            <p className="text-lg text-emerald-50 leading-relaxed">{t('about_vision_desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-16 px-4 lg:px-6 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">{t('about_values_title')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all border-t-4 border-emerald-600">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{t('about_value1_title')}</h3>
                            <p className="text-gray-600 leading-relaxed text-center">{t('about_value1_desc')}</p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all border-t-4 border-emerald-600">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{t('about_value2_title')}</h3>
                            <p className="text-gray-600 leading-relaxed text-center">{t('about_value2_desc')}</p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all border-t-4 border-emerald-600">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{t('about_value3_title')}</h3>
                            <p className="text-gray-600 leading-relaxed text-center">{t('about_value3_desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Goals Section */}
            <section className="py-20 px-4 lg:px-6 bg-white">
                <div className="max-w-[1400px] mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-gray-900">{t('about_goals_title')}</h2>
                    <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto text-lg">{t('about_goals_subtitle')}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="group bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-emerald-200">
                            <div className="bg-emerald-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-700 transition-colors">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">{t('about_goal1_title')}</h3>
                            <p className="text-gray-700 leading-relaxed">{t('about_goal1_desc')}</p>
                        </div>
                        <div className="group bg-gradient-to-br from-lime-50 to-lime-100 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-lime-200">
                            <div className="bg-lime-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-lime-600 transition-colors">
                                <svg className="w-8 h-8 text-emerald-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">{t('about_goal2_title')}</h3>
                            <p className="text-gray-700 leading-relaxed">{t('about_goal2_desc')}</p>
                        </div>
                        <div className="group bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-emerald-200">
                            <div className="bg-emerald-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-700 transition-colors">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">{t('about_goal3_title')}</h3>
                            <p className="text-gray-700 leading-relaxed">{t('about_goal3_desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Meet Our Team Section */}
            <section className="py-20 px-4 lg:px-6 bg-gradient-to-b from-emerald-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-gray-900">{t('about_team_title')}</h2>
                    <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto text-lg">{t('about_team_subtitle')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                            <div className="relative h-64 bg-gradient-to-br from-emerald-100 to-emerald-200 overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-32 h-32 bg-emerald-600 rounded-full flex items-center justify-center">
                                        <span className="text-4xl font-bold text-white">NTQ</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Nguyễn Trọng Quý</h3>
                                <p className="text-emerald-600 font-medium mb-2">CEO</p>
                                <p className="text-sm text-gray-500">CE180596</p>
                            </div>
                        </div>
                        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                            <div className="relative h-64 bg-gradient-to-br from-lime-100 to-lime-200 overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-32 h-32 bg-lime-600 rounded-full flex items-center justify-center">
                                        <span className="text-4xl font-bold text-white">NTB</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Nguyễn Thanh Bảo</h3>
                                <p className="text-emerald-600 font-medium mb-2">CEO</p>
                                <p className="text-sm text-gray-500">CE181098</p>
                            </div>
                        </div>
                        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                            <div className="relative h-64 bg-gradient-to-br from-emerald-100 to-emerald-200 overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-32 h-32 bg-emerald-600 rounded-full flex items-center justify-center">
                                        <span className="text-4xl font-bold text-white">NGC</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Nguyễn Gia Chấn</h3>
                                <p className="text-emerald-600 font-medium mb-2">CEO</p>
                                <p className="text-sm text-gray-500">CE181288</p>
                            </div>
                        </div>
                        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                            <div className="relative h-64 bg-gradient-to-br from-lime-100 to-lime-200 overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-32 h-32 bg-lime-600 rounded-full flex items-center justify-center">
                                        <span className="text-4xl font-bold text-white">VLTV</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Võ Lâm Thúy Vi</h3>
                                <p className="text-emerald-600 font-medium mb-2">CEO</p>
                                <p className="text-sm text-gray-500">CE170398</p>
                            </div>
                        </div>
                        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                            <div className="relative h-64 bg-gradient-to-br from-emerald-100 to-emerald-200 overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-32 h-32 bg-emerald-600 rounded-full flex items-center justify-center">
                                        <span className="text-4xl font-bold text-white">NDHP</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Nguyễn Dương Hoàng Phúc</h3>
                                <p className="text-emerald-600 font-medium mb-2">CEO</p>
                                <p className="text-sm text-gray-500">CE182389</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}