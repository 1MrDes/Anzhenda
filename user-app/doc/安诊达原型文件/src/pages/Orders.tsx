import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Star,
  MapPin,
  Clock,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  FadeIn,
  Stagger,
  HoverLift,
  fadeUp,
  motion,
} from "@/components/MotionPrimitives";
import { orders } from "@/data/mockData";

type TabType = "in_progress" | "completed" | "cancelled";

const tabs: { key: TabType; label: string }[] = [
  { key: "in_progress", label: "进行中" },
  { key: "completed", label: "已完成" },
  { key: "cancelled", label: "已取消" },
];

const statusConfig: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  pending: { label: "待确认", bg: "#FFF5E0", color: "#F5A623" },
  accepted: { label: "已接单", bg: "#EBF3FC", color: "#4A90D9" },
  in_progress: { label: "进行中", bg: "#E8F5EE", color: "#2B9A6F" },
  completed: { label: "已完成", bg: "#EBF3FC", color: "#4A90D9" },
  cancelled: { label: "已取消", bg: "#F3F0EB", color: "#9CA3AF" },
};

function RatingSheet({
  open,
  onOpenChange,
  orderId: _orderId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
}) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onOpenChange(false);
      setSubmitted(false);
      setRating(0);
      setReview("");
    }, 1500);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-6 pb-10">
        <SheetHeader className="mb-6">
          <SheetTitle
            className="text-center font-bold"
            style={{ fontSize: 20, color: "#2D2D2D" }}
          >
            服务评价
          </SheetTitle>
        </SheetHeader>

        {submitted ? (
          <div className="flex flex-col items-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "#E8F5EE" }}
            >
              <MessageSquare className="w-7 h-7" style={{ color: "#2B9A6F" }} />
            </motion.div>
            <span
              className="font-semibold"
              style={{ fontSize: 18, color: "#2D2D2D" }}
            >
              感谢您的评价
            </span>
          </div>
        ) : (
          <>
            {/* Star rating */}
            <div className="flex justify-center gap-3 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1"
                  style={{ minWidth: 44, minHeight: 44 }}
                >
                  <Star
                    className="w-9 h-9 transition-colors"
                    fill={star <= rating ? "#F5A623" : "transparent"}
                    style={{
                      color: star <= rating ? "#F5A623" : "#E8E5E0",
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Review text */}
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="分享您的服务体验（选填）"
              className="w-full p-4 border-0 resize-none focus:outline-none focus:ring-2 focus:ring-[#2B9A6F]/30"
              style={{
                background: "#F3F0EB",
                borderRadius: 16,
                fontSize: 16,
                color: "#2D2D2D",
                minHeight: 120,
              }}
            />

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="w-full mt-5 border-0 font-semibold text-white disabled:opacity-50"
              style={{
                height: 56,
                borderRadius: 16,
                fontSize: 18,
                background:
                  rating > 0
                    ? "linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%)"
                    : "#E8E5E0",
              }}
            >
              提交评价
            </Button>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function OrderCard({ order }: { order: (typeof orders)[0] }) {
  const [ratingOpen, setRatingOpen] = useState(false);
  const status = statusConfig[order.status] || statusConfig.pending;

  return (
    <>
      <HoverLift>
        <Card
          className="border-0 p-5"
          style={{
            borderRadius: 20,
            boxShadow:
              "0 2px 12px rgba(45, 45, 45, 0.06), 0 1px 4px rgba(45, 45, 45, 0.04)",
          }}
        >
          {/* Header: Order ID + Status */}
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 16, color: "#9CA3AF" }}>{order.id}</span>
            <Badge
              className="border-0 font-medium"
              style={{
                background: status.bg,
                color: status.color,
                borderRadius: 20,
fontSize: 15,
                    padding: "4px 12px",
              }}
            >
              {status.label}
            </Badge>
          </div>

          {/* Service info */}
          <div className="mb-3">
            <h3
              className="font-bold"
              style={{ fontSize: 18, color: "#2D2D2D" }}
            >
              {order.serviceType}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              <MapPin
                className="w-4 h-4 shrink-0"
                style={{ color: "#9CA3AF" }}
              />
              <span style={{ fontSize: 18, color: "#6B7280" }}>
                {order.hospital}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Clock
                className="w-4 h-4 shrink-0"
                style={{ color: "#9CA3AF" }}
              />
              <span style={{ fontSize: 18, color: "#6B7280" }}>
                {order.date} {order.time}
              </span>
            </div>
          </div>

          {/* Companion info */}
          <div
            className="flex items-center gap-3 p-3 mb-3"
            style={{ background: "#F3F0EB", borderRadius: 14 }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, #E8F5EE 0%, #D4EDE2 100%)",
              }}
            >
              <span className="text-base font-bold" style={{ color: "#2B9A6F" }}>
                {order.companionName.charAt(0)}
              </span>
            </div>
            <div className="grow">
              <span
                className="font-semibold"
                style={{ fontSize: 18, color: "#2D2D2D" }}
              >
                {order.companionName}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <Star
                className="w-3.5 h-3.5"
                fill="#F5A623"
                style={{ color: "#F5A623" }}
              />
              <span
                className="font-medium"
                style={{ fontSize: 16, color: "#2D2D2D" }}
              >
                {
                  // Find companion rating from companions data if available
                  order.rating || "4.9"
                }
              </span>
            </div>
          </div>

          {/* Review excerpt (if completed with review) */}
          {order.status === "completed" && order.review && (
            <div
              className="p-3 mb-3"
              style={{ background: "#FFF9F0", borderRadius: 14 }}
            >
              <div className="flex items-center gap-1 mb-1">
                {Array.from({ length: order.rating || 0 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5"
                    fill="#F5A623"
                    style={{ color: "#F5A623" }}
                  />
                ))}
              </div>
              <p
                className="line-clamp-2"
                style={{ fontSize: 16, color: "#6B7280", lineHeight: 1.5 }}
              >
                {order.review}
              </p>
            </div>
          )}

          {/* Bottom: Fee + Action */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span style={{ fontSize: 16, color: "#9CA3AF" }}>合计 </span>
              <span
                className="font-bold"
                style={{ fontSize: 22, color: "#2B9A6F" }}
              >
                ¥{order.totalFee}
              </span>
            </div>

            {order.status === "in_progress" && (
              <Link to="/tracking">
                <Button
                  className="border-0 font-semibold text-white"
                  style={{
                    height: 44,
                    borderRadius: 14,
                    background:
                      "linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%)",
                    fontSize: 18,
                    padding: "0 20px",
                  }}
                >
                  查看进度
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}

            {order.status === "completed" && !order.review && (
              <Button
                onClick={() => setRatingOpen(true)}
                variant="outline"
                className="font-semibold"
                style={{
                  height: 44,
                  borderRadius: 14,
                  borderColor: "#2B9A6F",
                  color: "#2B9A6F",
                  fontSize: 18,
                  padding: "0 20px",
                }}
              >
                <MessageSquare className="w-4 h-4 mr-1.5" />
                去评价
              </Button>
            )}
          </div>
        </Card>
      </HoverLift>

      <RatingSheet
        open={ratingOpen}
        onOpenChange={setRatingOpen}
        orderId={order.id}
      />
    </>
  );
}

export default function Orders() {
  const [activeTab, setActiveTab] = useState<TabType>("in_progress");

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "in_progress") {
      return (
        order.status === "in_progress" ||
        order.status === "pending" ||
        order.status === "accepted"
      );
    }
    return order.status === activeTab;
  });

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAFAF8" }}>
      {/* Page Header */}
      <FadeIn>
        <div className="px-5 pt-6 pb-2">
          <h1
            className="font-bold"
            style={{ fontSize: 24, color: "#2D2D2D" }}
          >
            我的订单
          </h1>
          <p className="mt-1" style={{ fontSize: 18, color: "#9CA3AF" }}>
            共 {orders.length} 个订单
          </p>
        </div>
      </FadeIn>

      {/* Tab Filters */}
      <FadeIn delay={0.05}>
        <div className="px-5 py-3">
          <div className="flex gap-3">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const count = orders.filter((o) => {
                if (tab.key === "in_progress") {
                  return (
                    o.status === "in_progress" ||
                    o.status === "pending" ||
                    o.status === "accepted"
                  );
                }
                return o.status === tab.key;
              }).length;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-1.5 px-5 font-semibold transition-all"
                  style={{
                    height: 44,
                    borderRadius: 22,
                    fontSize: 18,
                    background: isActive ? "#2B9A6F" : "#F3F0EB",
                    color: isActive ? "#FFFFFF" : "#6B7280",
                    minWidth: 80,
                    boxShadow: isActive
                      ? "0 4px 12px rgba(43, 154, 111, 0.25)"
                      : "none",
                  }}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: isActive
                          ? "rgba(255,255,255,0.25)"
                          : "rgba(0,0,0,0.06)",
                        fontSize: 14,
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {/* Order List */}
      <Stagger stagger={0.08} className="px-5 space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <motion.div key={order.id} variants={fadeUp}>
              <OrderCard order={order} />
            </motion.div>
          ))
        ) : (
          <motion.div variants={fadeUp}>
            <div
              className="flex flex-col items-center py-16"
              style={{ color: "#9CA3AF" }}
            >
              <FileText className="w-12 h-12 mb-3 opacity-40" />
              <span style={{ fontSize: 18 }}>暂无{tabs.find((t) => t.key === activeTab)?.label}订单</span>
            </div>
          </motion.div>
        )}
      </Stagger>
    </div>
  );
}
