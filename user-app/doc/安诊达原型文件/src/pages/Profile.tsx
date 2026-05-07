import { useState } from "react";
import {
  Phone,
  MapPin,
  Heart,
  Type,
  Mic,
  Contrast,
  HelpCircle,
  MessageSquare,
  Info,
  LogOut,
  ChevronRight,
  Camera,
  Award,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FadeIn, Stagger, fadeUp, motion } from "@/components/MotionPrimitives";

interface SettingItem {
  icon: React.ElementType;
  label: string;
  iconColor: string;
  iconBg: string;
  type: "link" | "switch" | "slider";
  value?: boolean;
}

const serviceSettings: SettingItem[] = [
  {
    icon: Phone,
    label: "紧急联系人",
    iconColor: "#E85D4A",
    iconBg: "#FFF0ED",
    type: "link",
  },
  {
    icon: MapPin,
    label: "常用医院",
    iconColor: "#4A90D9",
    iconBg: "#EBF3FC",
    type: "link",
  },
  {
    icon: Heart,
    label: "服务偏好",
    iconColor: "#E85D4A",
    iconBg: "#FFF0ED",
    type: "link",
  },
];

const accessibilitySettings: SettingItem[] = [
  {
    icon: Type,
    label: "字体大小",
    iconColor: "#2B9A6F",
    iconBg: "#E8F5EE",
    type: "slider",
  },
  {
    icon: Mic,
    label: "语音助手",
    iconColor: "#4A90D9",
    iconBg: "#EBF3FC",
    type: "switch",
    value: true,
  },
  {
    icon: Contrast,
    label: "高对比度模式",
    iconColor: "#2D2D2D",
    iconBg: "#F3F0EB",
    type: "switch",
    value: false,
  },
];

const otherSettings: SettingItem[] = [
  {
    icon: HelpCircle,
    label: "帮助中心",
    iconColor: "#F5A623",
    iconBg: "#FFF5E0",
    type: "link",
  },
  {
    icon: MessageSquare,
    label: "意见反馈",
    iconColor: "#7C6BC4",
    iconBg: "#F3EEFB",
    type: "link",
  },
  {
    icon: Info,
    label: "关于安诊达",
    iconColor: "#2B9A6F",
    iconBg: "#E8F5EE",
    type: "link",
  },
];

const fontSizeLabels = ["小", "标准", "大"];

export default function Profile() {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSizeIndex, setFontSizeIndex] = useState(2);

  const renderSettingItem = (item: SettingItem, _index: number, isLast: boolean) => {
    return (
      <motion.div key={item.label} variants={fadeUp}>
        <div
          className="flex items-center gap-4 py-4 px-1"
          style={{
            borderBottom: isLast ? "none" : "1px solid #F3F0EB",
            minHeight: "56px",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: item.iconBg }}
          >
            <item.icon className="w-5 h-5" style={{ color: item.iconColor }} />
          </div>
          <span
            className="text-base font-medium grow"
            style={{ color: "#2D2D2D", fontSize: "18px" }}
          >
            {item.label}
          </span>

          {item.type === "link" && (
            <ChevronRight className="w-5 h-5" style={{ color: "#9CA3AF" }} />
          )}

          {item.type === "switch" && item.label === "语音助手" && (
            <Switch
              checked={voiceEnabled}
              onCheckedChange={setVoiceEnabled}
              className="scale-125"
            />
          )}

          {item.type === "switch" && item.label === "高对比度模式" && (
            <Switch
              checked={highContrast}
              onCheckedChange={setHighContrast}
              className="scale-125"
            />
          )}

          {item.type === "slider" && (
            <div className="flex items-center gap-3">
              {fontSizeLabels.map((label, i) => (
                <button
                  key={label}
                  onClick={() => setFontSizeIndex(i)}
                  className="px-3 py-1.5 rounded-lg font-medium transition-all"
                  style={{
                    background: fontSizeIndex === i ? "#2B9A6F" : "#F3F0EB",
                    color: fontSizeIndex === i ? "#FFFFFF" : "#6B7280",
                    fontSize: i === 0 ? "14px" : i === 1 ? "16px" : "18px",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderSection = (
    title: string,
    items: SettingItem[]
  ) => (
    <Card
      className="border-0 overflow-hidden"
      style={{
        borderRadius: "16px",
        boxShadow: "0 2px 12px rgba(45,45,45,0.06)",
      }}
    >
      <div className="px-5 pt-4 pb-1">
        <p
          className="text-base font-medium mb-1"
          style={{ color: "#9CA3AF" }}
        >
          {title}
        </p>
      </div>
      <Stagger className="px-4">
        {items.map((item, index) =>
          renderSettingItem(item, index, index === items.length - 1)
        )}
      </Stagger>
    </Card>
  );

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAFAF8" }}>
      {/* Profile Hero */}
      <div
        className="px-5 pt-10 pb-8"
        style={{
          background: "linear-gradient(180deg, #E8F5EE 0%, #FAFAF8 100%)",
        }}
      >
        <FadeIn>
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                style={{
                  background: "linear-gradient(135deg, #2B9A6F, #3DB88A)",
                  boxShadow: "0 4px 16px rgba(43,154,111,0.3)",
                }}
              >
                张
              </div>
              <button
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: "#FFFFFF",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Camera className="w-3.5 h-3.5" style={{ color: "#6B7280" }} />
              </button>
            </div>

            <h1
              className="text-2xl font-bold mb-1"
              style={{ color: "#2D2D2D" }}
            >
              张奶奶
            </h1>
            <p className="text-base mb-3" style={{ color: "#6B7280" }}>
              138****5678
            </p>
            <div
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full"
              style={{ background: "#FFF5E0" }}
            >
              <Award className="w-4 h-4" style={{ color: "#F5A623" }} />
              <span
                className="text-base font-medium"
                style={{ color: "#F5A623" }}
              >
                金牌会员
              </span>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Stats Row */}
      <FadeIn delay={0.1}>
        <div className="px-5 -mt-2 mb-5">
          <Card
            className="border-0 p-4"
            style={{
              borderRadius: "16px",
              boxShadow: "0 2px 12px rgba(45,45,45,0.06)",
            }}
          >
            <div className="grid grid-cols-3 divide-x" style={{ borderColor: "#F3F0EB" }}>
              <div className="text-center px-2">
                <p
                  className="text-xl font-bold"
                  style={{ color: "#2B9A6F" }}
                >
                  12
                </p>
                <p className="text-base" style={{ color: "#6B7280" }}>
                  服务次数
                </p>
              </div>
              <div className="text-center px-2">
                <p
                  className="text-xl font-bold"
                  style={{ color: "#4A90D9" }}
                >
                  3
                </p>
                <p className="text-base" style={{ color: "#6B7280" }}>
                  绑定家人
                </p>
              </div>
              <div className="text-center px-2">
                <p
                  className="text-xl font-bold"
                  style={{ color: "#F5A623" }}
                >
                  680
                </p>
                <p className="text-base" style={{ color: "#6B7280" }}>
                  积分
                </p>
              </div>
            </div>
          </Card>
        </div>
      </FadeIn>

      {/* Settings Sections */}
      <div className="px-5 space-y-4">
        <FadeIn delay={0.15}>
          {renderSection("服务设置", serviceSettings)}
        </FadeIn>

        <FadeIn delay={0.2}>
          {renderSection("辅助功能", accessibilitySettings)}
        </FadeIn>

        <FadeIn delay={0.25}>
          {renderSection("其他", otherSettings)}
        </FadeIn>

        {/* Logout Button */}
        <FadeIn delay={0.3}>
          <Button
            variant="outline"
            className="w-full h-14 text-base font-medium rounded-xl mt-4"
            style={{
              borderColor: "#E85D4A",
              color: "#E85D4A",
              background: "transparent",
            }}
          >
            <LogOut className="w-5 h-5 mr-2" />
            退出登录
          </Button>
        </FadeIn>
      </div>
    </div>
  );
}
