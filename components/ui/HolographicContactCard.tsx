'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  MapPin, 
  Calendar,
  TrendingUp,
  Users,
  Target,
  Sparkles,
  ArrowRight,
  Coffee,
  Link
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactInsight {
  type: 'personality' | 'relationship' | 'opportunity' | 'action';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

interface ContactProps {
  contact: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    company?: any;
    position?: string;
    avatar?: string;
    location?: string;
    influence_score?: number;
    connection_count?: number;
    last_interaction?: string;
    relationship_strength?: number;
    tags?: string[];
    deals_influenced?: number;
    linkedin_url?: string;
  };
  insights?: ContactInsight[];
  onRequestIntro?: () => void;
  onScheduleMeeting?: () => void;
  onViewNetwork?: () => void;
}

export function HolographicContactCard({ 
  contact, 
  insights = [],
  onRequestIntro,
  onScheduleMeeting,
  onViewNetwork
}: ContactProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<number | null>(null);

  const relationshipHealth = contact.relationship_strength || 75;
  const influenceLevel = contact.influence_score || 0;

  // Calculate activity status
  const getActivityStatus = () => {
    if (!contact.last_interaction) return { color: 'bg-gray-500', pulse: false, text: 'No recent activity' };
    
    const lastInteraction = new Date(contact.last_interaction);
    const daysSince = Math.floor((Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince < 7) return { color: 'bg-green-500', pulse: true, text: 'Active' };
    if (daysSince < 30) return { color: 'bg-yellow-500', pulse: false, text: 'Recent' };
    return { color: 'bg-red-500', pulse: false, text: 'Needs attention' };
  };

  const activityStatus = getActivityStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      {/* Holographic Background Effect */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500",
        isHovered && "opacity-100"
      )}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-gradient" />
      </div>

      {/* Main Card */}
      <div className="relative glass-holographic rounded-2xl p-6 transition-all duration-300">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            {/* Avatar with Activity Ring */}
            <div className="relative">
              <motion.div
                animate={activityStatus.pulse ? {
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className={cn(
                  "absolute inset-0 rounded-full",
                  activityStatus.color,
                  "blur-md"
                )}
              />
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/20">
                {contact.avatar ? (
                  <img src={contact.avatar} alt={contact.first_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              {/* Influence Badge */}
              {influenceLevel > 80 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* Name and Title */}
            <div>
              <h3 className="text-xl font-semibold text-white">
                {contact.first_name} {contact.last_name}
              </h3>
              <p className="text-sm text-gray-400">
                {contact.position || 'Professional'}
                {contact.company && ` at ${contact.company.name || contact.company}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">{activityStatus.text}</p>
            </div>
          </div>

          {/* Connection Count */}
          {contact.connection_count && (
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{contact.connection_count}</p>
              <p className="text-xs text-gray-400">connections</p>
            </div>
          )}
        </div>

        {/* Relationship Strength Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Relationship Strength</span>
            <span className="text-xs text-white font-medium">{relationshipHealth}%</span>
          </div>
          <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${relationshipHealth}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full",
                relationshipHealth > 70 ? "bg-gradient-to-r from-green-400 to-emerald-500" :
                relationshipHealth > 40 ? "bg-gradient-to-r from-yellow-400 to-orange-500" :
                "bg-gradient-to-r from-red-400 to-pink-500"
              )}
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          {contact.email && (
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{contact.phone}</span>
            </div>
          )}
          {contact.location && (
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{contact.location}</span>
            </div>
          )}
        </div>

        {/* AI Insights */}
        {insights.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Sparkles className="w-4 h-4 text-purple-400 mr-1" />
              <span className="text-sm font-medium text-white">AI Insights</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedInsight || 0}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20"
              >
                <p className="text-sm text-gray-300">
                  {insights[selectedInsight || 0]?.message || "Click to see insights"}
                </p>
              </motion.div>
            </AnimatePresence>
            {insights.length > 1 && (
              <div className="flex space-x-1 mt-2">
                {insights.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedInsight(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      selectedInsight === index 
                        ? "bg-purple-400 w-6" 
                        : "bg-gray-600 hover:bg-gray-500"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Smart Actions */}
        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onScheduleMeeting}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg border border-indigo-500/30 transition-all"
          >
            <Coffee className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-indigo-300">Schedule Coffee</span>
          </motion.button>

          {contact.connection_count && contact.connection_count > 100 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRequestIntro}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg border border-purple-500/30 transition-all"
            >
              <Link className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">Request Intro</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onViewNetwork}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg border border-cyan-500/30 transition-all"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-300">View Network</span>
          </motion.button>
        </div>

        {/* Hover Effect Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-2xl pointer-events-none"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-transparent to-white/5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}