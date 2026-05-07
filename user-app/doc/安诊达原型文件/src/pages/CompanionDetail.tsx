import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  Star,
  Shield,
  MessageSquare,
  Award,
  Heart,
  CheckCircle,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  FadeIn,
  Stagger,
  fadeUp,
  motion,
} from "@/components/MotionPrimitives";
import { companions, reviews } from "@/data/mockData";

const certIcons: Record<string, React.ElementType> = {
  "护士执业资格证": Shield,
  "急救培训证书": Heart,
  "老年护理专项证书": Users,
  "健康管理师证书": Award,
  "养老护理员证书": Users,
  "医疗助理证书": Shield,
  "护理员资格证": Shield,
  "心理咨询师证书": Heart,
};

const certColors = [
  { bg: "linear-gradient(135deg, #E8F5EE 0%, #D4EDDA 100%)", icon: "#2B9A6F" },
  { bg: "linear-gradient(135deg, #EBF3FC 0%, #D6E8F9 100%)", icon: "#4A90D9" },
  { bg: "linear-gradient(135deg, #FFF5E0 0%, #FFECC4 100%)", icon: "#F5A623" },
];

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{
            width: size,
            height: size,
            color: i <= rating ? "#F5A623" : "#E8E5E0",
            fill: i <= rating ? "#F5A623" : "none",
          }}
        />
      ))}
    </div>
  );
}

export default function CompanionDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [_selectedCert, setSelectedCert] = useState<string | null>(null);

  const companion = companions.find((c) => c.id === id) || companions[0];
  const initials = companion.name.charAt(0);

  return (
    <div className="min-h-screen pb-32" style={{ background: "#FAFAF8" }}>
      {/* Profile Hero */}
      <FadeIn>
        <div
          className="relative px-5 pt-4 pb-8"
          style={{
            background: "linear-gradient(180deg, #E8F5EE 0%, #FAFAF8 100%)",
          }}
        >
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center transition-colors"
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(8px)",
            }}
          >
            <ChevronLeft className="w-6 h-6" style={{ color: "#2D2D2D" }} />
          </button>

          {/* Avatar & Info */}
          <div className="flex flex-col items-center mt-4">
            <div
              className="flex items-center justify-center font-bold text-white"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "24px",
                background:
                  "linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%)",
                fontSize: "28px",
                boxShadow: "0 8px 24px rgba(43,154,111,0.25)",
              }}
            >
              {initials}
            </div>

            <h1
              className="mt-4 font-bold"
              style={{ fontSize: "24px", color: "#2D2D2D" }}
            >
              {companion.name}
            </h1>
            <p className="mt-1" style={{ fontSize: "15px", color: "#6B7280" }}>
              {companion.experience}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3">
              <Star
                className="w-5 h-5"
                style={{ color: "#F5A623", fill: "#F5A623" }}
              />
              <span
                className="font-bold"
                style={{ fontSize: "20px", color: "#2D2D2D" }}
              >
                {companion.rating}
              </span>
              <span style={{ fontSize: "18px", color: "#9CA3AF" }}>
                ({companion.reviewCount}条评价)
              </span>
            </div>

            {/* Status Badge */}
            <div
              className="mt-3 px-4 py-1.5 flex items-center gap-1.5"
              style={{
                borderRadius: "20px",
                background:
                  companion.status === "available"
                    ? "rgba(43,154,111,0.1)"
                    : "rgba(245,166,35,0.1)",
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background:
                    companion.status === "available" ? "#2B9A6F" : "#F5A623",
                }}
              />
              <span
                className="font-medium"
                style={{
                  fontSize: "14px",
                  color:
                    companion.status === "available" ? "#2B9A6F" : "#F5A623",
                }}
              >
                {companion.status === "available" ? "在线" : "忙碌"}
              </span>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Service Tags */}
      <FadeIn delay={0.1}>
        <div className="px-5 mt-2">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {companion.services.map((service) => (
              <Badge
                key={service}
                variant="outline"
                className="shrink-0 px-4 py-2 font-medium"
                style={{
                  borderRadius: "20px",
                  borderColor: "#2B9A6F",
                  color: "#2B9A6F",
                  fontSize: "14px",
                  background: "rgba(43,154,111,0.05)",
                }}
              >
                {service}
              </Badge>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Stats Row */}
      <FadeIn delay={0.15}>
        <div className="px-5 mt-6">
          <Card
            className="p-5"
            style={{
              borderRadius: "16px",
              border: "1px solid #E8E5E0",
              background: "#FFFFFF",
            }}
          >
            <div className="grid grid-cols-3 divide-x divide-gray-100">
              {[
                {
                  value: companion.completedOrders.toLocaleString(),
                  label: "服务次数",
                },
                { value: "99%", label: "好评率" },
                {
                  value: companion.experience.match(/\d+/)?.[0] + "年",
                  label: "从业经验",
                },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center">
                  <span
                    className="font-bold"
                    style={{ fontSize: "22px", color: "#2B9A6F" }}
                  >
                    {stat.value}
                  </span>
                  <span
                    className="mt-1"
                    style={{ fontSize: "13px", color: "#9CA3AF" }}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </FadeIn>

      {/* Certifications */}
      <FadeIn delay={0.2}>
        <div className="px-5 mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5" style={{ color: "#2B9A6F" }} />
            <h2
              className="font-semibold"
              style={{ fontSize: "20px", color: "#2D2D2D" }}
            >
              资质证书
            </h2>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {companion.certifications.map((cert, index) => {
              const CertIcon = certIcons[cert] || Shield;
              const colorSet = certColors[index % certColors.length];
              return (
                <Sheet key={cert}>
                  <SheetTrigger asChild>
                    <button
                      className="shrink-0 flex flex-col items-center justify-center p-4 transition-transform active:scale-95"
                      style={{
                        width: "140px",
                        height: "120px",
                        borderRadius: "16px",
                        background: colorSet.bg,
                        border: "1px solid rgba(0,0,0,0.04)",
                      }}
                      onClick={() => setSelectedCert(cert)}
                    >
                      <CertIcon
                        className="w-8 h-8 mb-3"
                        style={{ color: colorSet.icon }}
                      />
                      <span
                        className="font-medium text-center leading-tight"
                        style={{ fontSize: "13px", color: "#2D2D2D" }}
                      >
                        {cert}
                      </span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-3xl pb-8">
                    <SheetHeader>
                      <SheetTitle className="text-left" style={{ fontSize: "20px" }}>
                        {cert}
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 flex flex-col items-center">
                      <div
                        className="flex items-center justify-center"
                        style={{
                          width: "120px",
                          height: "120px",
                          borderRadius: "24px",
                          background: colorSet.bg,
                        }}
                      >
                        <CertIcon
                          className="w-16 h-16"
                          style={{ color: colorSet.icon }}
                        />
                      </div>
                      <h3
                        className="mt-4 font-bold"
                        style={{ fontSize: "20px", color: "#2D2D2D" }}
                      >
                        {cert}
                      </h3>
                      <div className="flex items-center gap-2 mt-3">
                        <CheckCircle
                          className="w-5 h-5"
                          style={{ color: "#2B9A6F" }}
                        />
                        <span style={{ fontSize: "15px", color: "#2B9A6F" }}>
                          已验证
                        </span>
                      </div>
                      <p
                        className="mt-4 text-center"
                        style={{
                          fontSize: "15px",
                          color: "#6B7280",
                          lineHeight: 1.6,
                        }}
                      >
                        持证人 {companion.name}
                        ，证书由相关权威机构颁发，平台已核实验证，信息真实有效。
                      </p>
                    </div>
                  </SheetContent>
                </Sheet>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {/* User Reviews */}
      <FadeIn delay={0.25}>
        <div className="px-5 mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare
                className="w-5 h-5"
                style={{ color: "#2B9A6F" }}
              />
              <h2
                className="font-semibold"
                style={{ fontSize: "20px", color: "#2D2D2D" }}
              >
                用户评价
              </h2>
            </div>
            <span style={{ fontSize: "14px", color: "#9CA3AF" }}>
              共{companion.reviewCount}条
            </span>
          </div>

          <Stagger className="space-y-3" stagger={0.08}>
            {reviews.map((review) => (
              <motion.div key={review.id} variants={fadeUp}>
                <Card
                  className="p-4"
                  style={{
                    borderRadius: "14px",
                    border: "1px solid #F3F0EB",
                    background: "#FFFFFF",
                  }}
                >
                  <div className="flex gap-3">
                    {/* Reviewer Avatar */}
                    <div
                      className="shrink-0 flex items-center justify-center font-medium"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        background: "#F3F0EB",
                        color: "#6B7280",
                        fontSize: "15px",
                      }}
                    >
                      {review.userName.charAt(0)}
                    </div>
                    <div className="grow min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className="font-medium"
                          style={{ fontSize: "15px", color: "#2D2D2D" }}
                        >
                          {review.userName}
                        </span>
                        <span style={{ fontSize: "13px", color: "#9CA3AF" }}>
                          {review.date}
                        </span>
                      </div>
                      <div className="mt-1">
                        <StarRating rating={review.rating} size={14} />
                      </div>
                      <p
                        className="mt-2 leading-relaxed"
                        style={{ fontSize: "14px", color: "#6B7280" }}
                      >
                        {review.content}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </FadeIn>

      {/* Fixed Bottom Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 py-4 flex items-center gap-4"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid #E8E5E0",
          paddingBottom:
            "calc(16px + env(safe-area-inset-bottom, 0px) + 72px)",
        }}
      >
        <div className="shrink-0">
          <span style={{ fontSize: "13px", color: "#9CA3AF" }}>起</span>
          <span
            className="font-bold ml-0.5"
            style={{ fontSize: "24px", color: "#2B9A6F" }}
          >
            ¥{companion.price}
          </span>
          <span style={{ fontSize: "13px", color: "#9CA3AF" }}>/次</span>
        </div>
        <Link to="/booking" className="grow">
          <Button
            className="w-full text-white font-semibold"
            style={{
              height: "48px",
              borderRadius: "14px",
              fontSize: "17px",
              background:
                "linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%)",
              boxShadow: "0 4px 16px rgba(43,154,111,0.3)",
            }}
          >
            立即预约
          </Button>
        </Link>
      </div>
    </div>
  );
}
