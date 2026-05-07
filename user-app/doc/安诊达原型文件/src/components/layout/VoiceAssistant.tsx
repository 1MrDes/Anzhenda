import { useState } from "react";
import { Mic, X } from "lucide-react";
import { motion, springBounce } from "@/components/MotionPrimitives";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function VoiceAssistant() {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);

  const handleToggleListening = () => {
    setListening((prev) => !prev);
  };

  const handleOpen = () => {
    setOpen(true);
    setListening(true);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        className="fixed z-50 flex items-center justify-center rounded-full text-white"
        style={{
          width: 60,
          height: 60,
          right: 20,
          bottom: 100,
          background: "linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%)",
          boxShadow: "0 4px 16px rgba(43, 154, 111, 0.35)",
          border: "none",
          cursor: "pointer",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={springBounce}
        onClick={handleOpen}
        aria-label="语音助手"
      >
        <Mic size={24} />
      </motion.button>

      {/* Voice assistant sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-6 pb-10 pt-6">
          <SheetHeader className="items-center p-0">
            <SheetTitle
              className="text-center font-semibold"
              style={{ fontSize: 20, color: "#2D2D2D" }}
            >
              语音助手
            </SheetTitle>
            <SheetDescription
              className="text-center"
              style={{ fontSize: 18, color: "#6B7280" }}
            >
              {listening ? "正在聆听，请说出您的需求..." : "点击下方按钮开始说话"}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col items-center gap-6 pt-8">
            {/* Pulsing mic button */}
            <div className="relative flex items-center justify-center">
              {/* Pulse rings */}
              {listening && (
                <>
                  <motion.div
                    className="absolute rounded-full"
                    style={{
                      width: 100,
                      height: 100,
                      background: "rgba(43, 154, 111, 0.1)",
                    }}
                    animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                  <motion.div
                    className="absolute rounded-full"
                    style={{
                      width: 100,
                      height: 100,
                      background: "rgba(43, 154, 111, 0.15)",
                    }}
                    animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut",
                      delay: 0.3,
                    }}
                  />
                </>
              )}

              <motion.button
                className="relative z-10 flex items-center justify-center rounded-full text-white"
                style={{
                  width: 80,
                  height: 80,
                  background: listening
                    ? "linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%)"
                    : "#E8E5E0",
                  border: "none",
                  cursor: "pointer",
                  color: listening ? "#FFFFFF" : "#6B7280",
                }}
                whileTap={{ scale: 0.92 }}
                onClick={handleToggleListening}
                aria-label={listening ? "停止聆听" : "开始聆听"}
              >
                <Mic size={32} />
              </motion.button>
            </div>

            {/* Quick commands */}
            <div className="flex flex-col items-center gap-3 w-full">
              <p
                className="font-medium"
                style={{ fontSize: 18, color: "#6B7280" }}
              >
                试试这样说：
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "呼叫最近陪诊员",
                  "查看我的订单",
                  "帮我预约挂号",
                ].map((cmd) => (
                  <Button
                    key={cmd}
                    variant="outline"
                    className="rounded-full"
                    style={{
                      fontSize: 18,
                      height: 44,
                      borderColor: "#E8E5E0",
                      color: "#2D2D2D",
                    }}
                    onClick={() => {
                      setListening(false);
                      setOpen(false);
                    }}
                  >
                    {cmd}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Close button */}
          <div className="flex justify-center pt-6">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full"
              style={{ color: "#9CA3AF" }}
              onClick={() => {
                setListening(false);
                setOpen(false);
              }}
            >
              <X size={24} />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
