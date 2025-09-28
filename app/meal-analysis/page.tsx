"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Upload, Utensils, Clock, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MealType, MealAnalysis } from "@/lib/mealTypes";

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

export default function MealAnalysisPage() {
  const [selectedMealType, setSelectedMealType] = useState<MealType>("breakfast");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const mealTypes = [
    { value: "breakfast", label: "Breakfast", icon: "🌅", desc: "Morning meal" },
    { value: "lunch", label: "Lunch", icon: "☀️", desc: "Midday meal" },
    { value: "dinner", label: "Dinner", icon: "🌙", desc: "Evening meal" },
    { value: "dessert", label: "Dessert", icon: "🍰", desc: "Sweet treat" },
  ] as const;

  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        setAnalysis(null); // Clear previous analysis
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setCameraStream(stream);
      setShowCamera(true);
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    const video = document.getElementById('camera-video') as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (video && context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setUploadedImage(imageData);
      setAnalysis(null);
      stopCamera();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) return;

    setIsAnalyzing(true);
    
    try {
      const response = await fetch("/api/meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mealType: selectedMealType,
          imageData: uploadedImage,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Analysis failed");
      }

      setAnalysis(data.data.analysis);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setUploadedImage(null);
    setAnalysis(null);
    setIsAnalyzing(false);
    stopCamera();
  };

  // Cleanup camera stream on component unmount
  React.useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

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
                <Utensils className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm text-green-700 font-medium">
                Meal Analysis
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">
                Analyze Your
              </span>
              <br />
              <span className="text-gray-800">Meal</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Upload a photo and let AI identify your food and estimate calories
            </p>
          </motion.div>

          {/* Meal Type Selection */}
          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60 mb-8"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Select Meal Type</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mealTypes.map((meal) => (
                <button
                  key={meal.value}
                  onClick={() => setSelectedMealType(meal.value)}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all duration-200 text-center",
                    selectedMealType === meal.value
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-green-300"
                  )}
                >
                  <div className="text-2xl mb-2">{meal.icon}</div>
                  <div className="font-medium">{meal.label}</div>
                  <div className="text-xs opacity-75">{meal.desc}</div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Photo Upload Section */}
          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60 mb-8"
          >
            {!uploadedImage ? (
              <div
                className={cn(
                  "relative transition-all duration-300",
                  isDragOver ? "scale-105 border-green-400 bg-green-50" : ""
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="text-center py-16">
                  <div className="mb-8">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                      <Camera className="w-16 h-16 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                      Upload Your Food Photo
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Drag and drop an image here, or click to select a file from your device
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                        <Upload className="w-5 h-5 mr-2" />
                        Choose Photo
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </label>
                    <Button
                      variant="outline"
                      className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-full text-lg font-medium"
                      onClick={startCamera}
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <img
                    src={uploadedImage}
                    alt="Uploaded food"
                    className="max-w-md w-full h-64 object-cover rounded-lg shadow-lg"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p>Analyzing with AI...</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Analyzing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Analyze Meal
                      </div>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetAnalysis}
                    className="border-2 border-gray-200 text-gray-600 hover:bg-gray-50 px-8 py-3 rounded-full text-lg font-medium"
                  >
                    Try Another Photo
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Camera Interface */}
          {showCamera && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            >
              <div className="relative w-full max-w-2xl">
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
                  <div className="relative">
                    <video
                      id="camera-video"
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 md:h-96 object-cover"
                      ref={(video) => {
                        if (video && cameraStream) {
                          video.srcObject = cameraStream;
                        }
                      }}
                    />
                    
                    {/* Camera Controls Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <Button
                          onClick={stopCamera}
                          variant="outline"
                          className="bg-white/90 text-gray-800 border-white/50"
                        >
                          Cancel
                        </Button>
                        
                        <Button
                          onClick={capturePhoto}
                          className="w-16 h-16 rounded-full bg-white/90 text-gray-800 shadow-lg hover:bg-white transition-all duration-200"
                        >
                          <Camera className="w-8 h-8" />
                        </Button>
                        
                        <div className="w-16"></div> {/* Spacer for centering */}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Take a Photo</h3>
                    <p className="text-sm text-gray-600">
                      Position your food in the frame and tap the camera button to capture
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Camera Error */}
          {cameraError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 text-red-600">⚠️</div>
                <p className="text-red-700">{cameraError}</p>
              </div>
              <Button
                onClick={() => setCameraError(null)}
                variant="outline"
                size="sm"
                className="mt-2 border-red-300 text-red-600 hover:bg-red-50"
              >
                Dismiss
              </Button>
            </motion.div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/60"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Analysis Results
              </h3>
              
              {/* Total Calories */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-green-50 border border-green-200">
                  <Target className="w-6 h-6 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">{analysis.totalCalories}</span>
                  <span className="text-green-700 font-medium">Total Calories</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Confidence: {Math.round(analysis.analysisConfidence * 100)}%
                </p>
              </div>

              {/* Food Items */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Identified Food Items:</h4>
                {analysis.foodItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{item.name}</div>
                      {item.quantity && (
                        <div className="text-sm text-gray-600">Portion: {item.quantity}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{item.estimatedCalories} cal</div>
                      <div className="text-xs text-gray-500">
                        {Math.round(item.confidence * 100)}% confidence
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-700 text-center">
                  <strong>Note:</strong> These are AI-generated estimates. Actual calories may vary based on preparation methods and exact portions.
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
