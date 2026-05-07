// Mock data for the AnZhenDa elderly companion service platform

export interface Companion {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  distance: string;
  distanceKm: number;
  services: string[];
  certifications: string[];
  experience: string;
  completedOrders: number;
  status: "available" | "busy" | "offline";
  lat: number;
  lng: number;
  price: number;
}

export interface ServiceType {
  id: string;
  name: string;
  icon: string;
  description: string;
  price: number;
  duration: string;
  priority: "urgent" | "normal";
  color: string;
}

export interface Order {
  id: string;
  companionId: string;
  companionName: string;
  companionAvatar: string;
  serviceType: string;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  date: string;
  time: string;
  hospital: string;
  baseFee: number;
  extraFee: number;
  totalFee: number;
  rating?: number;
  review?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  avatar: string;
  phone: string;
  recentService?: string;
}

export const companions: Companion[] = [
  {
    id: "1",
    name: "张护士",
    avatar: "",
    rating: 4.9,
    reviewCount: 326,
    distance: "800米",
    distanceKm: 0.8,
    services: ["挂号陪诊", "检查协助", "术后护理"],
    certifications: ["护士执业资格证", "急救培训证书", "老年护理专项证书"],
    experience: "8年三甲医院护理经验",
    completedOrders: 1280,
    status: "available",
    lat: 31.235,
    lng: 121.478,
    price: 198,
  },
  {
    id: "2",
    name: "李阿姨",
    avatar: "",
    rating: 4.8,
    reviewCount: 215,
    distance: "1.2公里",
    distanceKm: 1.2,
    services: ["取药陪同", "慢性病复诊", "挂号陪诊"],
    certifications: ["健康管理师证书", "养老护理员证书"],
    experience: "5年社区医疗服务经验",
    completedOrders: 856,
    status: "available",
    lat: 31.237,
    lng: 121.481,
    price: 168,
  },
  {
    id: "3",
    name: "王医助",
    avatar: "",
    rating: 4.7,
    reviewCount: 189,
    distance: "1.5公里",
    distanceKm: 1.5,
    services: ["检查协助", "住院陪护", "术后护理"],
    certifications: ["医疗助理证书", "急救培训证书"],
    experience: "6年医院助理经验",
    completedOrders: 720,
    status: "busy",
    lat: 31.232,
    lng: 121.475,
    price: 188,
  },
  {
    id: "4",
    name: "陈护工",
    avatar: "",
    rating: 4.9,
    reviewCount: 412,
    distance: "2.0公里",
    distanceKm: 2.0,
    services: ["挂号陪诊", "取药陪同", "慢性病复诊"],
    certifications: ["护理员资格证", "老年护理专项证书", "心理咨询师证书"],
    experience: "10年专业陪诊经验",
    completedOrders: 2100,
    status: "available",
    lat: 31.240,
    lng: 121.485,
    price: 218,
  },
];

export const serviceTypes: ServiceType[] = [
  {
    id: "registration",
    name: "挂号陪诊",
    icon: "ClipboardList",
    description: "全程陪同挂号、候诊、就诊，协助与医生沟通病情",
    price: 198,
    duration: "约2-3小时",
    priority: "normal",
    color: "#2B9A6F",
  },
  {
    id: "medicine",
    name: "取药陪同",
    icon: "Pill",
    description: "陪同前往医院或药房取药，核对药品信息",
    price: 128,
    duration: "约1-2小时",
    priority: "normal",
    color: "#4A90D9",
  },
  {
    id: "examination",
    name: "检查协助",
    icon: "Stethoscope",
    description: "陪同完成各类医疗检查，协助理解检查结果",
    price: 168,
    duration: "约2-4小时",
    priority: "normal",
    color: "#7C6BC4",
  },
  {
    id: "emergency",
    name: "紧急陪诊",
    icon: "Siren",
    description: "30分钟内快速响应，适用于突发身体不适",
    price: 298,
    duration: "约1-4小时",
    priority: "urgent",
    color: "#E85D4A",
  },
];

export const orders: Order[] = [
  {
    id: "ORD-20250415-001",
    companionId: "1",
    companionName: "张护士",
    companionAvatar: "",
    serviceType: "挂号陪诊",
    status: "in_progress",
    date: "2025-04-16",
    time: "09:00",
    hospital: "上海市第一人民医院",
    baseFee: 198,
    extraFee: 0,
    totalFee: 198,
  },
  {
    id: "ORD-20250413-002",
    companionId: "2",
    companionName: "李阿姨",
    companionAvatar: "",
    serviceType: "取药陪同",
    status: "completed",
    date: "2025-04-13",
    time: "14:00",
    hospital: "华山医院",
    baseFee: 128,
    extraFee: 20,
    totalFee: 148,
    rating: 5,
    review: "李阿姨非常耐心，全程细心照顾，非常感谢！",
  },
  {
    id: "ORD-20250410-003",
    companionId: "4",
    companionName: "陈护工",
    companionAvatar: "",
    serviceType: "检查协助",
    status: "completed",
    date: "2025-04-10",
    time: "08:30",
    hospital: "瑞金医院",
    baseFee: 168,
    extraFee: 30,
    totalFee: 198,
    rating: 4,
    review: "服务很专业，帮忙跑了很多科室，辛苦了。",
  },
];

export const familyMembers: FamilyMember[] = [
  {
    id: "1",
    name: "妈妈",
    relation: "母亲",
    avatar: "",
    phone: "138****6789",
    recentService: "4月13日 取药陪同",
  },
  {
    id: "2",
    name: "爸爸",
    relation: "父亲",
    avatar: "",
    phone: "139****1234",
    recentService: "4月10日 检查协助",
  },
];

export const reviews = [
  {
    id: "1",
    userName: "王奶奶",
    rating: 5,
    date: "2025-04-14",
    content: "张护士非常有耐心，一直陪着我排队等候，还帮我记录了医嘱，下次还找她！",
  },
  {
    id: "2",
    userName: "刘爷爷",
    rating: 5,
    date: "2025-04-12",
    content: "很专业，检查前帮我准备好了所有材料，检查过程中一直在旁边鼓励我。",
  },
  {
    id: "3",
    userName: "陈阿姨",
    rating: 4,
    date: "2025-04-10",
    content: "服务很周到，帮我取了药还细心地讲解了用药注意事项。",
  },
];
