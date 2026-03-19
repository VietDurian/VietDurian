"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
    BookOpen,
    Sprout,
    Droplets,
    Sun,
    ShieldCheck,
    Scissors,
    ClipboardCheck,
    CheckCircle2,
    AlertTriangle,
    FileText,
    Bug,
    ThermometerSun,
    Calendar,
    Award,
    Trash2,
    Leaf,
    FlaskConical,
    TreePine,
    MapPin,
    Info,
    AlertCircle,
    XCircle,
    CheckSquare,
    Flame,
    Microscope,
    ListChecks,
    NotepadText,
    Recycle,
    CloudRain,
    Wind,
    BadgeCheck,
    ChevronRight,
    Package,
    Droplet,
    CircleDot,
    Layers,
    TriangleAlert,
    Stethoscope,
    Beaker,
    UserCheck,
    FileBadge,
    ClipboardList,
    TestTube,
    Hammer
} from "lucide-react";

// ─── Section content components (language-aware) ──────────────────────────────

function Section1Content({ t }) {
    return (
        <div className="space-y-8">
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-xl shadow-sm">
                <h4 className="font-bold text-emerald-900 mb-3 text-xl flex items-center gap-2">
                    <BookOpen className="w-6 h-6" /> {t('g_s1_vietgap_title')}
                </h4>
                <p className="text-gray-800 text-base leading-relaxed">
                    <strong>VietGAP</strong> {t('g_s1_vietgap_def')}
                </p>
            </div>

            <div>
                <h4 className="font-bold text-gray-900 mb-4 text-lg">{t('g_s1_4criteria_title')}</h4>
                <div className="grid md:grid-cols-2 gap-4 items-stretch">
                    {[
                        { icon: <AlertTriangle className="w-5 h-5" />, color: "red", title: t('g_s1_c1_title'), desc: t('g_s1_c1_desc') },
                        { icon: <Sprout className="w-5 h-5" />, color: "green", title: t('g_s1_c2_title'), desc: t('g_s1_c2_desc') },
                        { icon: <ShieldCheck className="w-5 h-5" />, color: "blue", title: t('g_s1_c3_title'), desc: t('g_s1_c3_desc') },
                        { icon: <FileText className="w-5 h-5" />, color: "purple", title: t('g_s1_c4_title'), desc: t('g_s1_c4_desc') }
                    ].map(({ icon, color, title, desc }) => (
                        <div key={title} className={`bg-white border rounded-xl p-5 shadow-sm hover:border-${color}-300 transition-colors h-full`}>
                            <div className="flex items-center gap-3 mb-3 pb-2 border-b">
                                <div className={`bg-${color}-100 p-2 rounded-lg text-${color}-600`}>{icon}</div>
                                <span className="font-bold text-gray-800">{title}</span>
                            </div>
                            <p className="text-sm text-gray-600">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-emerald-600" /> {t('g_s1_terms_title')}
                </h4>
                <div className="overflow-x-auto border rounded-xl shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="bg-emerald-100 font-bold text-emerald-900">
                            <tr>
                                <th className="px-4 py-3 text-left">{t('g_table_term')}</th>
                                <th className="px-4 py-3 text-left">{t('g_table_explanation')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {[
                                { term: 'VietGAP', color: 'emerald', key: 'g_s1_term_vietgap' },
                                { term: t('g_s1_term_hazard_label'), color: 'red', key: 'g_s1_term_hazard' },
                                { term: 'MRLs', color: 'orange', key: 'g_s1_term_mrls' },
                                { term: 'PHI', color: 'blue', key: 'g_s1_term_phi' },
                                { term: t('g_s1_term_trace_label'), color: 'purple', key: 'g_s1_term_trace' },
                                { term: t('g_s1_term_compost_label'), color: 'lime', key: 'g_s1_term_compost' },
                                { term: t('g_s1_term_audit_label'), color: 'teal', key: 'g_s1_term_audit' },
                                { term: 'IPM / ICM / IPHM', color: 'indigo', key: 'g_s1_term_ipm' },
                            ].map(({ term, color, key }) => (
                                <tr key={key} className="hover:bg-gray-50">
                                    <td className={`px-4 py-3 font-semibold text-${color}-700`}>{term}</td>
                                    <td className="px-4 py-3 text-gray-600">{t(key)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-100">
                <h4 className="font-bold text-orange-900 mb-3 text-lg flex items-center gap-2">
                    <Award className="w-6 h-6" /> {t('g_s1_why_title')}
                </h4>
                <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-800">
                    {[1, 2, 3, 4].map(n => (
                        <li key={n} className="flex gap-2">
                            <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0" />
                            <span>{t(`g_s1_why_${n}`)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function Section2Content({ t }) {
    return (
        <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6 items-stretch">
                <div className="bg-white border rounded-xl p-5 shadow-sm hover:border-orange-300 transition-colors h-full flex flex-col">
                    <h5 className="font-bold text-gray-800 mb-3 border-b pb-2 flex items-center gap-2">
                        <ThermometerSun className="w-5 h-5 text-orange-500" /> {t('g_s2_eco_title')}
                    </h5>
                    <ul className="space-y-3 text-sm text-gray-600 flex-1">
                        {[1, 2, 3, 4].map(n => (
                            <li key={n} className="flex gap-2">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                                <span dangerouslySetInnerHTML={{ __html: t(`g_s2_eco_${n}`) }} />
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white border rounded-xl p-5 shadow-sm hover:border-orange-300 transition-colors h-full flex flex-col">
                    <h5 className="font-bold text-gray-800 mb-3 border-b pb-2 flex items-center gap-2">
                        <Sprout className="w-5 h-5 text-green-600" /> {t('g_s2_zone_title')}
                    </h5>
                    <ul className="space-y-3 text-sm text-gray-600 flex-1">
                        {[1, 2, 3, 4].map(n => (
                            <li key={n} className="flex gap-2">
                                <div className={`w-1.5 h-1.5 ${n === 3 ? 'bg-red-600' : 'bg-green-600'} rounded-full mt-1.5 flex-shrink-0`} />
                                <span dangerouslySetInnerHTML={{ __html: t(`g_s2_zone_${n}`) }} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-lg shadow-sm">
                <h4 className="font-bold text-red-900 flex items-center gap-2 mb-4 text-lg">
                    <AlertTriangle className="w-6 h-6" /> {t('g_s2_hazard_title')}
                </h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm bg-white rounded-lg overflow-hidden">
                        <thead className="bg-red-100 font-bold text-red-900">
                            <tr>
                                <th className="px-4 py-3 text-left">{t('g_table_hazard_type')}</th>
                                <th className="px-4 py-3 text-left">{t('g_table_origin')}</th>
                                <th className="px-4 py-3 text-left">{t('g_table_control')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {['chem', 'bio', 'phys'].map(type => (
                                <tr key={type} className="hover:bg-gray-50">
                                    <td className={`px-4 py-3 font-semibold text-${type === 'chem' ? 'red' : type === 'bio' ? 'yellow' : 'blue'}-700`}>
                                        {t(`g_s2_hazard_${type}_name`)}<br />
                                        <span className="text-xs font-normal text-gray-500">{t(`g_s2_hazard_${type}_sub`)}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">{t(`g_s2_hazard_${type}_origin`)}</td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">{t(`g_s2_hazard_${type}_control`)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1 italic">
                    <Info className="w-3 h-3" /> {t('g_s2_hazard_source')}
                </p>
            </div>

            <div className="bg-lime-50 p-5 rounded-xl border border-lime-200">
                <h4 className="font-bold text-lime-900 mb-3 flex items-center gap-2 text-lg">
                    <TreePine className="w-5 h-5" /> {t('g_s2_design_title')}
                </h4>
                <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
                    <div>
                        <p className="font-semibold mb-2">{t('g_s2_design_mekong_label')}</p>
                        <ul className="space-y-1 list-disc pl-4">
                            {[1, 2, 3].map(n => (
                                <li key={n} dangerouslySetInnerHTML={{ __html: t(`g_s2_design_mekong_${n}`) }} />
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="font-semibold mb-2">{t('g_s2_design_highland_label')}</p>
                        <ul className="space-y-1 list-disc pl-4">
                            {[1, 2, 3].map(n => (
                                <li key={n} dangerouslySetInnerHTML={{ __html: t(`g_s2_design_highland_${n}`) }} />
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm text-gray-700">
                    <p className="flex items-center gap-2 font-semibold mb-1">
                        <AlertCircle className="w-4 h-4 text-yellow-600" /> {t('g_s2_windbreak_label')}
                    </p>
                    <p>{t('g_s2_windbreak_desc')}</p>
                </div>
            </div>
        </div>
    );
}

function Section3Content({ t }) {
    return (
        <div className="space-y-8">
            <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                <h4 className="font-bold text-emerald-900 mb-4 text-xl flex items-center gap-2">
                    <BadgeCheck className="w-6 h-6" /> {t('g_s3_std_title')}
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-lg shadow-sm">
                        <h5 className="font-bold text-emerald-800 mb-3 border-b pb-2">{t('g_s3_std_req_label')}</h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                            {[1, 2, 3, 4].map(n => (
                                <li key={n} className="flex gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <span dangerouslySetInnerHTML={{ __html: t(`g_s3_std_req_${n}`) }} />
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white p-5 rounded-lg shadow-sm">
                        <h5 className="font-bold text-emerald-800 mb-3 border-b pb-2">{t('g_s3_salt_label')}</h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                            {[1, 2].map(n => (
                                <li key={n} className="flex gap-2">
                                    <Droplet className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span dangerouslySetInnerHTML={{ __html: t(`g_s3_salt_${n}`) }} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="font-bold text-gray-900 mb-4 text-xl">{t('g_s3_varieties_title')}</h4>
                <div className="grid md:grid-cols-3 gap-5">
                    {[
                        { key: 'ri6', colorBorder: 'yellow', colorBadge: 'yellow', labelKey: 'g_s3_ri6_label' },
                        { key: 'dona', colorBorder: 'green', colorBadge: 'green', labelKey: 'g_s3_dona_label' },
                        { key: 'chin', colorBorder: 'amber', colorBadge: 'amber', labelKey: 'g_s3_chin_label' },
                    ].map(({ key, colorBorder, colorBadge, labelKey }) => (
                        <div key={key} className={`bg-white border-2 border-${colorBorder}-200 rounded-xl p-5 shadow-sm hover:border-${colorBorder}-400 transition-colors`}>
                            <div className={`bg-${colorBadge}-100 text-${colorBadge}-800 font-bold text-sm px-3 py-1 rounded-full inline-block mb-3`}>
                                {t(labelKey)}
                            </div>
                            <ul className="space-y-2 text-sm text-gray-600">
                                {[1, 2, 3, 4, 5, 6].map(n => (
                                    <li key={n} dangerouslySetInnerHTML={{ __html: t(`g_s3_${key}_${n}`) }} />
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-bold text-gray-900 mb-4 text-xl">{t('g_s3_planting_title')}</h4>
                <div className="grid md:grid-cols-2 gap-5">
                    <div className="bg-white border rounded-xl p-5 shadow-sm">
                        <h5 className="font-bold text-gray-800 mb-3 border-b pb-2">{t('g_s3_plant_mekong_title')}</h5>
                        <ul className="text-sm text-gray-600 space-y-2">
                            {[1, 2, 3, 4].map(n => (
                                <li key={n} dangerouslySetInnerHTML={{ __html: `• ${t(`g_s3_plant_mekong_${n}`)}` }} />
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white border rounded-xl p-5 shadow-sm">
                        <h5 className="font-bold text-gray-800 mb-3 border-b pb-2">{t('g_s3_plant_highland_title')}</h5>
                        <ul className="text-sm text-gray-600 space-y-2">
                            {[1, 2].map(n => (
                                <li key={n} dangerouslySetInnerHTML={{ __html: `• ${t(`g_s3_plant_highland_${n}`)}` }} />
                            ))}
                        </ul>
                        <h5 className="font-bold text-gray-800 mb-2 mt-4 border-b pb-2">{t('g_s3_plant_method_title')}</h5>
                        <ul className="text-sm text-gray-600 space-y-2">
                            {[1, 2].map(n => (
                                <li key={n} dangerouslySetInnerHTML={{ __html: `• ${t(`g_s3_plant_method_${n}`)}` }} />
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section4Content({ t }) {
    return (
        <div className="space-y-8">
            <div>
                <h4 className="font-bold text-gray-900 mb-4 text-xl">{t('g_s4_estab_title')}</h4>
                <div className="overflow-x-auto border rounded-xl shadow-sm mb-3">
                    <table className="min-w-full text-sm">
                        <thead className="bg-emerald-100 font-bold text-emerald-900">
                            <tr>
                                {['g_s4_col_age', 'g_s4_col_times', 'g_s4_col_n', 'g_s4_col_p', 'g_s4_col_k', 'g_s4_col_urea', 'g_s4_col_super', 'g_s4_col_kali'].map(k => (
                                    <th key={k} className="px-4 py-3 text-left">{t(k)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-semibold">1</td><td className="px-4 py-3">6–9</td><td className="px-4 py-3">200–300</td><td className="px-4 py-3">100–200</td><td className="px-4 py-3">100–200</td><td className="px-4 py-3">435–652</td><td className="px-4 py-3">625–1,250</td><td className="px-4 py-3">200–400</td></tr>
                            <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-semibold">2</td><td className="px-4 py-3">4–6</td><td className="px-4 py-3">300–450</td><td className="px-4 py-3">200–300</td><td className="px-4 py-3">200–300</td><td className="px-4 py-3">652–978</td><td className="px-4 py-3">1,250–1,875</td><td className="px-4 py-3">400–600</td></tr>
                            <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-semibold">3</td><td className="px-4 py-3">4–6</td><td className="px-4 py-3">450–600</td><td className="px-4 py-3">300–400</td><td className="px-4 py-3">350–500</td><td className="px-4 py-3">978–1,304</td><td className="px-4 py-3">1,875–2,500</td><td className="px-4 py-3">700–1,000</td></tr>
                            <tr className="hover:bg-gray-50"><td className="px-4 py-3 font-semibold">4</td><td className="px-4 py-3">4</td><td className="px-4 py-3">700–900</td><td className="px-4 py-3">400–500</td><td className="px-4 py-3">600–700</td><td className="px-4 py-3">1,522–1,957</td><td className="px-4 py-3">2,500–3,125</td><td className="px-4 py-3">1,200–1,400</td></tr>
                        </tbody>
                    </table>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-sm text-gray-600">
                    {[1, 2, 3].map(n => (
                        <p key={n} className={n > 1 ? 'mt-1' : ''} dangerouslySetInnerHTML={{ __html: `• ${t(`g_s4_estab_note_${n}`)}` }} />
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-bold text-gray-900 mb-4 text-xl">{t('g_s4_prod_title')}</h4>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4 text-sm text-gray-700">
                    {[1, 2].map(n => (
                        <p key={n} className={n > 1 ? 'mt-1' : ''} dangerouslySetInnerHTML={{ __html: t(`g_s4_prod_summary_${n}`) }} />
                    ))}
                </div>
                <div className="overflow-x-auto border rounded-xl shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="bg-emerald-100 font-bold text-emerald-900">
                            <tr>
                                <th className="px-4 py-3 text-left">{t('g_s4_col_stage')}</th>
                                <th className="px-4 py-3 text-left">{t('g_s4_col_timing')}</th>
                                <th className="px-4 py-3 text-center">N (%)</th>
                                <th className="px-4 py-3 text-center">P₂O₅ (%)</th>
                                <th className="px-4 py-3 text-center">K₂O (%)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            <tr className="bg-green-50"><td className="px-4 py-3 font-bold" colSpan={2}>{t('g_s4_batch1_title')}</td><td className="px-4 py-3 text-center font-bold">36</td><td className="px-4 py-3 text-center font-bold">24</td><td className="px-4 py-3 text-center font-bold">15</td></tr>
                            <tr className="hover:bg-gray-50"><td className="px-4 py-3 pl-8 text-gray-500">→ {t('g_s4_app')} 1</td><td className="px-4 py-3">{t('g_s4_batch1_t1')}</td><td className="px-4 py-3 text-center">12</td><td className="px-4 py-3 text-center">8</td><td className="px-4 py-3 text-center">5</td></tr>
                            <tr className="hover:bg-gray-50"><td className="px-4 py-3 pl-8 text-gray-500">→ {t('g_s4_app')} 2</td><td className="px-4 py-3">{t('g_s4_batch1_t2')}</td><td className="px-4 py-3 text-center">12</td><td className="px-4 py-3 text-center">8</td><td className="px-4 py-3 text-center">5</td></tr>
                            <tr className="hover:bg-gray-50"><td className="px-4 py-3 pl-8 text-gray-500">→ {t('g_s4_app')} 3</td><td className="px-4 py-3">{t('g_s4_batch1_t3')}</td><td className="px-4 py-3 text-center">12</td><td className="px-4 py-3 text-center">8</td><td className="px-4 py-3 text-center">5</td></tr>
                            <tr className="bg-yellow-50"><td className="px-4 py-3 font-bold" colSpan={2}>{t('g_s4_batch2_title')}</td><td className="px-4 py-3 text-center font-bold">8</td><td className="px-4 py-3 text-center font-bold">40</td><td className="px-4 py-3 text-center font-bold">21</td></tr>
                            <tr className="bg-orange-50"><td className="px-4 py-3 font-bold" colSpan={2}>{t('g_s4_batch3_title')}</td><td className="px-4 py-3 text-center font-bold">30</td><td className="px-4 py-3 text-center font-bold">18</td><td className="px-4 py-3 text-center font-bold">30</td></tr>
                            <tr className="hover:bg-gray-50"><td className="px-4 py-3 pl-8 text-gray-500">→ {t('g_s4_app')} 1</td><td className="px-4 py-3">{t('g_s4_batch3_t1')}</td><td className="px-4 py-3 text-center">12</td><td className="px-4 py-3 text-center">8</td><td className="px-4 py-3 text-center">5</td></tr>
                            <tr className="hover:bg-gray-50"><td className="px-4 py-3 pl-8 text-gray-500">→ {t('g_s4_app')} 2</td><td className="px-4 py-3">{t('g_s4_batch3_t2')}</td><td className="px-4 py-3 text-center">12</td><td className="px-4 py-3 text-center">8</td><td className="px-4 py-3 text-center">5</td></tr>
                            <tr className="hover:bg-gray-50"><td className="px-4 py-3 pl-8 text-gray-500">→ {t('g_s4_app')} 3</td><td className="px-4 py-3">{t('g_s4_batch3_t3')}</td><td className="px-4 py-3 text-center">6</td><td className="px-4 py-3 text-center">2</td><td className="px-4 py-3 text-center">20</td></tr>
                            <tr className="bg-blue-50"><td className="px-4 py-3 font-bold" colSpan={2}>{t('g_s4_batch4_title')}</td><td className="px-4 py-3 text-center font-bold">26</td><td className="px-4 py-3 text-center font-bold">18</td><td className="px-4 py-3 text-center font-bold">21</td></tr>
                            <tr className="hover:bg-gray-50"><td className="px-4 py-3 pl-8 text-gray-500">→ {t('g_s4_app')} 1</td><td className="px-4 py-3">{t('g_s4_batch4_t1')}</td><td className="px-4 py-3 text-center">6</td><td className="px-4 py-3 text-center">2</td><td className="px-4 py-3 text-center">7</td></tr>
                            <tr className="hover:bg-gray-50"><td className="px-4 py-3 pl-8 text-gray-500">→ {t('g_s4_app')} 2</td><td className="px-4 py-3">{t('g_s4_batch4_t2')}</td><td className="px-4 py-3 text-center">12</td><td className="px-4 py-3 text-center">8</td><td className="px-4 py-3 text-center">5</td></tr>
                            <tr className="hover:bg-gray-50"><td className="px-4 py-3 pl-8 text-gray-500">→ {t('g_s4_app')} 3</td><td className="px-4 py-3">{t('g_s4_batch4_t3')}</td><td className="px-4 py-3 text-center">8</td><td className="px-4 py-3 text-center">8</td><td className="px-4 py-3 text-center">9</td></tr>
                            <tr className="bg-red-50"><td className="px-4 py-3 font-bold text-red-700" colSpan={2}>{t('g_s4_batch5_title')}</td><td className="px-4 py-3 text-center font-bold text-red-700">0</td><td className="px-4 py-3 text-center font-bold text-red-700">0</td><td className="px-4 py-3 text-center font-bold text-red-700">13</td></tr>
                        </tbody>
                    </table>
                    <p className="text-xs text-gray-500 p-3 bg-gray-50 flex items-center gap-1 italic">
                        <Info className="w-3 h-3" /> {t('g_s4_table_source')}
                    </p>
                </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-r-xl">
                <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2 text-lg">
                    <ShieldCheck className="w-5 h-5" /> {t('g_s4_rules_title')}
                </h4>
                <ul className="text-sm text-gray-700 space-y-2">
                    {[1, 2, 3, 4].map(n => (
                        <li key={n} className="flex gap-2">
                            <ChevronRight className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <span dangerouslySetInnerHTML={{ __html: t(`g_s4_rule_${n}`) }} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function Section5Content({ t }) {
    return (
        <div className="space-y-8">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-xl shadow-sm">
                <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-4 text-lg">
                    <AlertTriangle className="w-6 h-6" /> {t('g_s5_hazard_title')}
                </h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm bg-white rounded-lg overflow-hidden">
                        <thead className="bg-blue-100 font-bold text-blue-900">
                            <tr>
                                <th className="px-4 py-3 text-left">{t('g_table_hazard_type')}</th>
                                <th className="px-4 py-3 text-left">{t('g_table_origin')}</th>
                                <th className="px-4 py-3 text-left">{t('g_table_control')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {['chem', 'bio'].map(type => (
                                <tr key={type} className="hover:bg-gray-50">
                                    <td className={`px-4 py-3 font-semibold text-${type === 'chem' ? 'red' : 'yellow'}-700`}>
                                        {t(`g_s5_hazard_${type}_name`)}<br />
                                        <span className="text-xs font-normal text-gray-500">{t(`g_s5_hazard_${type}_sub`)}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">{t(`g_s5_hazard_${type}_origin`)}</td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">{t(`g_s5_hazard_${type}_control`)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <h5 className="font-bold text-gray-800 mb-3 border-b pb-2 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-blue-600" /> {t('g_s5_rules_title')}
                    </h5>
                    <ul className="text-sm text-gray-600 space-y-2">
                        {[1, 2, 3, 4].map(n => (
                            <li key={n} dangerouslySetInnerHTML={{ __html: `• ${t(`g_s5_rule_${n}`)}` }} />
                        ))}
                    </ul>
                </div>
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <h5 className="font-bold text-gray-800 mb-3 border-b pb-2 flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-blue-600" /> {t('g_s5_irr_title')}
                    </h5>
                    <ul className="text-sm text-gray-600 space-y-2">
                        {[1, 2, 3, 4].map(n => (
                            <li key={n} dangerouslySetInnerHTML={{ __html: `• ${t(`g_s5_irr_${n}`)}` }} />
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function Section6Content({ t }) {
    return (
        <div className="space-y-8">
            <div className="bg-lime-50 p-5 rounded-xl border border-lime-200">
                <h4 className="font-bold text-lime-900 mb-3 text-lg flex items-center gap-2">
                    <Scissors className="w-5 h-5" /> {t('g_s6_canopy_title')}
                </h4>
                <div className="grid md:grid-cols-2 gap-5 text-sm text-gray-700">
                    <div>
                        <p className="font-semibold mb-2">{t('g_s6_canopy_estab_label')}</p>
                        <ul className="space-y-1 list-disc pl-4">
                            {[1, 2, 3].map(n => <li key={n}>{t(`g_s6_canopy_estab_${n}`)}</li>)}
                        </ul>
                    </div>
                    <div>
                        <p className="font-semibold mb-2">{t('g_s6_canopy_prod_label')}</p>
                        <ul className="space-y-1 list-disc pl-4">
                            {[1, 2, 3].map(n => <li key={n} dangerouslySetInnerHTML={{ __html: t(`g_s6_canopy_prod_${n}`) }} />)}
                        </ul>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="font-bold text-gray-900 mb-4 text-xl">{t('g_s6_flower_title')}</h4>
                <div className="grid md:grid-cols-2 gap-5">
                    {[1, 2, 3, 4].map(n => {
                        const colors = ['emerald', 'yellow', 'orange', 'blue'];
                        const color = colors[n - 1];
                        return (
                            <div key={n} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-5`}>
                                <div className={`bg-${color}-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-2`}>
                                    {t(`g_s6_step_${n}_label`)}
                                </div>
                                <h5 className="font-bold text-gray-800 mb-2">{t(`g_s6_step_${n}_title`)}</h5>
                                <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
                                    {[1, 2, 3].map(i => {
                                        const val = t(`g_s6_step_${n}_item_${i}`);
                                        return val && val !== `g_s6_step_${n}_item_${i}` ? <li key={i}>{val}</li> : null;
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </div>
                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1 italic">
                    <Info className="w-3 h-3" /> {t('g_s6_flower_source')}
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <h5 className="font-bold text-gray-800 mb-3 border-b pb-2">{t('g_s6_pollinate_title')}</h5>
                    <ul className="text-sm text-gray-600 space-y-2">
                        {[1, 2, 3].map(n => (
                            <li key={n} dangerouslySetInnerHTML={{ __html: `• ${t(`g_s6_pollinate_${n}`)}` }} />
                        ))}
                    </ul>
                </div>
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <h5 className="font-bold text-gray-800 mb-3 border-b pb-2">{t('g_s6_thin_title')}</h5>
                    <ul className="text-sm text-gray-600 space-y-2">
                        {[1, 2, 3].map(n => (
                            <li key={n} dangerouslySetInnerHTML={{ __html: `• ${t(`g_s6_thin_${n}`)}` }} />
                        ))}
                    </ul>
                </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-xl">
                <h4 className="font-bold text-amber-900 mb-3 text-lg flex items-center gap-2">
                    <Stethoscope className="w-5 h-5" /> {t('g_s6_fix_title')}
                </h4>
                <ul className="text-sm text-gray-700 space-y-2 list-disc pl-4">
                    {[1, 2, 3, 4, 5].map(n => (
                        <li key={n} dangerouslySetInnerHTML={{ __html: t(`g_s6_fix_${n}`) }} />
                    ))}
                </ul>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-xl">
                <h4 className="font-bold text-blue-900 mb-3 text-lg flex items-center gap-2">
                    <CloudRain className="w-5 h-5" /> {t('g_s6_saline_title')}
                </h4>
                <div className="grid md:grid-cols-2 gap-5 text-sm text-gray-700">
                    <div>
                        <p className="font-semibold mb-2">{t('g_s6_saline_before_label')}</p>
                        <ul className="space-y-1 list-disc pl-4">
                            {[1, 2, 3, 4, 5].map(n => (
                                <li key={n} dangerouslySetInnerHTML={{ __html: t(`g_s6_saline_before_${n}`) }} />
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="font-semibold mb-2">{t('g_s6_saline_recover_label')}</p>
                        <ul className="space-y-1 list-disc pl-4">
                            {[1, 2, 3, 4, 5].map(n => (
                                <li key={n} dangerouslySetInnerHTML={{ __html: t(`g_s6_saline_recover_${n}`) }} />
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section7Content({ t }) {
    const pestRows = [
        { nameKey: 'g_s7_pest1_name', sciKey: 'g_s7_pest1_sci', descKey: 'g_s7_pest1_desc', mgmtKeys: [1, 2, 3] },
        { nameKey: 'g_s7_pest2_name', sciKey: 'g_s7_pest2_sci', descKey: 'g_s7_pest2_desc', mgmtKeys: [1, 2, 3] },
        { nameKey: 'g_s7_pest3_name', sciKey: 'g_s7_pest3_sci', descKey: 'g_s7_pest3_desc', mgmtKeys: [1, 2, 3] },
        { nameKey: 'g_s7_pest4_name', sciKey: 'g_s7_pest4_sci', descKey: 'g_s7_pest4_desc', mgmtKeys: [1, 2, 3] },
        { nameKey: 'g_s7_pest5_name', sciKey: 'g_s7_pest5_sci', descKey: 'g_s7_pest5_desc', mgmtKeys: [1, 2, 3] },
        { nameKey: 'g_s7_pest6_name', sciKey: 'g_s7_pest6_sci', descKey: 'g_s7_pest6_desc', mgmtKeys: [1, 2, 3] },
        { nameKey: 'g_s7_pest7_name', sciKey: 'g_s7_pest7_sci', descKey: 'g_s7_pest7_desc', mgmtKeys: [1, 2, 3] },
    ];

    const diseaseRows = [
        { nameKey: 'g_s7_dis1_name', descKey: 'g_s7_dis1_desc', mgmtKeys: [1, 2, 3, 4, 5] },
        { nameKey: 'g_s7_dis2_name', descKey: 'g_s7_dis2_desc', mgmtKeys: [1] },
        { nameKey: 'g_s7_dis3_name', descKey: 'g_s7_dis3_desc', mgmtKeys: [1] },
        { nameKey: 'g_s7_dis4_name', descKey: 'g_s7_dis4_desc', mgmtKeys: [1] },
        { nameKey: 'g_s7_dis5_name', descKey: 'g_s7_dis5_desc', mgmtKeys: [1, 2] },
    ];

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
                <h4 className="font-bold text-blue-900 mb-4 text-lg flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6" /> {t('g_s7_4right_title')}
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="bg-white p-4 rounded-lg border border-blue-100">
                            <h5 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                <span className="bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">{n}</span>
                                {t(`g_s7_right_${n}_title`)}
                            </h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                                {[1, 2].map(i => {
                                    const val = t(`g_s7_right_${n}_item_${i}`);
                                    return val && val !== `g_s7_right_${n}_item_${i}` ? <li key={i}>• {val}</li> : null;
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-bold text-gray-900 mb-4 text-xl">{t('g_s7_pest_title')}</h4>
                <div className="overflow-x-auto border rounded-xl shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 font-bold text-gray-800 uppercase">
                            <tr>
                                <th className="px-5 py-3 text-left w-1/4">{t('g_table_pest')}</th>
                                <th className="px-5 py-3 text-left w-1/3">{t('g_table_pest_desc')}</th>
                                <th className="px-5 py-3 text-left w-1/3">{t('g_table_pest_mgmt')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {pestRows.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-orange-600">
                                        {t(row.nameKey)}<br />
                                        <span className="text-xs font-normal text-gray-500 italic">{t(row.sciKey)}</span>
                                    </td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">{t(row.descKey)}</td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">
                                        <ul className="space-y-1">
                                            {row.mgmtKeys.map(i => {
                                                const val = t(`g_s7_pest${idx + 1}_mgmt_${i}`);
                                                return val && val !== `g_s7_pest${idx + 1}_mgmt_${i}` ? <li key={i}>• {val}</li> : null;
                                            })}
                                        </ul>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <h4 className="font-bold text-gray-900 mb-4 text-xl">{t('g_s7_disease_title')}</h4>
                <div className="overflow-x-auto border rounded-xl shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="bg-red-50 font-bold text-red-900 uppercase">
                            <tr>
                                <th className="px-5 py-3 text-left">{t('g_table_disease')}</th>
                                <th className="px-5 py-3 text-left">{t('g_table_disease_desc')}</th>
                                <th className="px-5 py-3 text-left">{t('g_table_pest_mgmt')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {diseaseRows.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-bold text-red-700">{t(row.nameKey)}</td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">{t(row.descKey)}</td>
                                    <td className="px-5 py-4 text-gray-700 text-xs">
                                        <ul className="space-y-1">
                                            {row.mgmtKeys.map(i => {
                                                const val = t(`g_s7_dis${idx + 1}_mgmt_${i}`);
                                                return val && val !== `g_s7_dis${idx + 1}_mgmt_${i}` ? <li key={i}>• {val}</li> : null;
                                            })}
                                        </ul>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 shadow-sm">
                <h4 className="font-bold text-red-800 mb-4 text-lg flex items-center gap-2">
                    <Trash2 className="w-5 h-5" /> {t('g_s7_waste_title')}
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <ul className="space-y-2">
                        {[1, 2, 3].map(n => (
                            <li key={n} dangerouslySetInnerHTML={{ __html: `• ${t(`g_s7_waste_left_${n}`)}` }} />
                        ))}
                    </ul>
                    <ul className="space-y-2">
                        <li className="text-red-600 font-bold flex items-center gap-2">
                            <XCircle className="w-4 h-4 flex-shrink-0" /> {t('g_s7_waste_never')}
                        </li>
                        {[2, 3].map(n => (
                            <li key={n} dangerouslySetInnerHTML={{ __html: `• ${t(`g_s7_waste_right_${n}`)}` }} />
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function Section8Content({ t }) {
    return (
        <div className="space-y-8">
            <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-xl shadow-md">
                <h3 className="text-xl font-bold text-red-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6" /> {t('g_s8_phi_title')}
                </h3>
                <div className="bg-white p-5 rounded-lg mb-4">
                    <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-500" /> {t('g_s8_phi_what')}
                    </h5>
                    <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                        {[1, 2, 3].map(n => (
                            <li key={n} dangerouslySetInnerHTML={{ __html: t(`g_s8_phi_${n}`) }} />
                        ))}
                    </ul>
                </div>
                <div className="bg-red-100 p-4 rounded-lg flex items-start gap-3">
                    <Flame className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800 font-bold text-sm">{t('g_s8_phi_warning')}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-stretch">
                <div className="bg-white border rounded-xl p-5 shadow-sm h-full flex flex-col">
                    <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-yellow-600" /> {t('g_s8_harvest_title')}
                    </h4>
                    <ul className="text-sm text-gray-600 list-disc pl-4 space-y-2 flex-1">
                        {[1, 2, 3, 4, 5].map(n => (
                            <li key={n} dangerouslySetInnerHTML={{ __html: t(`g_s8_harvest_${n}`) }} />
                        ))}
                    </ul>
                </div>
                <div className="bg-white border rounded-xl p-5 shadow-sm h-full flex flex-col">
                    <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-green-600" /> {t('g_s8_hygiene_title')}
                    </h4>
                    <ul className="text-sm text-gray-600 list-disc pl-4 space-y-2 flex-1">
                        {[1, 2, 3, 4, 5].map(n => (
                            <li key={n} dangerouslySetInnerHTML={{ __html: t(`g_s8_hygiene_${n}`) }} />
                        ))}
                    </ul>
                </div>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-400 p-5 rounded-r-xl">
                <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2 text-lg">
                    <AlertCircle className="w-5 h-5" /> {t('g_s8_hazard2_title')}
                </h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm bg-white rounded-lg overflow-hidden">
                        <thead className="bg-orange-100 font-bold text-orange-900">
                            <tr>
                                <th className="px-4 py-2 text-left">{t('g_table_hazard_type')}</th>
                                <th className="px-4 py-2 text-left">{t('g_table_origin')}</th>
                                <th className="px-4 py-2 text-left">{t('g_table_control')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {['chem', 'bio', 'phys'].map(type => (
                                <tr key={type}>
                                    <td className={`px-4 py-2 font-semibold text-${type === 'chem' ? 'red' : type === 'bio' ? 'yellow' : 'blue'}-700 text-xs`}>
                                        {t(`g_s8_hazard_${type}_name`)}
                                    </td>
                                    <td className="px-4 py-2 text-gray-600 text-xs">{t(`g_s8_hazard_${type}_origin`)}</td>
                                    <td className="px-4 py-2 text-gray-600 text-xs">{t(`g_s8_hazard_${type}_control`)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
                <h4 className="font-bold text-amber-900 mb-3 text-lg flex items-center gap-2">
                    <Package className="w-5 h-5" /> {t('g_s8_storage_title')}
                </h4>
                <div className="grid md:grid-cols-2 gap-5 text-sm text-gray-700">
                    <div>
                        <p className="font-semibold mb-2">{t('g_s8_storage_label')}</p>
                        <ul className="space-y-1 list-disc pl-4">
                            {[1, 2, 3].map(n => (
                                <li key={n} dangerouslySetInnerHTML={{ __html: t(`g_s8_storage_${n}`) }} />
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="font-semibold mb-2">{t('g_s8_transport_label')}</p>
                        <ul className="space-y-1 list-disc pl-4">
                            {[1, 2, 3].map(n => (
                                <li key={n} dangerouslySetInnerHTML={{ __html: t(`g_s8_transport_${n}`) }} />
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section9Content({ t }) {
    return (
        <div className="space-y-8">
            <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                <h3 className="text-2xl font-bold text-emerald-900 mb-2 text-center uppercase tracking-wide">
                    {t('g_s9_motto')}
                </h3>
                <p className="text-red-600 font-bold text-center mb-4 text-sm flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> {t('g_s9_warning')}
                </p>
                <p className="text-gray-700 mb-6 text-center max-w-2xl mx-auto text-sm">
                    {t('g_s9_intro')}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {[
                        { icon: <ClipboardList className="w-6 h-6" />, color: "blue", n: 1 },
                        { icon: <FileBadge className="w-6 h-6" />, color: "orange", n: 2 },
                        { icon: <TestTube className="w-6 h-6" />, color: "purple", n: 3 },
                        { icon: <ShieldCheck className="w-6 h-6" />, color: "green", n: 4 },
                    ].map(({ icon, color, n }) => (
                        <div key={n} className="bg-white p-5 rounded-xl flex items-start gap-4 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow h-full">
                            <div className={`p-3 bg-${color}-100 text-${color}-600 rounded-lg flex-shrink-0`}>{icon}</div>
                            <div>
                                <span className="block font-bold text-gray-800 text-lg mb-1">{t(`g_s9_form${n}_title`)}</span>
                                <p className="text-sm text-gray-600 mb-2">{t(`g_s9_form${n}_desc`)}</p>
                                <p className="text-xs text-red-600 font-medium">{t(`g_s9_form${n}_note`)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                    <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                        <Recycle className="w-5 h-5" /> {t('g_s9_emission_title')}
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-2 list-disc pl-4">
                        {[1, 2, 3].map(n => (
                            <li key={n} dangerouslySetInnerHTML={{ __html: t(`g_s9_emission_${n}`) }} />
                        ))}
                    </ul>
                </div>

                <p className="text-xs text-gray-500 mt-6 text-center flex items-center justify-center gap-1 italic">
                    <Info className="w-3 h-3" /> {t('g_s9_source')}
                </p>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function GuidePage() {
    const { t } = useLanguage();
    const [activeSection, setActiveSection] = useState("tong-quan-vietgap");

    const guideSections = [
        { id: "tong-quan-vietgap", titleKey: "guide_s1_title", descKey: "guide_s1_desc", icon: <ShieldCheck className="w-6 h-6" />, sourceKey: "guide_s1_source", Content: Section1Content },
        { id: "vung-san-xuat", titleKey: "guide_s2_title", descKey: "guide_s2_desc", icon: <MapPin className="w-6 h-6" />, sourceKey: "guide_s2_source", Content: Section2Content },
        { id: "cay-giong-trong", titleKey: "guide_s3_title", descKey: "guide_s3_desc", icon: <Sprout className="w-6 h-6" />, sourceKey: "guide_s3_source", Content: Section3Content },
        { id: "phan-bon-nuoc-tuoi", titleKey: "guide_s4_title", descKey: "guide_s4_desc", icon: <Layers className="w-6 h-6" />, sourceKey: "guide_s4_source", Content: Section4Content },
        { id: "nuoc-tuoi", titleKey: "guide_s5_title", descKey: "guide_s5_desc", icon: <Droplets className="w-6 h-6" />, sourceKey: "guide_s5_source", Content: Section5Content },
        { id: "tao-tan-xu-ly-ra-hoa", titleKey: "guide_s6_title", descKey: "guide_s6_desc", icon: <Scissors className="w-6 h-6" />, sourceKey: "guide_s6_source", Content: Section6Content },
        { id: "quan-ly-sau-benh", titleKey: "guide_s7_title", descKey: "guide_s7_desc", icon: <Bug className="w-6 h-6" />, sourceKey: "guide_s7_source", Content: Section7Content },
        { id: "thu-hoach", titleKey: "guide_s8_title", descKey: "guide_s8_desc", icon: <Package className="w-6 h-6" />, sourceKey: "guide_s8_source", Content: Section8Content },
        { id: "nhat-ky-vietgap", titleKey: "guide_s9_title", descKey: "guide_s9_desc", icon: <ClipboardCheck className="w-6 h-6" />, sourceKey: "guide_s9_source", Content: Section9Content },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 200;
            for (const section of guideSections) {
                const element = document.getElementById(section.id);
                if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
                    setActiveSection(section.id);
                }
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const navbarHeight = 100;
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: elementPosition - navbarHeight, behavior: "smooth" });
            setActiveSection(id);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />

            {/* Hero */}
            <section className="bg-emerald-500 pt-40 pb-20 px-4">
                <div className="max-w-[1400px] mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {t('guide_hero_title')}
                    </h1>
                    <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
                        {t('guide_hero_subtitle')}
                    </p>
                </div>
            </section>

            <main className="max-w-8xl mx-auto px-4 md:px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">

                    {/* Sidebar */}
                    <aside className="hidden lg:block h-fit sticky top-28 z-10">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm tracking-wide">
                                <BookOpen className="w-4 h-4 text-emerald-600" /> {t('guide_toc_label')}
                            </h3>
                            <nav className="space-y-2">
                                {guideSections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 text-left border-l-4 ${activeSection === section.id
                                            ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm"
                                            : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                    >
                                        <span className={`flex-shrink-0 ${activeSection === section.id ? "text-emerald-600" : "text-gray-400"}`}>
                                            {section.icon}
                                        </span>
                                        <span className="truncate">{t(section.titleKey)}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="space-y-8">
                        {/* Mobile select */}
                        <div className="lg:hidden sticky top-20 z-20 bg-gray-50 pb-2">
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                onChange={(e) => scrollToSection(e.target.value)}
                                value={activeSection}
                            >
                                {guideSections.map((s) => (
                                    <option key={s.id} value={s.id}>{t(s.titleKey)}</option>
                                ))}
                            </select>
                        </div>

                        {guideSections.map((section) => {
                            const { Content } = section;
                            return (
                                <section
                                    key={section.id}
                                    id={section.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden scroll-mt-32 transition-all duration-300 hover:shadow-md"
                                >
                                    <div className="p-6 md:p-8">
                                        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-100">
                                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                                {section.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h2 className="text-2xl font-bold text-gray-900">{t(section.titleKey)}</h2>
                                                <p className="text-gray-500 mt-1 text-sm">{t(section.descKey)}</p>
                                                {section.sourceKey && (
                                                    <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                                                        <BookOpen className="w-3 h-3 flex-shrink-0" />
                                                        <span className="italic">{t('guide_source_label')}: {t(section.sourceKey)}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="prose prose-emerald max-w-none text-gray-600">
                                            <Content t={t} />
                                        </div>
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* References footer */}
            <section className="bg-gray-100 py-8 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                        {t('guide_ref_title')}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
                        {[1, 2, 3, 4, 5, 6].map(n => (
                            <div key={n} className="flex items-start gap-2">
                                <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                <span dangerouslySetInnerHTML={{ __html: t(`guide_ref_${n}`) }} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}