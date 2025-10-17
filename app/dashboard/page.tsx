"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Utensils, 
  Calculator, 
  Calendar, 
  Target,
  Users,
  Scale,
  Zap,
  TrendingUp,
  Plus,
  Activity,
  Heart,
  ArrowUp,
  ArrowDown
} from "lucide-react";

interface CalorieRecord {
  _id: string;
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
    totalCalories: number;
    analysisConfidence: number;
    foodItems: Array<{
      name: string;
      estimatedCalories: number;
      confidence: number;
      quantity?: string;
    }>;
  };
  createdAt: string;
}

interface WeightRecord {
  _id: string;
  weight: number;
  notes?: string;
  recordedAt: string;
  createdAt: string;
}

export default function Dashboard() {
  const [calorieRecords, setCalorieRecords] = useState<CalorieRecord[]>([]);
  const [mealRecords, setMealRecords] = useState<MealRecord[]>([]);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newWeight, setNewWeight] = useState<string>('');
  const [isSubmittingWeight, setIsSubmittingWeight] = useState(false);
  const [authError, setAuthError] = useState<string>('');

  const fetchData = async () => {
    setIsLoading(true);
    setAuthError('');
    try {
      const [caloriesResponse, mealsResponse, weightResponse] = await Promise.all([
        fetch('/api/calories'),
        fetch('/api/meals'),
        fetch('/api/weight')
      ]);
      
      // Check for authentication errors
      if (caloriesResponse.status === 401 || mealsResponse.status === 401 || weightResponse.status === 401) {
        setAuthError('Please log in to view your personal dashboard data.');
        return;
      }
      
      if (caloriesResponse.ok) {
        const caloriesData = await caloriesResponse.json();
        setCalorieRecords(caloriesData.data || []);
      }
      
      if (mealsResponse.ok) {
        const mealsData = await mealsResponse.json();
        setMealRecords(mealsData.data || []);
      }

      if (weightResponse.ok) {
        const weightData = await weightResponse.json();
        setWeightRecords(weightData.data || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setAuthError('Failed to load your personal data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitWeight = async () => {
    if (!newWeight || isNaN(parseFloat(newWeight)) || parseFloat(newWeight) <= 0) {
      alert('Please enter a valid weight');
      return;
    }

    setIsSubmittingWeight(true);
    try {
      const response = await fetch('/api/weight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ weight: parseFloat(newWeight) }),
      });

      if (response.status === 401) {
        alert('Please log in to save your weight data');
        return;
      }

      if (response.ok) {
        setNewWeight('');
        await fetchData(); // Refresh user's data
        alert('Weight saved successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to save weight record');
      }
    } catch (error) {
      console.error('Error saving weight:', error);
      alert('Error saving weight record');
    } finally {
      setIsSubmittingWeight(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate today's stats
  const today = new Date().toDateString();
  const todayMeals = mealRecords.filter(record => 
    new Date(record.createdAt).toDateString() === today
  );
  const todayCalories = todayMeals.reduce((sum, meal) => sum + meal.analysis.totalCalories, 0);
  const latestTDEE = calorieRecords.length > 0 ? calorieRecords[0].result.tdee : 2000;
  const calorieProgress = Math.min((todayCalories / latestTDEE) * 100, 100);
  
  // Statistics
  const totalUsers = 23000;
  const avgCalories = Math.round(mealRecords.reduce((sum, meal) => sum + meal.analysis.totalCalories, 0) / Math.max(mealRecords.length, 1));
  const daysTracked = new Set(mealRecords.map(record => new Date(record.createdAt).toDateString())).size;

  // Process weight data for chart
  const processWeightData = () => {
    if (weightRecords.length === 0) {
      // Return mock data if no real data exists
      return [
        { date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), weight: 75, label: '9d ago' },
        { date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), weight: 74.5, label: '8d ago' },
        { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), weight: 74, label: '7d ago' },
        { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), weight: 73.5, label: '6d ago' },
        { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), weight: 73, label: '5d ago' },
        { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), weight: 72.8, label: '4d ago' },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), weight: 72.5, label: '3d ago' },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), weight: 72.2, label: '2d ago' },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), weight: 72, label: 'Yesterday' },
        { date: new Date(), weight: 71.8, label: 'Today' }
      ];
    }

    // Sort weight records by date (oldest first for chart display)
    const sortedRecords = [...weightRecords]
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
      .slice(-15); // Show last 15 records

    return sortedRecords.map(record => ({
      date: new Date(record.recordedAt),
      weight: record.weight,
      label: new Date(record.recordedAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }));
  };

  const weightChartData = processWeightData();
  const currentWeight = weightChartData.length > 0 ? weightChartData[weightChartData.length - 1].weight : 0;
  const weightRange = weightChartData.length > 0 ? {
    min: Math.min(...weightChartData.map(d => d.weight)) - 1,
    max: Math.max(...weightChartData.map(d => d.weight)) + 1
  } : { min: 70, max: 76 };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Authentication Error Display */}
        {authError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Authentication Required</h3>
                <div className="mt-1 text-sm text-red-700">
                  <p>{authError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">Fitness Dashboard</h1>
              <div className="flex items-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"></div>
                  <span className="font-medium">Calories</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"></div>
                  <span className="font-medium">Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
                  <span className="font-medium">Weight</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Enhanced Calories Card with Progress Ring */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-3xl font-bold text-gray-900">{todayCalories}</span>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-500 text-xs font-medium">+12% vs yesterday</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Calories Today</p>
                <p className="text-orange-500 text-sm font-semibold">{Math.round(calorieProgress)}% of target</p>
              </div>
              <div className="w-20 h-20 relative ml-4">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="url(#orangeGradient)"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={201}
                    strokeDashoffset={201 * (1 - calorieProgress / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgb(251, 146, 60)" />
                      <stop offset="100%" stopColor="rgb(249, 115, 22)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-900">{Math.round(calorieProgress)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced TDEE Card */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-3xl font-bold text-gray-900">{latestTDEE}</span>
                    <div className="flex items-center gap-1 mt-1">
                      <Activity className="w-3 h-3 text-blue-500" />
                      <span className="text-blue-500 text-xs font-medium">Active Level</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Daily Target</p>
                <p className="text-blue-500 text-sm font-semibold">TDEE Calculation</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center ml-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Enhanced Users Card */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-3xl font-bold text-gray-900">{totalUsers.toLocaleString()}</span>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-500 text-xs font-medium">+45% growth</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">App Users</p>
                <p className="text-green-500 text-sm font-semibold">Monthly Growth</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-2xl flex items-center justify-center ml-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Weight Section - Side by Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Enhanced Weight Progress Chart */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  Weight Progress Over Time
                </h3>
                <p className="text-gray-600 text-sm font-medium">
                  {weightRecords.length > 0 
                    ? `Last ${weightChartData.length} recorded weights` 
                    : 'Sample data - add weight records to see your progress'
                  }
                </p>
              </div>
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl px-4 py-3 shadow-lg">
                <span className="text-white text-lg font-bold">
                  {currentWeight ? `${currentWeight}kg` : 'No data'}
                </span>
                <p className="text-gray-300 text-xs mt-1">Current Weight</p>
              </div>
            </div>
            
            {/* Line Chart */}
            <div className="h-40 relative">
              <svg className="w-full h-full" viewBox="0 0 400 160">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line
                    key={i}
                    x1="20"
                    y1={20 + i * 30}
                    x2="380"
                    y2={20 + i * 30}
                    stroke="rgb(229, 231, 235)"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                ))}
                
                {/* Weight range labels */}
                {[0, 1, 2, 3, 4].map(i => (
                  <text
                    key={i}
                    x="10"
                    y={25 + i * 30}
                    fontSize="10"
                    fill="rgb(107, 114, 128)"
                    textAnchor="end"
                  >
                    {(weightRange.max - (i * (weightRange.max - weightRange.min) / 4)).toFixed(1)}
                  </text>
                ))}

                {/* Line path */}
                {weightChartData.length > 1 && (
                  <>
                    <defs>
                      <linearGradient id="weightLineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    
                    {/* Area fill */}
                    <path
                      d={`M ${weightChartData.map((point, i) => {
                        const x = 20 + (i * (360 / Math.max(weightChartData.length - 1, 1)));
                        const y = 20 + ((weightRange.max - point.weight) / (weightRange.max - weightRange.min)) * 120;
                        return `${x},${y}`;
                      }).join(' L ')} L 380,140 L 20,140 Z`}
                      fill="url(#weightLineGradient)"
                    />
                    
                    {/* Line */}
                    <path
                      d={`M ${weightChartData.map((point, i) => {
                        const x = 20 + (i * (360 / Math.max(weightChartData.length - 1, 1)));
                        const y = 20 + ((weightRange.max - point.weight) / (weightRange.max - weightRange.min)) * 120;
                        return `${x},${y}`;
                      }).join(' L ')}`}
                      fill="none"
                      stroke="rgb(34, 197, 94)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Data points */}
                    {weightChartData.map((point, i) => {
                      const x = 20 + (i * (360 / Math.max(weightChartData.length - 1, 1)));
                      const y = 20 + ((weightRange.max - point.weight) / (weightRange.max - weightRange.min)) * 120;
                      return (
                        <g key={i}>
                          <circle
                            cx={x}
                            cy={y}
                            r="4"
                            fill="rgb(34, 197, 94)"
                            stroke="white"
                            strokeWidth="2"
                          />
                          {/* Weight value on hover */}
                          <text
                            x={x}
                            y={y - 10}
                            fontSize="10"
                            fill="rgb(34, 197, 94)"
                            textAnchor="middle"
                            opacity="0.8"
                          >
                            {point.weight}kg
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}
              </svg>
              
              {/* Date labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-5">
                {weightChartData.slice(0, 5).map((point, i) => (
                  <span key={i}>{point.label}</span>
                ))}
                {weightChartData.length > 5 && (
                  <span>{weightChartData[weightChartData.length - 1].label}</span>
                )}
              </div>
              
              {/* No data message */}
              {weightChartData.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Scale className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No weight data recorded yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Weight Entry Form */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <Scale className="w-5 h-5 text-white" />
                  </div>
                  Record Your Weight
                </h4>
                <p className="text-gray-600 text-sm mt-1">Track your daily progress</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 75.5"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg font-medium"
                  disabled={isSubmittingWeight}
                />
              </div>
              
              <button
                onClick={submitWeight}
                disabled={isSubmittingWeight || !newWeight}
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                {isSubmittingWeight ? 'Saving...' : 'Save Weight'}
              </button>
              
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm text-gray-600">
                  💡 Track your daily weight to see progress over time in the chart.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{todayMeals.length}</div>
            <div className="text-gray-600 text-sm font-medium">Meals Today</div>
            <div className="text-green-500 text-xs font-medium mt-1">+2 vs yesterday</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{avgCalories}</div>
            <div className="text-gray-600 text-sm font-medium">Avg Calories</div>
            <div className="text-blue-500 text-xs font-medium mt-1">On track</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{daysTracked}</div>
            <div className="text-gray-600 text-sm font-medium">Days Tracked</div>
            <div className="text-purple-500 text-xs font-medium mt-1">Excellent streak!</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">22.5</div>
            <div className="text-gray-600 text-sm font-medium">BMI (Healthy)</div>
            <div className="text-green-500 text-xs font-medium mt-1">Optimal range</div>
          </div>
        </div>

        {/* Enhanced Recent Activity */}
        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                Recent Meal Analysis
              </h3>
              <p className="text-gray-600 text-sm mt-1">Your latest food tracking activity</p>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {mealRecords.slice(0, 5).map((record) => (
                <div key={record._id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 border border-transparent hover:border-blue-100">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                    <Utensils className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">
                      {record.mealType.charAt(0).toUpperCase() + record.mealType.slice(1)} analyzed
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-4">
                      <span className="font-medium">{record.analysis.totalCalories} calories</span>
                      <span>•</span>
                      <span>{record.analysis.foodItems.length} items</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-lg">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              
              {mealRecords.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Utensils className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-700 mb-2">No meal data yet</p>
                  <p className="text-gray-500">Start by analyzing your first meal to see insights here!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
