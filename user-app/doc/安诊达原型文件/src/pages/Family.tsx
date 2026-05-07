import { useState } from "react";
import {
  Heart,
  Plus,
  Phone,
  Calendar,
  CreditCard,
  FileText,
  Activity,
  Users,
  Check,
  Pill,
  Stethoscope,
} from "lucide-react";
import { Link } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { FadeIn, Stagger, HoverLift, fadeUp, motion } from "@/components/MotionPrimitives";
import { familyMembers } from "@/data/mockData";

const relations = ["父亲", "母亲", "配偶", "子女", "其他"];

const activityFeed = [
  {
    id: "1",
    member: "妈妈",
    date: "4月13日",
    service: "取药陪同",
    status: "已完成",
    icon: Pill,
    color: "#4A90D9",
  },
  {
    id: "2",
    member: "爸爸",
    date: "4月10日",
    service: "检查协助",
    status: "已完成",
    icon: Stethoscope,
    color: "#7C6BC4",
  },
];

export default function Family() {
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRelation, setNewRelation] = useState("");

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAFAF8" }}>
      {/* Header Area */}
      <div
        className="px-5 pt-8 pb-6"
        style={{
          background: "linear-gradient(180deg, #EBF3FC 0%, #FAFAF8 100%)",
        }}
      >
        <FadeIn>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "#4A90D9" }}
            >
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "#2D2D2D" }}
              >
                家庭关怀
              </h1>
              <p className="text-base" style={{ color: "#6B7280" }}>
                关心家人，从这里开始
              </p>
            </div>
          </div>
        </FadeIn>
      </div>

      <div className="px-5 space-y-5">
        {/* Bound Family Members */}
        <FadeIn delay={0.1}>
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5" style={{ color: "#E85D4A" }} />
            <h2
              className="text-lg font-semibold"
              style={{ color: "#2D2D2D" }}
            >
              已绑定家人
            </h2>
          </div>
        </FadeIn>

        <Stagger className="space-y-3">
          {familyMembers.map((member) => (
            <motion.div key={member.id} variants={fadeUp}>
              <HoverLift>
                <Card
                  className="p-5 border-0"
                  style={{
                    borderRadius: "16px",
                    boxShadow:
                      "0 2px 12px rgba(45,45,45,0.06), 0 1px 4px rgba(45,45,45,0.04)",
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-semibold shrink-0"
                      style={{
                        background:
                          member.relation === "母亲"
                            ? "linear-gradient(135deg, #E85D4A, #F08070)"
                            : "linear-gradient(135deg, #4A90D9, #6BA8E8)",
                      }}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div className="grow">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-lg font-semibold"
                          style={{ color: "#2D2D2D" }}
                        >
                          {member.name}
                        </span>
                        <Badge
                          className="border-0"
                          style={{
                            background: "#F3F0EB",
                            color: "#6B7280",
                            fontSize: 15,
                          }}
                        >
                          {member.relation}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Phone
                          className="w-3.5 h-3.5"
                          style={{ color: "#9CA3AF" }}
                        />
                        <span
                          className="text-base"
                          style={{ color: "#6B7280" }}
                        >
                          {member.phone}
                        </span>
                      </div>
                      {member.recentService && (
                        <p
                          className="text-base mt-1"
                          style={{ color: "#2B9A6F" }}
                        >
                          最近服务: {member.recentService}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link to="/booking" className="grow">
                      <Button
                        variant="outline"
                        className="w-full h-11 text-base font-medium"
                        style={{
                          borderRadius: "12px",
                          borderColor: "#2B9A6F",
                          color: "#2B9A6F",
                        }}
                      >
                        <Calendar className="w-4 h-4 mr-1.5" />
                        代预约
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="grow h-11 text-base font-medium"
                      style={{
                        borderRadius: "12px",
                        borderColor: "#4A90D9",
                        color: "#4A90D9",
                      }}
                    >
                      <CreditCard className="w-4 h-4 mr-1.5" />
                      代缴费
                    </Button>
                    <Button
                      variant="outline"
                      className="grow h-11 text-base font-medium"
                      style={{
                        borderRadius: "12px",
                        borderColor: "#6B7280",
                        color: "#6B7280",
                      }}
                    >
                      <FileText className="w-4 h-4 mr-1.5" />
                      记录
                    </Button>
                  </div>
                </Card>
              </HoverLift>
            </motion.div>
          ))}
        </Stagger>

        {/* Add Family Member */}
        <FadeIn delay={0.2}>
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="w-full p-5 rounded-2xl flex items-center justify-center gap-3 transition-colors"
                style={{
                  border: "2px dashed #E8E5E0",
                  background: "transparent",
                  minHeight: "72px",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "#F3F0EB" }}
                >
                  <Plus className="w-5 h-5" style={{ color: "#6B7280" }} />
                </div>
                <span
                  className="text-base font-medium"
                  style={{ color: "#6B7280" }}
                >
                  绑定新家人
                </span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl">
              <SheetHeader>
                <SheetTitle className="text-xl font-semibold" style={{ color: "#2D2D2D" }}>
                  绑定家人
                </SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-8 space-y-5">
                <div>
                  <label
                    className="block text-base font-medium mb-2"
                    style={{ color: "#2D2D2D" }}
                  >
                    姓名
                  </label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="请输入家人姓名"
                    className="h-12 text-base rounded-xl"
                    style={{ borderColor: "#E8E5E0" }}
                  />
                </div>
                <div>
                  <label
                    className="block text-base font-medium mb-2"
                    style={{ color: "#2D2D2D" }}
                  >
                    手机号码
                  </label>
                  <Input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="请输入手机号码"
                    className="h-12 text-base rounded-xl"
                    style={{ borderColor: "#E8E5E0" }}
                    type="tel"
                  />
                </div>
                <div>
                  <label
                    className="block text-base font-medium mb-2"
                    style={{ color: "#2D2D2D" }}
                  >
                    关系
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {relations.map((rel) => (
                      <button
                        key={rel}
                        onClick={() => setNewRelation(rel)}
                        className="px-5 py-3 rounded-xl text-base font-medium transition-all"
                        style={{
                          background:
                            newRelation === rel ? "#E8F5EE" : "#F3F0EB",
                          color:
                            newRelation === rel ? "#2B9A6F" : "#6B7280",
                          border:
                            newRelation === rel
                              ? "2px solid #2B9A6F"
                              : "2px solid transparent",
                        }}
                      >
                        {rel}
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  className="w-full h-14 text-lg font-semibold rounded-xl text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #2B9A6F, #3DB88A)",
                    boxShadow: "0 4px 12px rgba(43,154,111,0.25)",
                  }}
                >
                  确认绑定
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </FadeIn>

        {/* Activity Feed */}
        <FadeIn delay={0.3}>
          <div className="flex items-center gap-2 mb-3 mt-6">
            <Activity className="w-5 h-5" style={{ color: "#4A90D9" }} />
            <h2
              className="text-lg font-semibold"
              style={{ color: "#2D2D2D" }}
            >
              最近服务动态
            </h2>
          </div>
        </FadeIn>

        <Stagger className="space-y-0">
          {activityFeed.map((item, index) => (
            <motion.div key={item.id} variants={fadeUp}>
              <div className="flex gap-4 pb-5">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `${item.color}15` }}
                  >
                    <item.icon
                      className="w-5 h-5"
                      style={{ color: item.color }}
                    />
                  </div>
                  {index < activityFeed.length - 1 && (
                    <div
                      className="w-0.5 grow mt-2"
                      style={{ background: "#E8E5E0" }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="pt-2">
                  <p className="text-base font-medium" style={{ color: "#2D2D2D" }}>
                    {item.member} - {item.service}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
<span
                    className="text-base"
                    style={{ color: "#6B7280" }}
                  >
                    {item.date}
                    </span>
                    <Badge
                      className="border-0"
                      style={{
                        background: "#E8F5EE",
                        color: "#2B9A6F",
                      }}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      {item.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </Stagger>

        {/* Quick Actions */}
        <FadeIn delay={0.4}>
          <div className="space-y-3 mt-2">
            <Link to="/booking">
              <Button
                className="w-full h-14 text-lg font-semibold rounded-xl text-white"
                style={{
                  background: "linear-gradient(135deg, #2B9A6F, #3DB88A)",
                  boxShadow: "0 4px 12px rgba(43,154,111,0.25)",
                }}
              >
                <Calendar className="w-5 h-5 mr-2" />
                帮妈妈预约
              </Button>
            </Link>
            <Link to="/booking">
              <Button
                className="w-full h-14 text-lg font-semibold rounded-xl text-white mt-3"
                style={{
                  background: "linear-gradient(135deg, #4A90D9, #6BA8E8)",
                  boxShadow: "0 4px 12px rgba(74,144,217,0.25)",
                }}
              >
                <Calendar className="w-5 h-5 mr-2" />
                帮爸爸预约
              </Button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
