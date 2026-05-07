import { useState, useCallback, useMemo } from "react";
import { MapPin, Bell, Star, ChevronRight, ClipboardList, Pill, Stethoscope, Siren, Navigation, User, Zap, Clock, Check, Locate, CalendarCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toast } from "sonner";
import { FadeIn, Stagger, HoverLift, fadeUp, motion } from "@/components/MotionPrimitives";
import { companions } from "@/data/mockData";

const serviceButtons = [
  { id: "registration", name: "挂号陪诊", icon: ClipboardList, bg: "#E8F5EE", color: "#2B9A6F", urgent: false },
  { id: "medicine", name: "取药陪同", icon: Pill, bg: "#EBF3FC", color: "#4A90D9", urgent: false },
  { id: "examination", name: "检查协助", icon: Stethoscope, bg: "#F3EEFB", color: "#7C6BC4", urgent: false },
  { id: "emergency", name: "紧急陪诊", icon: Siren, bg: "#FFF0ED", color: "#E85D4A", urgent: true },
];

const mapDots = [
  { id: "1", name: "张护士", x: "32%", y: "40%", status: "available" as const },
  { id: "2", name: "李阿姨", x: "58%", y: "28%", status: "available" as const },
  { id: "3", name: "王医助", x: "25%", y: "65%", status: "busy" as const },
  { id: "4", name: "陈护工", x: "72%", y: "58%", status: "available" as const },
];

function CompanionDot({ dot, onTap, isSelected }: { dot: typeof mapDots[0]; onTap: (id: string) => void; isSelected: boolean }) {
  const isAvailable = dot.status === "available";
  return (
    <motion.button
      className="absolute flex items-center justify-center"
      style={{ left: dot.x, top: dot.y }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onTap(dot.id)}
      aria-label={`陪诊员${dot.name}`}
    >
      <span
        className="relative flex items-center justify-center rounded-full transition-all duration-200"
        style={{
          width: isSelected ? 48 : 40,
          height: isSelected ? 48 : 40,
          backgroundColor: isAvailable ? "#2B9A6F" : "#F5A623",
          border: isSelected ? "3px solid #FFFFFF" : "none",
          boxShadow: isSelected ? "0 0 0 3px #2B9A6F, 0 4px 12px rgba(43,154,111,0.4)" : "none",
        }}
      >
        <User className="h-5 w-5 text-white" />
        {isAvailable && !isSelected && (
          <span className="absolute inset-0 animate-ping rounded-full opacity-30" style={{ backgroundColor: "#2B9A6F" }} />
        )}
      </span>
      {/* Name label for selected dot */}
      {isSelected && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-6 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold text-white"
          style={{ backgroundColor: "#2B9A6F", fontSize: 11 }}
        >
          {dot.name}
        </motion.span>
      )}
    </motion.button>
  );
}

/* ─── One-Click Order Confirmation Sheet ─── */
function QuickOrderSheet({
  open,
  onOpenChange,
  companion,
  locating,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  companion: typeof companions[0] | null;
  locating: boolean;
}) {
  const navigate = useNavigate();
  const [dragX, setDragX] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const trackWidth = 280;
  const handleSize = 56;
  const threshold = trackWidth - handleSize - 16;

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number } }) => {
      if (info.offset.x >= threshold) {
        setConfirmed(true);
        toast.success("下单成功！正在为您匹配陪诊员");
        setTimeout(() => {
          onOpenChange(false);
          setConfirmed(false);
          setDragX(0);
          navigate("/tracking");
        }, 1200);
      } else {
        setDragX(0);
      }
    },
    [threshold, onOpenChange, navigate],
  );

  if (!companion) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl border-0 px-0 pb-8 pt-3">
        {/* Handle bar */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ backgroundColor: "#E8E5E0" }} />

        {/* Locating animation */}
        {locating ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: "#E8F5EE" }}
            >
              <Locate className="h-8 w-8" style={{ color: "#2B9A6F" }} />
            </motion.div>
            <p className="text-lg font-semibold" style={{ color: "#2D2D2D" }}>正在获取您的位置...</p>
            <p className="text-sm" style={{ color: "#6B7280" }}>自动匹配最近的陪诊员</p>
          </div>
        ) : (
          <div className="px-5">
            {/* Matched title */}
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: "#E8F5EE" }}>
                <Check className="h-4 w-4" style={{ color: "#2B9A6F" }} />
              </div>
              <span className="text-lg font-bold" style={{ color: "#2D2D2D" }}>已为您匹配最近陪诊员</span>
            </div>

            {/* Companion Card */}
            <Card className="mb-4 border-0 p-5" style={{ boxShadow: "0 2px 16px rgba(45,45,45,0.08)", backgroundColor: "#FFFFFF" }}>
              <div className="flex items-center gap-4">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: "#E8F5EE", border: "2.5px solid #2B9A6F" }}
                >
                  <User className="h-8 w-8" style={{ color: "#2B9A6F" }} />
                </div>
                <div className="grow">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold" style={{ color: "#2D2D2D" }}>{companion.name}</span>
                    <Badge className="rounded-full border-0 px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: "#E8F5EE", color: "#2B9A6F" }}>
                      在线
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current" style={{ color: "#F5A623" }} />
                      <span className="text-base font-semibold" style={{ color: "#2D2D2D" }}>{companion.rating}</span>
                      <span className="text-sm" style={{ color: "#9CA3AF" }}>({companion.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" style={{ color: "#9CA3AF" }} />
                      <span className="text-sm font-medium" style={{ color: "#6B7280" }}>{companion.distance}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service tags */}
              <div className="mt-3 flex flex-wrap gap-2">
                {companion.services.slice(0, 3).map((svc) => (
                  <span key={svc} className="rounded-lg px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: "#F3F0EB", color: "#6B7280" }}>
                    {svc}
                  </span>
                ))}
              </div>
            </Card>

            {/* Order details */}
            <div className="mb-5 rounded-2xl p-4" style={{ backgroundColor: "#FAFAF8" }}>
              <div className="flex items-center justify-between py-2">
                <span className="text-base" style={{ color: "#6B7280" }}>服务类型</span>
                <span className="text-base font-semibold" style={{ color: "#2D2D2D" }}>挂号陪诊</span>
              </div>
              <div className="flex items-center justify-between border-t py-2" style={{ borderColor: "#E8E5E0" }}>
                <span className="text-base" style={{ color: "#6B7280" }}>预计到达</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" style={{ color: "#2B9A6F" }} />
                  <span className="text-base font-semibold" style={{ color: "#2B9A6F" }}>
                    约 {Math.round(companion.distanceKm * 10)} 分钟
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t py-2" style={{ borderColor: "#E8E5E0" }}>
                <span className="text-base" style={{ color: "#6B7280" }}>预计费用</span>
                <span className="text-xl font-bold" style={{ color: "#2B9A6F" }}>
                  ¥{companion.price}
                </span>
              </div>
            </div>

            {/* Swipe to Confirm */}
            {!confirmed ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm font-medium" style={{ color: "#9CA3AF" }}>向右滑动确认下单</p>
                <div
                  className="relative flex items-center rounded-full"
                  style={{
                    width: trackWidth,
                    height: handleSize,
                    backgroundColor: "#E8F5EE",
                    overflow: "hidden",
                  }}
                >
                  {/* Track label */}
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium" style={{ color: "#2B9A6F" }}>
                    滑动确认下单
                  </span>
                  {/* Drag handle */}
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: trackWidth - handleSize - 8 }}
                    dragElastic={0}
                    onDrag={(_, info) => setDragX(info.offset.x)}
                    onDragEnd={handleDragEnd}
                    animate={!confirmed ? { x: dragX > 0 ? undefined : 0 } : { x: trackWidth - handleSize - 8 }}
                    className="relative z-10 flex items-center justify-center rounded-full"
                    style={{
                      width: handleSize,
                      height: handleSize - 8,
                      margin: 4,
                      background: "linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%)",
                      boxShadow: "0 4px 12px rgba(43,154,111,0.3)",
                      cursor: "grab",
                    }}
                    whileTap={{ cursor: "grabbing" }}
                  >
                    <ChevronRight className="h-6 w-6 text-white" />
                  </motion.div>
                  {/* Progress fill */}
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: dragX + handleSize,
                      backgroundColor: "rgba(43,154,111,0.15)",
                    }}
                  />
                </div>

                {/* Also allow tap confirm */}
                <button
                  onClick={() => {
                    setConfirmed(true);
                    toast.success("下单成功！正在为您匹配陪诊员");
                    setTimeout(() => {
                      onOpenChange(false);
                      setConfirmed(false);
                      setDragX(0);
                      navigate("/tracking");
                    }, 1200);
                  }}
                  className="mt-1 text-base font-medium underline"
                  style={{ color: "#2B9A6F", minHeight: 44 }}
                >
                  或点击此处确认
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-3 py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: "#2B9A6F" }}
                >
                  <Check className="h-8 w-8 text-white" />
                </motion.div>
                <p className="text-lg font-bold" style={{ color: "#2B9A6F" }}>下单成功</p>
                <p className="text-sm" style={{ color: "#6B7280" }}>正在跳转到订单追踪...</p>
              </motion.div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* ─── Map Companion Preview Card ─── */
function MapCompanionCard({ companion, onBook }: { companion: typeof companions[0]; onBook: (c: typeof companions[0]) => void }) {
  const isAvailable = companion.status === "available";
  const statusColor = isAvailable ? "#2B9A6F" : "#F5A623";

  return (
    <motion.div
      key={companion.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="border-0 p-4" style={{ boxShadow: "0 4px 20px rgba(45,45,45,0.10)" }}>
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${statusColor}18`, border: `2.5px solid ${statusColor}` }}
          >
            <User className="h-7 w-7" style={{ color: statusColor }} />
          </div>
          {/* Info */}
          <div className="min-w-0 grow">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold" style={{ color: "#2D2D2D" }}>{companion.name}</span>
              <Badge variant="secondary" className="rounded-full border-0 px-2 py-0.5" style={{ backgroundColor: `${statusColor}18`, color: statusColor, fontSize: 13 }}>
                {isAvailable ? "在线" : "忙碌"}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-current" style={{ color: "#F5A623" }} />
                <span className="font-semibold" style={{ color: "#2D2D2D", fontSize: 15 }}>{companion.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" style={{ color: "#9CA3AF" }} />
                <span className="font-medium" style={{ color: "#6B7280", fontSize: 15 }}>{companion.distance}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" style={{ color: "#9CA3AF" }} />
                <span style={{ color: "#6B7280", fontSize: 15 }}>约{Math.round(companion.distanceKm * 10)}分钟</span>
              </div>
            </div>
          </div>
        </div>
        {/* Service tags + price + book button */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {companion.services.slice(0, 2).map((svc) => (
              <span key={svc} className="rounded-lg px-2 py-0.5 font-medium" style={{ backgroundColor: "#E8F5EE", color: "#2B9A6F", fontSize: 15 }}>
                {svc}
              </span>
            ))}
          </div>
          <span className="text-lg font-bold" style={{ color: "#2B9A6F" }}>¥{companion.price}</span>
        </div>
        {/* Action buttons */}
        <div className="mt-3 flex gap-2">
          <Link
            to={`/companion/${companion.id}`}
            className="flex h-11 grow items-center justify-center rounded-xl font-semibold transition-colors"
            style={{ backgroundColor: "#F3F0EB", color: "#6B7280", fontSize: 18 }}
          >
            查看详情
          </Link>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onBook(companion)}
            className="flex h-11 grow items-center justify-center gap-1.5 rounded-xl font-semibold text-white"
            style={{
              background: isAvailable ? "linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%)" : "#D1D5DB",
              fontSize: 18,
              cursor: isAvailable ? "pointer" : "not-allowed",
            }}
            disabled={!isAvailable}
          >
            <CalendarCheck className="h-5 w-5" />
            立即预约
          </motion.button>
        </div>
      </Card>
    </motion.div>
  );
}

/* ─── Map View ─── */
function MapView({ onQuickOrder, selectedId, onSelectCompanion, onBookCompanion }: {
  onQuickOrder: () => void;
  selectedId: string;
  onSelectCompanion: (id: string) => void;
  onBookCompanion: (c: typeof companions[0]) => void;
}) {
  const availableCount = companions.filter((c) => c.status === "available").length;
  const selectedCompanion = companions.find((c) => c.id === selectedId) || companions[0];

  return (
    <div className="px-5">
      {/* Map area */}
      <div className="relative overflow-hidden rounded-2xl" style={{ height: 260 }}>
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(160deg, #e8f0e4 0%, #d4e4d0 30%, #e0eadc 60%, #dce8d6 100%)",
          }}
        >
          <svg className="absolute inset-0 h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#2B9A6F" strokeWidth="1.5" />
            <line x1="0" y1="60%" x2="100%" y2="55%" stroke="#2B9A6F" strokeWidth="1" />
            <line x1="20%" y1="0" x2="25%" y2="100%" stroke="#2B9A6F" strokeWidth="1" />
            <line x1="55%" y1="0" x2="50%" y2="100%" stroke="#2B9A6F" strokeWidth="1.5" />
            <line x1="80%" y1="0" x2="85%" y2="100%" stroke="#2B9A6F" strokeWidth="1" />
            <rect x="30%" y="42%" width="18%" height="12%" rx="4" fill="#2B9A6F" opacity="0.08" />
            <rect x="60%" y="15%" width="14%" height="10%" rx="4" fill="#2B9A6F" opacity="0.06" />
          </svg>

          <div className="absolute flex flex-col items-center" style={{ left: "48%", top: "48%", transform: "translate(-50%, -50%)" }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-white" style={{ backgroundColor: "#4A90D9" }}>
              <Navigation className="h-5 w-5 text-white" />
            </div>
            <span className="mt-1 rounded-full px-2 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: "#4A90D9", fontSize: 11 }}>
              我的位置
            </span>
          </div>

          {mapDots.map((dot) => (
            <CompanionDot key={dot.id} dot={dot} isSelected={dot.id === selectedId} onTap={onSelectCompanion} />
          ))}
        </div>

        {/* Bottom info overlay */}
        <div
          className="absolute inset-x-0 bottom-0 flex items-center px-4 py-3"
          style={{ background: "linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)" }}
        >
          <span className="text-base font-semibold" style={{ color: "#2D2D2D" }}>
            附近 <span style={{ color: "#2B9A6F" }}>{availableCount}</span> 位陪诊员可服务
          </span>
        </div>
      </div>

      {/* One-Click Order Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        onClick={onQuickOrder}
        className="relative mt-4 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl py-4 text-lg font-bold text-white"
        style={{
          background: "linear-gradient(135deg, #2B9A6F 0%, #3DB88A 50%, #2B9A6F 100%)",
          backgroundSize: "200% 100%",
          minHeight: 60,
        }}
      >
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(43,154,111,0.4)",
              "0 0 0 8px rgba(43,154,111,0)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.span
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
            width: "60%",
          }}
          animate={{ x: ["-100%", "260%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
        />
        <Zap className="h-6 w-6" />
        一键下单
        <span className="ml-1 text-sm font-medium text-white/80">自动匹配最近陪诊员</span>
      </motion.button>

      {/* Companion Preview Card — switches on map dot tap */}
      <div className="mt-4">
        <MapCompanionCard companion={selectedCompanion} onBook={onBookCompanion} />
      </div>
    </div>
  );
}

function CompanionCard({ companion }: { companion: typeof companions[0] }) {
  const isAvailable = companion.status === "available";
  const statusColor = isAvailable ? "#2B9A6F" : "#F5A623";
  const statusText = isAvailable ? "可预约" : "忙碌中";

  return (
    <Link to={`/companion/${companion.id}`} className="block">
      <Card className="flex items-center gap-4 border-0 p-5" style={{ boxShadow: "0 2px 12px rgba(45,45,45,0.06)" }}>
        <div
          className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${statusColor}15`, border: `2px solid ${statusColor}` }}
        >
          <User className="h-7 w-7" style={{ color: statusColor }} />
          <span
            className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white"
            style={{ backgroundColor: statusColor }}
          />
        </div>
        <div className="min-w-0 grow">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold" style={{ color: "#2D2D2D" }}>{companion.name}</span>
            <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: `${statusColor}15`, color: statusColor }}>
              {statusText}
            </Badge>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Star className="h-4 w-4 fill-current" style={{ color: "#F5A623" }} />
            <span className="text-sm font-medium" style={{ color: "#2D2D2D" }}>{companion.rating}</span>
            <span className="text-sm" style={{ color: "#9CA3AF" }}>({companion.reviewCount})</span>
            <span className="text-sm" style={{ color: "#9CA3AF" }}>|</span>
            <MapPin className="h-3.5 w-3.5" style={{ color: "#9CA3AF" }} />
            <span className="text-sm" style={{ color: "#6B7280" }}>{companion.distance}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {companion.services.slice(0, 3).map((svc) => (
              <span key={svc} className="rounded-lg px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: "#E8F5EE", color: "#2B9A6F" }}>
                {svc}
              </span>
            ))}
          </div>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0" style={{ color: "#9CA3AF" }} />
      </Card>
    </Link>
  );
}

function ListView() {
  return (
    <Stagger className="flex flex-col gap-3 px-5" stagger={0.08}>
      {companions.map((companion) => (
        <motion.div key={companion.id} variants={fadeUp}>
          <HoverLift lift={-3}>
            <CompanionCard companion={companion} />
          </HoverLift>
        </motion.div>
      ))}
    </Stagger>
  );
}

export default function Index() {
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [matchedCompanion, setMatchedCompanion] = useState<typeof companions[0] | null>(null);

  // Default to nearest available companion
  const nearestId = useMemo(() => {
    const nearest = companions
      .filter((c) => c.status === "available")
      .sort((a, b) => a.distanceKm - b.distanceKm)[0];
    return nearest?.id || "1";
  }, []);
  const [selectedDotId, setSelectedDotId] = useState(nearestId);

  const handleQuickOrder = useCallback(() => {
    setQuickOrderOpen(true);
    setLocating(true);
    setMatchedCompanion(null);

    setTimeout(() => {
      const nearest = companions
        .filter((c) => c.status === "available")
        .sort((a, b) => a.distanceKm - b.distanceKm)[0];
      setMatchedCompanion(nearest);
      setLocating(false);
    }, 1500);
  }, []);

  const handleBookCompanion = useCallback((c: typeof companions[0]) => {
    setMatchedCompanion(c);
    setQuickOrderOpen(true);
    setLocating(false);
  }, []);

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#FAFAF8" }}>
      {/* Top Section - Location & Greeting */}
      <FadeIn variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5 } } }}>
        <div
          className="px-5 pb-6 pt-12"
          style={{ background: "linear-gradient(180deg, #E8F5EE 0%, #FAFAF8 100%)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-5 w-5" style={{ color: "#2B9A6F" }} />
              <span className="text-lg font-medium" style={{ color: "#2D2D2D" }}>上海市 浦东新区</span>
            </div>
            <button
              className="relative flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.8)" }}
              aria-label="通知"
            >
              <Bell className="h-6 w-6" style={{ color: "#2D2D2D" }} />
              <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#E85D4A", border: "2px solid white" }} />
            </button>
          </div>
          <div className="mt-4">
            <h1 className="text-[28px] font-bold leading-tight" style={{ color: "#2D2D2D" }}>
              您好，张奶奶
            </h1>
            <p className="mt-1 text-base" style={{ color: "#6B7280" }}>
              今天需要什么帮助？
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Map/List Toggle */}
      <FadeIn delay={0.1}>
        <div className="flex gap-3 px-5 pb-4">
          {(["map", "list"] as const).map((mode) => {
            const isActive = viewMode === mode;
            const label = mode === "map" ? "地图模式" : "列表模式";
            return (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="flex h-11 grow items-center justify-center rounded-xl text-base font-medium transition-all duration-200"
                style={{
                  backgroundColor: isActive ? "#2B9A6F" : "#FFFFFF",
                  color: isActive ? "#FFFFFF" : "#6B7280",
                  border: isActive ? "none" : "1.5px solid #E8E5E0",
                  boxShadow: isActive ? "0 4px 12px rgba(43,154,111,0.25)" : "none",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </FadeIn>

      {/* Content Area */}
      {viewMode === "map" ? (
        <MapView
          onQuickOrder={handleQuickOrder}
          selectedId={selectedDotId}
          onSelectCompanion={setSelectedDotId}
          onBookCompanion={handleBookCompanion}
        />
      ) : (
        <ListView />
      )}

      {/* Quick Service Buttons */}
      <FadeIn delay={0.2}>
        <div className="mt-6 px-5">
          <h2 className="mb-4 text-xl font-bold" style={{ color: "#2D2D2D" }}>
            快速预约服务
          </h2>
          <Stagger className="grid grid-cols-2 gap-3" stagger={0.06}>
            {serviceButtons.map((svc) => {
              const IconComp = svc.icon;
              return (
                <motion.div key={svc.id} variants={fadeUp}>
                  <HoverLift lift={-3}>
                    <Link to={`/booking?service=${svc.id}`}>
                      <div
                        className="relative flex h-20 flex-col items-center justify-center gap-2 rounded-2xl transition-all duration-200"
                        style={{ backgroundColor: svc.bg }}
                      >
                        <IconComp className="h-7 w-7" style={{ color: svc.color }} />
                        <span className="text-base font-semibold" style={{ color: svc.color }}>
                          {svc.name}
                        </span>
                        {svc.urgent && (
                          <span
                            className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-bold text-white"
                            style={{ backgroundColor: "#E85D4A" }}
                          >
                            紧急
                          </span>
                        )}
                      </div>
                    </Link>
                  </HoverLift>
                </motion.div>
              );
            })}
          </Stagger>
        </div>
      </FadeIn>

      {/* Active Order Banner */}
      <FadeIn delay={0.3}>
        <div className="mx-5 mt-6">
          <Link to="/tracking">
            <Card
              className="flex items-center gap-4 border-0 p-4"
              style={{
                background: "linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%)",
                boxShadow: "0 4px 16px rgba(43,154,111,0.3)",
              }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <Navigation className="h-6 w-6 text-white" />
              </div>
              <div className="grow">
                <p className="text-base font-semibold text-white">进行中的订单</p>
                <p className="mt-0.5 text-sm text-white/80">张护士正在前往 - 预计8分钟到达</p>
              </div>
              <ChevronRight className="h-5 w-5 text-white/80" />
            </Card>
          </Link>
        </div>
      </FadeIn>

      {/* Quick Order Confirmation Sheet */}
      <QuickOrderSheet
        open={quickOrderOpen}
        onOpenChange={setQuickOrderOpen}
        companion={matchedCompanion}
        locating={locating}
      />
    </div>
  );
}
