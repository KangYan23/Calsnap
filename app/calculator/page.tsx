"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Zap, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateCalories, type CalorieCalculationInput, type CalorieCalculationResult } from "@/lib/calorieCalculator";
import { CalorieRecordInput } from "@/lib/types";

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

export default function CalorieCalculatorPage() {
  const [formData, setFormData] = useState<CalorieCalculationInput>({
    sex: "male",
    age: 25,
    height: 175,
    weight: 70,
    activityLevel: "moderate",
  });
  
  const [result, setResult] = useState<CalorieCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = (field: keyof CalorieCalculationInput, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    
    // Simulate calculation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const calculationResult = calculateCalories(formData);
      setResult(calculationResult);
      
      // Store the calculation in MongoDB
      const recordData: CalorieRecordInput = {
        input: formData,
        result: calculationResult,
      };
      
      const response = await fetch("/api/calories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recordData),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        console.error("Failed to save calorie record:", data.error);
        // Don't show error to user as calculation was successful
      } else {
        console.log("Calorie record saved successfully:", data.data);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Calculation failed");
    } finally {
      setIsCalculating(false);
    }
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
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50 pt-16">
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
      <div className="relative z-10 container mx-auto px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
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
                <Calculator className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm text-green-700 font-medium">
                Calorie Calculator
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">
                Calculate Your
              </span>
              <br />
              <span className="text-gray-800">Daily Calories</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Get personalized calorie recommendations based on your body and lifestyle
            </p>
          </motion.div>

          {/* Calculator Form */}
          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60 mb-8"
          >
            <div className="grid md:grid-cols-2 gap-8">
              {/* Personal Info */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h3>
                
                {/* Sex */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sex</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange("sex", "male")}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200",
                        formData.sex === "male"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-green-300"
                      )}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange("sex", "female")}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200",
                        formData.sex === "female"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-green-300"
                      )}
                    >
                      Female
                    </button>
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Age (years)</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", parseInt(e.target.value) || 0)}
                    className="w-full py-3 px-4 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 shadow-sm outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-200"
                    min="1"
                    max="120"
                  />
                </div>

                {/* Height */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange("height", parseInt(e.target.value) || 0)}
                    className="w-full py-3 px-4 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 shadow-sm outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-200"
                    min="100"
                    max="250"
                  />
                </div>

                {/* Weight */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", parseInt(e.target.value) || 0)}
                    className="w-full py-3 px-4 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 shadow-sm outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-200"
                    min="20"
                    max="300"
                  />
                </div>
              </div>

              {/* Activity Level */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Activity Level</h3>
                
                <div className="space-y-3">
                  {[
                    { value: "sedentary", label: "Sedentary", desc: "Little to no exercise" },
                    { value: "light", label: "Light", desc: "Light exercise 1-3 days/week" },
                    { value: "moderate", label: "Moderate", desc: "Moderate exercise 3-5 days/week" },
                    { value: "active", label: "Active", desc: "Heavy exercise 6-7 days/week" },
                    { value: "very_active", label: "Very Active", desc: "Very heavy exercise, physical job" },
                  ].map((activity) => (
                    <button
                      key={activity.value}
                      type="button"
                      onClick={() => handleInputChange("activityLevel", activity.value as any)}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                        formData.activityLevel === activity.value
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-green-300"
                      )}
                    >
                      <div className="font-medium">{activity.label}</div>
                      <div className="text-sm opacity-75">{activity.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Calculate Button */}
                <Button
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className="w-full rounded-full px-6 py-4 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  {isCalculating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Calculating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      Calculate Calories
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Daily Calorie Needs</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-2xl bg-green-50 border border-green-200">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-1">{result.bmr}</div>
                  <div className="text-sm text-green-700 font-medium">BMR (Basal Metabolic Rate)</div>
                  <div className="text-xs text-green-600 mt-1">Calories at rest</div>
                </div>
                
                <div className="text-center p-6 rounded-2xl bg-blue-50 border border-blue-200">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">{result.tdee}</div>
                  <div className="text-sm text-blue-700 font-medium">TDEE (Total Daily Energy)</div>
                  <div className="text-xs text-blue-600 mt-1">With activity</div>
                </div>
                
                <div className="text-center p-6 rounded-2xl bg-purple-50 border border-purple-200">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-1">{result.maxCalories}</div>
                  <div className="text-sm text-purple-700 font-medium">Max Daily Calories</div>
                  <div className="text-xs text-purple-600 mt-1">To maintain weight</div>
                </div>
              </div>
              
              <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  <strong>Note:</strong> These are estimates. For weight loss, consume 300-500 calories less than your TDEE. 
                  For weight gain, consume 300-500 calories more than your TDEE.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/20 pointer-events-none" />
    </div>
  );
}
