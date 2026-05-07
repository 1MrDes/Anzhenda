import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  ClipboardList,
  Pill,
  Stethoscope,
  Siren,
  Building2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FadeIn,
  Stagger,
  HoverLift,
  fadeUp,
  motion,
} from "@/components/MotionPrimitives";
import { serviceTypes } from "@/data/mockData";

const iconMap: Record<string, React.ElementType> = {
  ClipboardList,
  Pill,
  Stethoscope,
  Siren,
};

const bgColorMap: Record<string, string> = {
  "#2B9A6F": "rgba(43,154,111,0.12)",
  "#4A90D9": "rgba(74,144,217,0.12)",
  "#7C6BC4": "rgba(124,107,196,0.12)",
  "#E85D4A": "rgba(232,93,74,0.12)",
};

const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
const timeSlots = ["09:00", "10:00", "14:00", "15:00"];

const hospitals = [
  "上海市第一人民医院",
  "华山医院",
  "瑞金医院",
  "中山医院",
  "仁济医院",
];

function getNext7Days() {
  const days: { label: string; date: string; weekDay: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    days.push({
      label: `${month}月${day}日`,
      date: `${d.getFullYear()}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      weekDay: i === 0 ? "今天" : `周${weekDays[d.getDay()]}`,
    });
  }
  return days;
}

export default function Booking() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedHospital, setSelectedHospital] = useState(hospitals[0]);

  const dates = useMemo(() => getNext7Days(), []);

  // Initialize defaults
  useState(() => {
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0].date);
    }
  });

  const selectedServiceData = serviceTypes.find(
    (s) => s.id === selectedService,
  );
  const canConfirm = selectedService && selectedDate && selectedTime;

  return (
    <div className="min-h-screen pb-48" style={{ background: "#FAFAF8" }}>
      {/* Header */}
      <FadeIn>
        <div className="px-5 pt-6 pb-4">
          <h1
            className="font-bold"
            style={{ fontSize: "24px", color: "#2D2D2D" }}
          >
            选择服务
          </h1>
          <p className="mt-1" style={{ fontSize: "18px", color: "#6B7280" }}>
            请选择您需要的陪诊服务
          </p>
        </div>
      </FadeIn>

      {/* Service Type Cards */}
      <Stagger className="px-5 space-y-3" stagger={0.08}>
        {serviceTypes.map((service) => {
          const IconComponent = iconMap[service.icon] || ClipboardList;
          const isSelected = selectedService === service.id;
          const isUrgent = service.priority === "urgent";

          return (
            <motion.div key={service.id} variants={fadeUp}>
              <HoverLift lift={-2}>
                <Card
                  className={`p-5 cursor-pointer transition-all duration-200`}
                  style={{
                    borderRadius: "16px",
                    border: isSelected
                      ? "2px solid #2B9A6F"
                      : isUrgent
                        ? "1px solid #E8E5E0"
                        : "1px solid #E8E5E0",
                    borderLeft: isUrgent
                      ? "3px solid #E85D4A"
                      : isSelected
                        ? "2px solid #2B9A6F"
                        : "1px solid #E8E5E0",
                    background: isSelected ? "#F0FAF5" : "#FFFFFF",
                    boxShadow: isSelected
                      ? "0 4px 16px rgba(43,154,111,0.12)"
                      : "0 2px 8px rgba(45,45,45,0.04)",
                  }}
                  onClick={() => setSelectedService(service.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="shrink-0 flex items-center justify-center"
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "14px",
                        background: bgColorMap[service.color],
                      }}
                    >
                      <IconComponent
                        style={{ color: service.color }}
                        className="w-6 h-6"
                      />
                    </div>

                    {/* Content */}
                    <div className="grow min-w-0">
                      <div className="flex items-center justify-between">
                        <h3
                          className="font-semibold"
                          style={{ fontSize: "18px", color: "#2D2D2D" }}
                        >
                          {service.name}
                        </h3>
                        {isUrgent && (
                          <span
                            className="px-2 py-0.5 text-white font-medium"
                            style={{
                              fontSize: "14px",
                              borderRadius: "6px",
                              background: "#E85D4A",
                            }}
                          >
                            紧急
                          </span>
                        )}
                      </div>
                      <p
                        className="mt-1 leading-relaxed"
                        style={{ fontSize: "18px", color: "#6B7280" }}
                      >
                        {service.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <span
                          className="font-bold"
                          style={{ fontSize: "18px", color: service.color }}
                        >
                          ¥{service.price}
                          <span
                            className="font-normal"
                            style={{ fontSize: "15px", color: "#9CA3AF" }}
                          >
                            /次
                          </span>
                        </span>
                        <span
                          className="flex items-center gap-1"
                          style={{ fontSize: "15px", color: "#9CA3AF" }}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {service.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </HoverLift>
            </motion.div>
          );
        })}
      </Stagger>

      {/* Date Selection */}
      <FadeIn delay={0.2}>
        <div className="px-5 mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5" style={{ color: "#2B9A6F" }} />
            <h2
              className="font-semibold"
              style={{ fontSize: "20px", color: "#2D2D2D" }}
            >
              选择日期和时间
            </h2>
          </div>

          {/* Date pills - horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {dates.map((d) => {
              const isActive = selectedDate === d.date;
              return (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  className="shrink-0 flex flex-col items-center justify-center transition-all duration-200"
                  style={{
                    minWidth: "72px",
                    height: "72px",
                    borderRadius: "16px",
                    border: isActive
                      ? "2px solid #2B9A6F"
                      : "1px solid #E8E5E0",
                    background: isActive ? "#2B9A6F" : "#FFFFFF",
                    color: isActive ? "#FFFFFF" : "#2D2D2D",
                  }}
                >
                  <span
                    className="font-medium"
                    style={{
                      fontSize: "15px",
                      color: isActive ? "rgba(255,255,255,0.8)" : "#6B7280",
                    }}
                  >
                    {d.weekDay}
                  </span>
                  <span
                    className="font-semibold mt-0.5"
                    style={{ fontSize: "16px" }}
                  >
                    {d.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Time Slots */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            {timeSlots.map((time) => {
              const isActive = selectedTime === time;
              return (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className="flex items-center justify-center transition-all duration-200"
                  style={{
                    height: "48px",
                    borderRadius: "12px",
                    border: isActive
                      ? "2px solid #2B9A6F"
                      : "1px solid #E8E5E0",
                    background: isActive ? "#E8F5EE" : "#FFFFFF",
                    color: isActive ? "#2B9A6F" : "#2D2D2D",
                    fontSize: "18px",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {/* Hospital Selection */}
      <FadeIn delay={0.3}>
        <div className="px-5 mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5" style={{ color: "#2B9A6F" }} />
            <h2
              className="font-semibold"
              style={{ fontSize: "20px", color: "#2D2D2D" }}
            >
              选择医院
            </h2>
          </div>

          <div className="space-y-2">
            {hospitals.map((hospital) => {
              const isActive = selectedHospital === hospital;
              return (
                <button
                  key={hospital}
                  onClick={() => setSelectedHospital(hospital)}
                  className="w-full flex items-center justify-between px-4 transition-all duration-200"
                  style={{
                    height: "56px",
                    borderRadius: "14px",
                    border: isActive
                      ? "2px solid #2B9A6F"
                      : "1px solid #E8E5E0",
                    background: isActive ? "#F0FAF5" : "#FFFFFF",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <MapPin
                      className="w-5 h-5"
                      style={{ color: isActive ? "#2B9A6F" : "#9CA3AF" }}
                    />
                    <span
                      className="font-medium"
                      style={{
                        fontSize: "18px",
                        color: isActive ? "#2B9A6F" : "#2D2D2D",
                      }}
                    >
                      {hospital}
                    </span>
                  </div>
                  {isActive && (
                    <div
                      className="w-5 h-5 flex items-center justify-center rounded-full"
                      style={{ background: "#2B9A6F" }}
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {/* Bottom Fixed Button */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 pt-4 pb-6"
        style={{
          background:
            "linear-gradient(to top, #FAFAF8 80%, rgba(250,250,248,0))",
          paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px) + 72px)",
        }}
      >
        <Link to={canConfirm ? "/payment" : "#"}>
          <Button
            className="w-full text-white font-semibold transition-all duration-200"
            disabled={!canConfirm}
            style={{
              height: "56px",
              borderRadius: "16px",
              fontSize: "18px",
              background: canConfirm
                ? "linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%)"
                : "#D1D5DB",
              boxShadow: canConfirm
                ? "0 4px 16px rgba(43,154,111,0.3)"
                : "none",
            }}
          >
            确认预约
            {selectedServiceData && (
              <span className="ml-2 opacity-90">
                ¥{selectedServiceData.price}
              </span>
            )}
          </Button>
        </Link>
      </div>
    </div>
  );
}
