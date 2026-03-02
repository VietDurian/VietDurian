"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function FarmerHome() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />
            <div className="flex-1 pt-28 px-8">
                <h1 className="text-3xl font-bold text-emerald-700">Trang chủ Trader</h1>
            </div>
            <Footer />
        </div>
    );
}