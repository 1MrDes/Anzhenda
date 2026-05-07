import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Phone,
  MessageCircle,
  Check,
  MapPin,
  Clock,
  Navigation,
  Star,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn, Stagger, fadeUp, motion } from "@/components/MotionPrimitives";
import { companions } from "@/data/mockData";

const companion = companions[0];

interface TimelineStep {
  label: string;
  time: string;
  status: "completed" | "active" | "pending";
}

const timelineSteps: TimelineStep[] = [
  { label: "已下单", time: "08:30", status: "completed" },
  { label: "陪诊员已接单", time: "08:32", status: "completed" },
  { label: "正在前往", time: "08:35", status: "active" },
  { label: "到达医院", time: "—", status: "pending" },
];

function MapArea() {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: 300,
        borderRadius: "0 0 24px 24px",
        background:
          "linear-gradient(160deg, #E8F5EE 0%, #D4EDE2 30%, #EBF3FC 70%, #E0ECF8 100%)",
      }}
    >
      {/* Grid lines to simulate map */}
      <svg
        className="absolute inset-0 w-full h-full opacity-15"
        xmlns="http://www.w3.org/2000/svg"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * 28}
            x2="100%"
            y2={i * 28}
            stroke="#2B9A6F"
            strokeWidth="0.5"
          />
        ))}
        {Array.from({ length: 16 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 30}
            y1="0"
            x2={i * 30}
            y2="100%"
            stroke="#2B9A6F"
            strokeWidth="0.5"
          />
        ))}
      </svg>

      {/* Simulated road paths */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 80 220 Q 150 180 200 140 Q 250 100 320 80"
          stroke="#2B9A6F"
          strokeWidth="3"
          strokeDasharray="8 6"
          fill="none"
          opacity="0.6"
        />
      </svg>

      {/* Destination marker */}
      <div className="absolute" style={{ right: 60, top: 60 }}>
        <div className="flex flex-col items-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "#E85D4A" }}
          >
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span
            className="mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-white"
            style={{ color: "#E85D4A", fontSize: 13 }}
          >
            医院
          </span>
        </div>
      </div>

      {/* Companion moving dot */}
      <motion.div
        className="absolute"
        style={{ left: 70, top: 200 }}
        animate={{
          x: [0, 15, 30],
          y: [0, -10, -20],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: "rgba(43, 154, 111, 0.3)" }}
              animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div
              className="relative w-10 h-10 rounded-full flex items-center justify-center border-2 border-white"
              style={{
                background: "linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%)",
                boxShadow: "0 4px 12px rgba(43, 154, 111, 0.4)",
              }}
            >
              <Navigation className="w-5 h-5 text-white" />
            </div>
          </div>
          <span
            className="mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-white"
            style={{ color: "#2B9A6F", fontSize: 13 }}
          >
            {companion.name}
          </span>
        </div>
      </motion.div>

      {/* ETA overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <div
          className="px-5 py-2.5 rounded-full flex items-center gap-2"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          }}
        >
          <Clock className="w-5 h-5" style={{ color: "#2B9A6F" }} />
          <span
            className="font-semibold"
            style={{ fontSize: 18, color: "#2D2D2D" }}
          >
            预计 8 分钟到达
          </span>
        </div>
      </div>
    </div>
  );
}

function CompanionInfoCard() {
  return (
    <FadeIn>
      <Card
        className="mx-5 -mt-6 relative z-10 border-0 p-5"
        style={{
          borderRadius: 20,
          boxShadow:
            "0 8px 32px rgba(45, 45, 45, 0.10), 0 2px 8px rgba(45, 45, 45, 0.06)",
        }}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #E8F5EE 0%, #D4EDE2 100%)",
              border: "2px solid #2B9A6F",
            }}
          >
            <span className="text-xl font-bold" style={{ color: "#2B9A6F" }}>
              {companion.name.charAt(0)}
            </span>
          </div>

          {/* Info */}
          <div className="grow min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="font-bold truncate"
                style={{ fontSize: 18, color: "#2D2D2D" }}
              >
                {companion.name}
              </span>
              <Badge
                className="shrink-0 border-0 text-xs px-2 py-0.5"
                style={{
                  background: "#E8F5EE",
                  color: "#2B9A6F",
                  borderRadius: 20,
                }}
              >
                <motion.span
                  className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                  style={{ background: "#2B9A6F" }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                正在前往
              </Badge>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Star
                className="w-4 h-4"
                style={{ color: "#F5A623" }}
                fill="#F5A623"
              />
              <span
                className="font-semibold"
                style={{ fontSize: 18, color: "#2D2D2D" }}
              >
                {companion.rating}
              </span>
              <span style={{ fontSize: 16, color: "#9CA3AF" }}>
                ({companion.reviewCount}条评价)
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <Button
            className="grow h-12 text-base font-semibold border-0"
            style={{
              background: "linear-gradient(135deg, #4A90D9 0%, #6BA8E8 100%)",
              color: "#fff",
              borderRadius: 14,
            }}
          >
            <Phone className="w-5 h-5 mr-2" />
            拨打电话
          </Button>
          <Button
            variant="outline"
            className="grow h-12 text-base font-semibold"
            style={{
              borderRadius: 14,
              borderColor: "#E8E5E0",
              color: "#2D2D2D",
            }}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            发送消息
          </Button>
        </div>
      </Card>
    </FadeIn>
  );
}

function OrderTimeline() {
  return (
    <FadeIn delay={0.1}>
      <div className="mx-5 mt-6">
        <h3 className="font-bold mb-4" style={{ fontSize: 18, color: "#2D2D2D" }}>
          订单进度
        </h3>
        <Stagger stagger={0.08} className="relative ml-1">
          {timelineSteps.map((step, index) => {
            const isLast = index === timelineSteps.length - 1;
            return (
              <motion.div
                key={step.label}
                variants={fadeUp}
                className="flex items-start gap-4 pb-6 relative"
              >
                {/* Connector line */}
                {!isLast && (
                  <div
                    className="absolute left-[15px] top-[36px] w-0.5"
                    style={{
                      height: "calc(100% - 28px)",
                      background:
                        step.status === "completed" ? "#2B9A6F" : "#E8E5E0",
                    }}
                  />
                )}

                {/* Icon circle */}
                <div className="relative z-10 shrink-0">
                  {step.status === "completed" ? (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: "#2B9A6F" }}
                    >
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : step.status === "active" ? (
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ background: "rgba(43, 154, 111, 0.25)" }}
                        animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <div
                        className="relative w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%)",
                          boxShadow: "0 2px 8px rgba(43,154,111,0.35)",
                        }}
                      >
                        <Navigation className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: "#F3F0EB" }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: "#9CA3AF" }}
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="pt-1">
                  <span
                    className="font-semibold block"
                    style={{
                      fontSize: 18,
                      color:
                        step.status === "pending" ? "#9CA3AF" : "#2D2D2D",
                    }}
                  >
                    {step.label}
                  </span>
                  <span
                    className="block mt-0.5"
                    style={{ fontSize: 16, color: "#9CA3AF" }}
                  >
                    {step.time}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </Stagger>
      </div>
    </FadeIn>
  );
}

function OrderDetailsCard() {
  return (
    <FadeIn delay={0.2}>
      <Card
        className="mx-5 mb-6 border-0 p-5"
        style={{
          borderRadius: 20,
          boxShadow: "0 2px 12px rgba(45,45,45,0.06)",
        }}
      >
        <h3
          className="font-bold mb-3"
          style={{ fontSize: 18, color: "#2D2D2D" }}
        >
          订单详情
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#E8F5EE" }}
            >
              <Clock className="w-4 h-4" style={{ color: "#2B9A6F" }} />
            </div>
            <div>
              <span
                className="block"
                style={{ fontSize: 16, color: "#9CA3AF" }}
              >
                预约时间
              </span>
              <span
                className="font-medium"
                style={{ fontSize: 18, color: "#2D2D2D" }}
              >
                2025年4月16日 09:00
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#EBF3FC" }}
            >
              <MapPin className="w-4 h-4" style={{ color: "#4A90D9" }} />
            </div>
            <div>
              <span
                className="block"
                style={{ fontSize: 16, color: "#9CA3AF" }}
              >
                就诊医院
              </span>
              <span
                className="font-medium"
                style={{ fontSize: 18, color: "#2D2D2D" }}
              >
                上海市第一人民医院
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#F3EEFB" }}
            >
              <Navigation className="w-4 h-4" style={{ color: "#7C6BC4" }} />
            </div>
            <div>
              <span
                className="block"
                style={{ fontSize: 16, color: "#9CA3AF" }}
              >
                服务类型
              </span>
              <span
                className="font-medium"
                style={{ fontSize: 18, color: "#2D2D2D" }}
              >
                挂号陪诊
              </span>
            </div>
          </div>
        </div>
      </Card>
    </FadeIn>
  );
}

export default function Tracking() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAFAF8" }}>
      {/* Back button overlaying map */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <ChevronLeft className="w-5 h-5" style={{ color: "#2D2D2D" }} />
        </button>
      </div>

      <MapArea />
      <div className="mt-2">
        <CompanionInfoCard />
        <OrderTimeline />
        <OrderDetailsCard />
      </div>
    </div>
  );
}
