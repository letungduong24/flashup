"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
  show = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
  show?: boolean;
}) => {
  const positionVariants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };

  const visibilityVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <div className={cn("relative group w-full max-w-6xl rounded-2xl", containerClassName)}>
      <AnimatePresence>
        {show && (
          <>
            <motion.div
              variants={visibilityVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 z-[1]"
            >
              <motion.div
                variants={animate ? positionVariants : undefined}
                initial={animate ? "initial" : undefined}
                animate={animate ? "animate" : undefined}
                transition={
                  animate
                    ? {
                        duration: 5,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }
                    : undefined
                }
                style={{
                  backgroundSize: animate ? "400% 400%" : undefined,
                }}
                className={cn(
                  "absolute inset-0 rounded-3xl opacity-60 group-hover:opacity-100 blur-xl transition duration-500 will-change-transform",
                  "bg-[radial-gradient(circle_farthest-side_at_0_100%,#f97316,transparent),radial-gradient(circle_farthest-side_at_100%_0,#ea580c,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffb347,transparent),radial-gradient(circle_farthest-side_at_0_0,#ff6b35,#1a1a1a)]"
                )}
              />
            </motion.div>
            <motion.div
              variants={visibilityVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 z-[1]"
            >
              <motion.div
                variants={animate ? positionVariants : undefined}
                initial={animate ? "initial" : undefined}
                animate={animate ? "animate" : undefined}
                transition={
                  animate
                    ? {
                        duration: 5,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }
                    : undefined
                }
                style={{
                  backgroundSize: animate ? "400% 400%" : undefined,
                }}
                className={cn(
                  "absolute inset-0 rounded-3xl will-change-transform",
                  "bg-[radial-gradient(circle_farthest-side_at_0_100%,#f97316,transparent),radial-gradient(circle_farthest-side_at_100%_0,#ea580c,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffb347,transparent),radial-gradient(circle_farthest-side_at_0_0,#ff6b35,#1a1a1a)]"
                )}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};