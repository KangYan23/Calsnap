"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Utensils, Calculator, TrendingUp, Calendar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

const cn = (
  ...classes: Array<string | undefined | null | false>
) => classes.filter(Boolean).join(" ");

interface FloatingShapeProps {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}

function FloatingShape({
  className = "",
  delay = 0,
  width = 200,
  height = 60,
  rotate = 0,
  gradient = "from-green-400/20",
}: FloatingShapeProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -100,
        rotate: rotate - 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
      }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient} backdrop-blur-sm border border-white/20 shadow-lg`}
        />
      </motion.div>
    </motion.div>
  );
}

interface CalorieRecord {
  _id: string;
  input: {
    sex: string;
    age: number;
    height: number;
    weight: number;
    activityLevel: string;
  };
  result: {
    bmr: number;
    tdee: number;
    maxCalories: number;
  };
  createdAt: string;
}

interface MealRecord {
  _id: string;
  mealType: string;
  analysis: {
    foodItems: Array<{
      name: string;
      estimatedCalories: number;
      confidence: number;
      quantity?: string;
    }>;
    totalCalories: number;
    analysisConfidence: number;
  };
  createdAt: string;
}

export default function DashboardPage() {
  const [calorieRecords, setCalorieRecords] = useState<CalorieRecord[]>([]);
  const [mealRecords, setMealRecords] = useState<MealRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'calories' | 'meals'>('calories');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [caloriesResponse, mealsResponse] = await Promise.all([
        fetch('/api/calories?limit=20'),
        fetch('/api/meals?limit=20')
      ]);

      const caloriesData = await caloriesResponse.json();
      const mealsData = await mealsResponse.json();

      if (caloriesData.success) {
        setCalorieRecords(caloriesData.data);
      }
      if (mealsData.success) {
        setMealRecords(mealsData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      sedentary: 'Sedentary',
      light: 'Light',
      moderate: 'Moderate',
      active: 'Active',
      very_active: 'Very Active'
    };
    return labels[level] || level;
  };

  const getMealTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      dessert: 'Dessert'
    };
    return labels[type] || type;
  };

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.3 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50 pt-16">
      {/* Floating Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingShape
          delay={0.2}
          width={300}
          height={80}
          rotate={15}
          gradient="from-green-300/30"
          className="left-[-5%] top-[20%]"
        />
        
        <FloatingShape
          delay={0.4}
          width={250}
          height={70}
          rotate={-12}
          gradient="from-blue-300/30"
          className="right-[-3%] top-[70%]"
        />
        
        <FloatingShape
          delay={0.3}
          width={180}
          height={50}
          rotate={8}
          gradient="from-green-400/25"
          className="left-[10%] bottom-[15%]"
        />
        
        <FloatingShape
          delay={0.5}
          width={120}
          height={40}
          rotate={-20}
          gradient="from-blue-400/25"
          className="right-[20%] top-[15%]"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 border border-green-200/50 mb-6 shadow-sm backdrop-blur-sm">
              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm text-green-700 font-medium">
                Data Dashboard
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">
                Your Health
              </span>
              <br />
              <span className="text-gray-800">Data Overview</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Track your calorie calculations and meal analyses
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/60">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Calorie Calculations</h3>
              </div>
              <div className="text-3xl font-bold text-green-600">{calorieRecords.length}</div>
              <div className="text-sm text-gray-600">Total calculations</div>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/60">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Meal Analyses</h3>
              </div>
              <div className="text-3xl font-bold text-blue-600">{mealRecords.length}</div>
              <div className="text-sm text-gray-600">Total meals analyzed</div>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/60">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Total Records</h3>
              </div>
              <div className="text-3xl font-bold text-purple-600">{calorieRecords.length + mealRecords.length}</div>
              <div className="text-sm text-gray-600">All data entries</div>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/80 backdrop-blur-md rounded-2xl p-2 shadow-xl border border-white/60 mb-8"
          >
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('calories')}
                className={cn(
                  "flex-1 py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2",
                  activeTab === 'calories'
                    ? "bg-green-500 text-white shadow-lg"
                    : "text-gray-600 hover:bg-green-50"
                )}
              >
                <Calculator className="w-4 h-4" />
                Calorie Calculations
              </button>
              <button
                onClick={() => setActiveTab('meals')}
                className={cn(
                  "flex-1 py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2",
                  activeTab === 'meals'
                    ? "bg-green-500 text-white shadow-lg"
                    : "text-gray-600 hover:bg-green-50"
                )}
              >
                <Utensils className="w-4 h-4" />
                Meal Analyses
              </button>
            </div>
          </motion.div>

          {/* Data Tables */}
          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/60"
          >
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading data...</p>
              </div>
            ) : activeTab === 'calories' ? (
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Calorie Calculation Records</h3>
                {calorieRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No calorie calculations found</p>
                    <p className="text-sm text-gray-500 mt-2">Use the calculator to create your first calculation</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {calorieRecords.map((record) => (
                      <div key={record._id} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{formatDate(record.createdAt)}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.input.sex === 'male' ? '👨' : '👩'} {record.input.age} years
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-4 gap-4">
                          <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                            <div className="text-lg font-bold text-green-600">{record.result.bmr}</div>
                            <div className="text-xs text-green-700">BMR</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                            <div className="text-lg font-bold text-blue-600">{record.result.tdee}</div>
                            <div className="text-xs text-blue-700">TDEE</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-purple-50 border border-purple-200">
                            <div className="text-lg font-bold text-purple-600">{record.result.maxCalories}</div>
                            <div className="text-xs text-purple-700">Max Calories</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-orange-50 border border-orange-200">
                            <div className="text-lg font-bold text-orange-600">{getActivityLevelLabel(record.input.activityLevel)}</div>
                            <div className="text-xs text-orange-700">Activity Level</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Meal Analysis Records</h3>
                {mealRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No meal analyses found</p>
                    <p className="text-sm text-gray-500 mt-2">Upload photos to analyze your meals</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mealRecords.map((record) => (
                      <div key={record._id} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{formatDate(record.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                              {getMealTypeLabel(record.mealType)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {Math.round(record.analysis.analysisConfidence * 100)}% confidence
                            </span>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-green-600" />
                            <span className="text-lg font-bold text-green-600">{record.analysis.totalCalories}</span>
                            <span className="text-gray-600">Total Calories</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">Food Items:</h4>
                          {record.analysis.foodItems.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100">
                              <div>
                                <span className="font-medium text-gray-800">{item.name}</span>
                                {item.quantity && (
                                  <span className="text-sm text-gray-500 ml-2">({item.quantity})</span>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-green-600">{item.estimatedCalories} cal</span>
                                <div className="text-xs text-gray-500">
                                  {Math.round(item.confidence * 100)}% confidence
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Refresh Button */}
          <motion.div
            custom={4}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="text-center mt-8"
          >
            <Button
              onClick={fetchData}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Refreshing...
                </div>
              ) : (
                'Refresh Data'
              )}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/20 pointer-events-none" />
    </div>
  );
}
