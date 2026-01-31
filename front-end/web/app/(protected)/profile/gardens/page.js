"use client";
import { useState } from "react";

import { Plus, MapPin, Ruler, Sprout, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ProfileGarden() {
  let gardens = [
    {
      id: "1",
      name: "Sunrise Vegetable Garden",
      crop_type: "Vegetables",
      area: 250,
      location: "Portland, Oregon",
      longitude: -122.6765,
      latitude: 45.5231,
      description:
        "A thriving vegetable garden with tomatoes, peppers, and leafy greens. Perfect southern exposure with rich, well-draining soil.",
      imageUrl:
        "https://images.unsplash.com/photo-1768821636043-71615bde9300?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdldGFibGUlMjBnYXJkZW4lMjB0b21hdG9lcyUyMHBlcHBlcnN8ZW58MXx8fHwxNzY5ODQ4ODg5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: "2",
      name: "Herb & Spice Corner",
      crop_type: "Herbs",
      area: 85,
      location: "Seattle, Washington",
      longitude: -122.3321,
      latitude: 47.6062,
      description:
        "Small but productive herb garden featuring basil, rosemary, thyme, and mint. Located near the kitchen for easy access.",
      imageUrl:
        "https://images.unsplash.com/photo-1711460994747-c153f49f6c0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJiJTIwZ2FyZGVuJTIwYmFzaWwlMjByb3NlbWFyeXxlbnwxfHx8fDE3Njk4NDg4OTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: "3",
      name: "Berry Patch",
      crop_type: "Berries",
      area: 180,
      location: "Eugene, Oregon",
      longitude: -123.0868,
      latitude: 44.0521,
      description:
        "Mixed berry garden with strawberries, raspberries, and blueberries. Includes a drip irrigation system for optimal growth.",
      imageUrl:
        "https://images.unsplash.com/photo-1760119842325-4d174683f1b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZXJyeSUyMGdhcmRlbiUyMHN0cmF3YmVycmllcyUyMHJhc3BiZXJyaWVzfGVufDF8fHx8MTc2OTg0ODg5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: "4",
      name: "Mediterranean Garden",
      crop_type: "Mixed",
      area: 320,
      location: "San Francisco, California",
      longitude: -122.4194,
      latitude: 37.7749,
      description:
        "Drought-tolerant garden featuring olive trees, lavender, artichokes, and various Mediterranean vegetables.",
      imageUrl:
        "https://images.unsplash.com/photo-1758818710855-b60cf3b74de6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGVycmFuZWFuJTIwZ2FyZGVuJTIwbGF2ZW5kZXIlMjBvbGl2ZXxlbnwxfHx8fDE3Njk4NDg4OTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: "5",
      name: "Orchard Grove",
      crop_type: "Fruit Trees",
      area: 1200,
      location: "Boise, Idaho",
      longitude: -116.2023,
      latitude: 43.615,
      description:
        "Small orchard with apple, pear, and cherry trees. Established 5 years ago and now producing abundant fruit.",
      imageUrl:
        "https://images.unsplash.com/photo-1729261747934-ac694a08bfba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcnVpdCUyMG9yY2hhcmQlMjBhcHBsZSUyMHRyZWVzfGVufDF8fHx8MTc2OTg0ODg5MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: "6",
      name: "Container Garden",
      crop_type: "Vegetables",
      area: 45,
      location: "Denver, Colorado",
      longitude: -104.9903,
      latitude: 39.7392,
      description:
        "Urban balcony garden using containers and grow bags. Great for beginners with limited space.",
      imageUrl:
        "https://images.unsplash.com/photo-1765341448392-ff514e0900a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250YWluZXIlMjBnYXJkZW4lMjBiYWxjb255JTIwdXJiYW58ZW58MXx8fHwxNzY5ODQ4ODkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Gardens</h1>
              <p className="text-gray-600 mt-1">
                Manage and monitor all your garden spaces
              </p>
            </div>
            <Link
              href="/profile/gardens/create"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create New Garden
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {gardens.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <Sprout className="w-16 h-16 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No gardens yet
            </h2>
            <p className="text-gray-600 text-center max-w-md mb-8">
              Start your gardening journey by creating your first garden space.
              Track your crops, monitor growth, and cultivate success!
            </p>
            <Link
              href={"/profile/gardens/create"}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create Your First Garden
            </Link>
          </div>
        ) : (
          /* Garden Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gardens.map((garden) => (
              <GardenCard key={garden.id} garden={garden} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GardenCard({ garden }) {
  return (
    <Link
      href={`/profile/gardens/details`}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 duration-300 group"
    >
      {/* Card Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={garden.imageUrl}
          alt={garden.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        {/* Crop Type Badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-700 shadow-sm">
            {garden.crop_type}
          </span>
        </div>

        {/* Garden Name Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white drop-shadow-lg">
            {garden.name}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2 text-gray-700">
          <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-sm">{garden.location}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Ruler className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-sm">
            {garden.area} m² ({Math.round(garden.area * 10.764)} ft²)
          </span>
        </div>

        {/* View Details Button */}
        <div className="pt-2">
          <div className="w-full inline-flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-lg font-medium group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            View Details
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
