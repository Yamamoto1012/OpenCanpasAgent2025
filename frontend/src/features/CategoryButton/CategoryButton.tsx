"use client"
import type React from "react"
import { BookOpen, GraduationCap, Building2, Briefcase, Globe, FlaskConical, MapPin, HelpCircle } from "lucide-react"
import { Category, CategoryCard } from "./CategoryCard"


const categories: Category[] = [
  {
    title: "学部ってどんな感じ？",
    description: "各学部の特徴を解説。",
    icon: BookOpen,
    color: "text-emerald-500",
  },
  {
    title: "大学生活を知りたい！",
    description: "キャンパスライフやイベント情報。",
    icon: Building2,
    color: "text-orange-500",
  },
  {
    title: "入試って難しい？",
    description: "入試制度や合格の秘訣を紹介。",
    icon: GraduationCap,
    color: "text-purple-500",
  },
  {
    title: "卒業したらどうなるの？",
    description: "卒業後の進路や就活情報。",
    icon: Briefcase,
    color: "text-blue-500",
  },
  {
    title: "海外に興味がある！",
    description: "留学や海外生活について。",
    icon: Globe,
    color: "text-cyan-500",
  },
  {
    title: "研究って面白い？",
    description: "最新の研究や活動を紹介。",
    icon: FlaskConical,
    color: "text-red-500",
  },
  {
    title: "通いやすさは？",
    description: "交通手段や周辺環境を解説。",
    icon: MapPin,
    color: "text-green-500",
  },
  {
    title: "よくある質問コーナー",
    description: "大学生活の疑問を解消。",
    icon: HelpCircle,
    color: "text-gray-500",
  },
]

export const CategoryButton: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
        {categories.map((category, index) => (
          <CategoryCard key={category.title} category={category} delay={index * 0.05} />
        ))}
      </div>
    </div>
  )
}
