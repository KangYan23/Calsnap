"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Camera, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

function CalorieLandingPage() {
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
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon Badge */}
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 border border-green-200/50 mb-8 shadow-sm backdrop-blur-sm"
          >
            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
              <Camera className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm text-green-700 font-medium">
              AI-Powered Nutrition
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">
                Snap Your Meal,
              </span>
              <br />
              <span className="text-gray-800">
                Know Your Calories
              </span>
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 leading-relaxed font-light max-w-2xl mx-auto">
              Take a photo and instantly see calorie information
            </p>
          </motion.div>

        {/* Get Started Button */}
          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link href="/login">
          <Button
                  size="sm" 
                  className="rounded-full px-6 py-3 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            Get Started
                  <motion.span
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </motion.span>
          </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/20 pointer-events-none" />
    </div>
  );
}

export default function CalorieLanding() {
  return <CalorieLandingPage />;
}
