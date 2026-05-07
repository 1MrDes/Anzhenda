import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Receipt,
  Wallet,
  CreditCard,
  Users,
  Check,
  Star,
  MapPin,
  Clock,
  ClipboardList,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { FadeIn, Stagger, fadeUp, motion } from "@/components/MotionPrimitives";

const paymentMethods = [
  { id: "wechat", name: "微信支付", icon: Wallet, color: "#2B9A6F" },
  { id: "alipay", name: "支付宝", icon: CreditCard, color: "#4A90D9" },
  { id: "family", name: "子女代付", icon: Users, color: "#F5A623" },
];

export default function Payment() {
  const navigate = useNavigate();
  const [showExtra, setShowExtra] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("wechat");
  const [swipeComplete, setSwipeComplete] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleSwipeEnd = (_: unknown, info: { offset: { x: number } }) => {
    const trackWidth = trackRef.current?.offsetWidth ?? 280;
    const threshold = trackWidth - 72;
    if (info.offset.x >= threshold) {
      setSwipeComplete(true);
      toast.success("支付成功", {
        description: "您的订单已确认，陪诊员正在赶来",
      });
      setTimeout(() => navigate("/tracking"), 1200);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8", paddingBottom: 200 }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-5 py-4 bg-white" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-xl transition-colors"
          style={{ background: "#F3F0EB" }}
        >
          <ChevronLeft className="w-5 h-5" style={{ color: "#2D2D2D" }} />
        </button>
        <h1 className="text-xl font-semibold" style={{ color: "#2D2D2D" }}>
          确认支付
        </h1>
      </div>

      <div className="px-5 pt-5 space-y-4">
        {/* Order Summary */}
        <FadeIn>
          <Card className="p-5 border-0" style={{ borderRadius: "16px", boxShadow: "0 2px 12px rgba(45,45,45,0.06)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-xl"
                style={{ background: "#E8F5EE" }}
              >
                <ClipboardList className="w-6 h-6" style={{ color: "#2B9A6F" }} />
              </div>
              <div>
                <p className="text-lg font-semibold" style={{ color: "#2D2D2D" }}>
                  挂号陪诊
                </p>
                <p className="text-base" style={{ color: "#6B7280" }}>
                  全程陪同挂号、候诊、就诊
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-3" style={{ borderTop: "1px solid #F3F0EB" }}>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: "#6B7280" }} />
                <span className="text-base" style={{ color: "#2D2D2D" }}>
                  上海市第一人民医院
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: "#6B7280" }} />
                <span className="text-base" style={{ color: "#2D2D2D" }}>
                  2025年4月16日 09:00
                </span>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                  style={{ background: "linear-gradient(135deg, #2B9A6F, #3DB88A)" }}
                >
                  张
                </div>
                <div>
                  <p className="text-base font-medium" style={{ color: "#2D2D2D" }}>
                    张护士
                  </p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" style={{ color: "#F5A623" }} />
                    <span className="text-base" style={{ color: "#6B7280" }}>
                      4.9
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>

        {/* Fee Breakdown */}
        <FadeIn delay={0.1}>
          <Card className="p-5 border-0" style={{ borderRadius: "16px", boxShadow: "0 2px 12px rgba(45,45,45,0.06)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-5 h-5" style={{ color: "#2B9A6F" }} />
              <h2 className="text-lg font-semibold" style={{ color: "#2D2D2D" }}>
                费用明细
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base" style={{ color: "#2D2D2D" }}>
                  基础服务费
                </span>
                <span className="text-base font-medium" style={{ color: "#2D2D2D" }}>
                  ¥198
                </span>
              </div>

              <div style={{ borderTop: "1px dashed #E8E5E0" }} />

              <button
                onClick={() => setShowExtra(!showExtra)}
                className="flex items-center justify-between w-full py-1"
              >
                <span className="text-base" style={{ color: "#6B7280" }}>
                  预估附加费
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-base" style={{ color: "#6B7280" }}>
                    ¥0
                  </span>
                  {showExtra ? (
                    <ChevronUp className="w-4 h-4" style={{ color: "#6B7280" }} />
                  ) : (
                    <ChevronDown className="w-4 h-4" style={{ color: "#6B7280" }} />
                  )}
                </div>
              </button>

              {showExtra && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pl-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base" style={{ color: "#9CA3AF" }}>
                      夜间服务费
                    </span>
                    <span className="text-base" style={{ color: "#9CA3AF" }}>
                      ¥0
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base" style={{ color: "#9CA3AF" }}>
                      交通补贴
                    </span>
                    <span className="text-base" style={{ color: "#9CA3AF" }}>
                      ¥0
                    </span>
                  </div>
                </motion.div>
              )}

              <div className="pt-3" style={{ borderTop: "1px solid #E8E5E0" }}>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold" style={{ color: "#2D2D2D" }}>
                    合计
                  </span>
                  <span className="text-2xl font-bold" style={{ color: "#2B9A6F" }}>
                    ¥198
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>

        {/* Payment Method */}
        <FadeIn delay={0.2}>
          <Card className="p-5 border-0" style={{ borderRadius: "16px", boxShadow: "0 2px 12px rgba(45,45,45,0.06)" }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: "#2D2D2D" }}>
              支付方式
            </h2>

            <Stagger className="space-y-3">
              {paymentMethods.map((method) => (
                <motion.div key={method.id} variants={fadeUp}>
                  <button
                    onClick={() => setSelectedPayment(method.id)}
                    className="flex items-center gap-4 w-full p-4 rounded-xl transition-all"
                    style={{
                      background: selectedPayment === method.id ? "#E8F5EE" : "#FAFAF8",
                      border: selectedPayment === method.id
                        ? "2px solid #2B9A6F"
                        : "2px solid transparent",
                      minHeight: "56px",
                    }}
                  >
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-full"
                      style={{ background: `${method.color}15` }}
                    >
                      <method.icon className="w-5 h-5" style={{ color: method.color }} />
                    </div>
                    <span className="text-base font-medium grow text-left" style={{ color: "#2D2D2D" }}>
                      {method.name}
                    </span>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        border: selectedPayment === method.id
                          ? "none"
                          : "2px solid #E8E5E0",
                        background: selectedPayment === method.id ? "#2B9A6F" : "transparent",
                      }}
                    >
                      {selectedPayment === method.id && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </button>
                </motion.div>
              ))}
            </Stagger>
          </Card>
        </FadeIn>
      </div>

      {/* Swipe to Pay */}
      <div
        className="fixed left-0 right-0 z-30 px-5 pt-4"
        style={{ bottom: 72, background: "linear-gradient(to top, #FFFFFF 85%, transparent)", paddingBottom: 16 }}
      >
        <p className="text-center text-base mb-3" style={{ color: "#6B7280" }}>
          向右滑动确认支付
        </p>
        <div
          ref={trackRef}
          className="relative h-14 rounded-full overflow-hidden"
          style={{ background: "#F3F0EB" }}
        >
          {/* Track label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-5 h-5" style={{ color: "#9CA3AF" }} />
              <ChevronRight className="w-5 h-5 -ml-3" style={{ color: "#BCBCBC" }} />
              <ChevronRight className="w-5 h-5 -ml-3" style={{ color: "#D5D5D5" }} />
              <span className="text-base ml-1" style={{ color: "#9CA3AF" }}>
                滑动支付 ¥198
              </span>
            </div>
          </div>

          {/* Draggable handle */}
          {!swipeComplete ? (
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: (trackRef.current?.offsetWidth ?? 280) - 56 }}
              dragElastic={0}
              onDragEnd={handleSwipeEnd}
              className="absolute top-1 left-1 w-12 h-12 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
              style={{
                background: "linear-gradient(135deg, #2B9A6F, #3DB88A)",
                boxShadow: "0 4px 12px rgba(43,154,111,0.3)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #2B9A6F, #3DB88A)" }}
            >
              <Check className="w-7 h-7 text-white" />
              <span className="text-white text-lg font-semibold ml-2">支付成功</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
