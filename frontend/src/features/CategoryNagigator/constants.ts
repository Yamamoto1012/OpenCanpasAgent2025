import {
	BookOpen,
	GraduationCap,
	Building2,
	Briefcase,
	Globe,
	Users,
	Calendar,
	Book,
	School,
	Lightbulb,
	Rocket,
	Microscope,
	Beaker,
	Cpu,
	Code,
	Database,
	PenToolIcon as Tool,
	Camera,
	Film,
	Music,
	Heart,
	Brain,
	Puzzle,
	Leaf,
	Recycle,
	Zap,
	Building,
	Home,
	Plane,
	Bus,
	Compass,
	// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
	Map,
	Wallet,
	DollarSign,
	BarChart,
	LineChart,
	TrendingUp,
	Target,
	Smartphone,
	Wrench,
	Ruler,
	FileText,
	MessageCircle,
	Gift,
	Clipboard,
	Star,
	ThumbsUp,
	Medal,
	Trophy,
	Shield,
	Clock,
	Utensils,
	Handshake,
} from "lucide-react";
import type { Category } from "./components/CategoryCard";

// メインカテゴリー
export const mainCategories: Category[] = [
	{
		id: "about",
		title: "進化するKITとは？",
		description: "KITの教育方針",
		icon: Lightbulb,
		color: "text-emerald-500",
	},
	{
		id: "new-faculty",
		title: "新学部・学科",
		description: "学部・学科の構成",
		icon: School,
		color: "text-blue-500",
	},
	{
		id: "learning",
		title: "学びの現場",
		description: "実践的な学習",
		icon: BookOpen,
		color: "text-purple-500",
	},
	{
		id: "campus-life",
		title: "キャンパス",
		description: "学生生活の実情",
		icon: Building2,
		color: "text-orange-500",
	},
	{
		id: "admission",
		title: "入試情報",
		description: "受験準備情報",
		icon: GraduationCap,
		color: "text-indigo-500",
	},
	{
		id: "career",
		title: "進路",
		description: "就職・進学",
		icon: Target,
		color: "text-blue-600",
	},
	{
		id: "global",
		title: "グローバル",
		description: "国際交流・留学",
		icon: Globe,
		color: "text-cyan-500",
	},
	{
		id: "research",
		title: "研究活動",
		description: "研究所・プロジェクト",
		icon: Microscope,
		color: "text-red-500",
	},
	{
		id: "tuition",
		title: "学費・奨学金",
		description: "費用と支援",
		icon: Wallet,
		color: "text-green-500",
	},
];

// サブカテゴリーのマッピング
export const subCategories: Record<string, Category[]> = {
	about: [
		{
			id: "bunri",
			title: "文理融合",
			description: "多様な視点の融合",
			icon: Puzzle,
			color: "text-emerald-600",
		},
		{
			id: "shakaijissou",
			title: "社会実装",
			description: "実践で課題解決",
			icon: Rocket,
			color: "text-blue-600",
		},
		{
			id: "kyousou",
			title: "共創学修",
			description: "世代・分野を超えた学び",
			icon: Users,
			color: "text-orange-600",
		},
		{
			id: "sxgx",
			title: "SX・GX・DX",
			description: "持続可能な変革",
			icon: Recycle,
			color: "text-red-600",
		},
	],
	"new-faculty": [
		{
			id: "infoDesign",
			title: "情報デザイン",
			description: "経営・環境デザイン",
			icon: Tool,
			color: "text-blue-600",
		},
		{
			id: "mediaInfo",
			title: "メディア情報",
			description: "映像・心理デザイン",
			icon: Camera,
			color: "text-purple-600",
		},
		{
			id: "infoTech",
			title: "情報理工",
			description: "工学・ロボット分野",
			icon: Cpu,
			color: "text-indigo-600",
		},
		{
			id: "bioChem",
			title: "バイオ・化学",
			description: "環境・生命科学",
			icon: Beaker,
			color: "text-green-600",
		},
		{
			id: "eng",
			title: "工学部",
			description: "機械・電気・土木",
			icon: Wrench,
			color: "text-orange-600",
		},
		{
			id: "arch",
			title: "建築学部",
			description: "建築・デザイン",
			icon: Home,
			color: "text-teal-600",
		},
	],
	learning: [
		{
			id: "projDesign",
			title: "プロジェクト",
			description: "課題解決プログラム",
			icon: Target,
			color: "text-blue-500",
		},
		{
			id: "cdio",
			title: "CDIO実践",
			description: "CDIOプロセス",
			icon: Clipboard,
			color: "text-purple-500",
		},
		{
			id: "collab",
			title: "連携学修",
			description: "早期研究体験",
			icon: Puzzle,
			color: "text-green-600",
		},
		{
			id: "intern",
			title: "インターン",
			description: "企業実務体験",
			icon: Briefcase,
			color: "text-orange-600",
		},
		{
			id: "curriculum",
			title: "カリキュラム",
			description: "全体像の紹介",
			icon: FileText,
			color: "text-emerald-600",
		},
	],
	"campus-life": [
		{
			id: "dining",
			title: "学食・カフェ",
			description: "食堂情報・メニュー",
			icon: Utensils,
			color: "text-yellow-600",
		},
		{
			id: "dorm",
			title: "学生寮",
			description: "住まい支援情報",
			icon: Building,
			color: "text-teal-600",
		},
		{
			id: "extracurricular",
			title: "課外活動",
			description: "サークル・プロジェクト",
			icon: Music,
			color: "text-pink-500",
		},
		{
			id: "support",
			title: "生活支援",
			description: "健康・サポート",
			icon: Heart,
			color: "text-gray-500",
		},
		{
			id: "bus",
			title: "シャトル",
			description: "移動手段",
			icon: Bus,
			color: "text-green-500",
		},
	],
	admission: [
		{
			id: "entrancePoint",
			title: "入試のポイント",
			description: "重視項目",
			icon: Star,
			color: "text-gray-600",
		},
		{
			id: "entranceList",
			title: "入試制度",
			description: "選抜方式比較",
			icon: FileText,
			color: "text-violet-600",
		},
		{
			id: "quota",
			title: "募集人員",
			description: "定員情報",
			icon: Users,
			color: "text-orange-600",
		},
		{
			id: "examSchedule",
			title: "試験日程",
			description: "日程と会場",
			icon: Calendar,
			color: "text-indigo-500",
		},
		{
			id: "application",
			title: "出願手続",
			description: "手順と費用",
			icon: Clipboard,
			color: "text-blue-600",
		},
		{
			id: "pastData",
			title: "過去データ",
			description: "傾向分析",
			icon: BarChart,
			color: "text-blue-500",
		},
		{
			id: "preEducation",
			title: "入学教育",
			description: "入学前準備",
			icon: Book,
			color: "text-green-500",
		},
	],
	career: [
		{
			id: "employment",
			title: "就職実績",
			description: "主要就職先",
			icon: TrendingUp,
			color: "text-blue-600",
		},
		{
			id: "careerCenter",
			title: "進路支援",
			description: "支援内容",
			icon: Compass,
			color: "text-gray-600",
		},
		{
			id: "facultyIndustry",
			title: "企業出身教員",
			description: "企業経験の強み",
			icon: Briefcase,
			color: "text-orange-600",
		},
		{
			id: "gradSchool",
			title: "大学院進学",
			description: "進学支援",
			icon: GraduationCap,
			color: "text-purple-600",
		},
		{
			id: "coopReport",
			title: "コーオプ報告",
			description: "産学連携の成果",
			icon: FileText,
			color: "text-red-600",
		},
	],
	global: [
		{
			id: "cultural",
			title: "共創学修",
			description: "海外連携プログラム",
			icon: Puzzle,
			color: "text-cyan-500",
		},
		{
			id: "studyAbroad",
			title: "留学・インターン",
			description: "国際体験",
			icon: Plane,
			color: "text-blue-500",
		},
		{
			id: "japaneseEdu",
			title: "日本語教育",
			description: "留学生支援",
			icon: MessageCircle,
			color: "text-amber-600",
		},
		{
			id: "abroadReport",
			title: "留学報告",
			description: "成果分析",
			icon: FileText,
			color: "text-green-600",
		},
	],
	research: [
		{
			id: "researchStructure",
			title: "研究所概要",
			description: "施設とテーマ",
			icon: Microscope,
			color: "text-red-500",
		},
		{
			id: "industryCollab",
			title: "産学連携",
			description: "共同研究事例",
			icon: Handshake,
			color: "text-blue-500",
		},
		{
			id: "facultyResearch",
			title: "研究業績",
			description: "代表成果",
			icon: Trophy,
			color: "text-gray-600",
		},
		{
			id: "labGuide",
			title: "研究室ガイド",
			description: "各室の特色",
			icon: Map,
			color: "text-indigo-600",
		},
	],
	tuition: [
		{
			id: "tuitionFee",
			title: "学費",
			description: "入学金・授業料",
			icon: DollarSign,
			color: "text-blue-500",
		},
		{
			id: "scholarship",
			title: "奨学金",
			description: "制度概要",
			icon: Gift,
			color: "text-yellow-600",
		},
		{
			id: "gradScholarship",
			title: "大学院奨学金",
			description: "特待制度",
			icon: Medal,
			color: "text-green-600",
		},
		{
			id: "eduSupport",
			title: "修学支援",
			description: "国の支援",
			icon: Shield,
			color: "text-gray-600",
		},
	],
};

// サブサブカテゴリーのマッピング（文章を短く）
export const subSubCategories: Record<string, Category[]> = {
	// about サブカテゴリー
	bunri: [
		{
			title: "コミュニケーション",
			description: "学生交流で新発見。",
			icon: MessageCircle,
			color: "text-emerald-700",
		},
		{
			title: "新たな価値創造",
			description: "革新的視点の獲得。",
			icon: Lightbulb,
			color: "text-orange-700",
		},
		{
			title: "課題追究",
			description: "社会課題の解決。",
			icon: Target,
			color: "text-blue-700",
		},
		{
			title: "総合大学像",
			description: "文理融合のコンセプト。",
			icon: Puzzle,
			color: "text-emerald-800",
		},
	],
	shakaijissou: [
		{
			title: "課題対応",
			description: "現代の社会課題。",
			icon: Tool,
			color: "text-blue-700",
		},
		{
			title: "産学協同",
			description: "企業連携研究。",
			icon: Handshake,
			color: "text-indigo-700",
		},
		{
			title: "イノベーション",
			description: "新技術の創出。",
			icon: Rocket,
			color: "text-red-700",
		},
		{
			title: "社会貢献",
			description: "全体の発展に寄与。",
			icon: Heart,
			color: "text-cyan-700",
		},
	],
	kyousou: [
		{
			title: "深い学び",
			description: "社会人との交流。",
			icon: Brain,
			color: "text-purple-700",
		},
		{
			title: "コミュニケーション",
			description: "世代間の対話。",
			icon: MessageCircle,
			color: "text-orange-700",
		},
		{
			title: "イノベーション力",
			description: "実践で鍛錬。",
			icon: Lightbulb,
			color: "text-blue-700",
		},
		{
			title: "研究室活用",
			description: "資源の共有。",
			icon: Microscope,
			color: "text-green-700",
		},
		{
			title: "横断授業",
			description: "学科を超えた授業。",
			icon: Puzzle,
			color: "text-indigo-700",
		},
		{
			title: "国際連携",
			description: "海外との協働。",
			icon: Globe,
			color: "text-cyan-700",
		},
		{
			title: "海外インターン",
			description: "国際経験の獲得。",
			icon: Plane,
			color: "text-blue-700",
		},
	],
	sxgx: [
		{
			title: "SX対策",
			description: "環境保全重視。",
			icon: Leaf,
			color: "text-green-700",
		},
		{
			title: "GX対応",
			description: "産業変革促進。",
			icon: Recycle,
			color: "text-teal-700",
		},
		{
			title: "DX推進",
			description: "デジタル変革。",
			icon: Cpu,
			color: "text-purple-700",
		},
	],
	// new-faculty サブカテゴリーのサブサブ
	infoDesign: [
		{
			title: "経営情報",
			description: "戦略とシステム。",
			icon: BarChart,
			color: "text-blue-700",
		},
		{
			title: "環境デザイン",
			description: "環境問題解決。",
			icon: Leaf,
			color: "text-emerald-700",
		},
		{
			title: "新学部像",
			description: "新時代の目標。",
			icon: Target,
			color: "text-red-700",
		},
	],
	mediaInfo: [
		{
			title: "映像創造",
			description: "デジタル映像技術。",
			icon: Film,
			color: "text-purple-700",
		},
		{
			title: "心理デザイン",
			description: "心理とデザイン融合。",
			icon: Brain,
			color: "text-amber-700",
		},
		{
			title: "新学部像",
			description: "革新の方向性。",
			icon: Compass,
			color: "text-red-700",
		},
	],
	infoTech: [
		{
			title: "情報工学",
			description: "基礎技術。",
			icon: Code,
			color: "text-indigo-700",
		},
		{
			title: "知能システム",
			description: "AIとデータ。",
			icon: Database,
			color: "text-blue-700",
		},
		{
			title: "ロボティクス",
			description: "自動化技術。",
			icon: Cpu,
			color: "text-green-700",
		},
		{
			title: "新学部像",
			description: "先端技術。",
			icon: Rocket,
			color: "text-red-700",
		},
	],
	bioChem: [
		{
			title: "応用化学",
			description: "環境対応化学。",
			icon: Beaker,
			color: "text-green-700",
		},
		{
			title: "生命バイオ",
			description: "生命科学融合。",
			icon: Microscope,
			color: "text-emerald-700",
		},
	],
	eng: [
		{
			title: "機械設計",
			description: "設計と製造。",
			icon: Tool,
			color: "text-orange-700",
		},
		{
			title: "先進システム",
			description: "最新技術設計。",
			icon: Cpu,
			color: "text-red-700",
		},
		{
			title: "航空宇宙",
			description: "航空技術。",
			icon: Plane,
			color: "text-indigo-700",
		},
		{
			title: "電気システム",
			description: "電気工学。",
			icon: Zap,
			color: "text-blue-700",
		},
		{
			title: "電子情報",
			description: "電子と情報。",
			icon: Smartphone,
			color: "text-green-700",
		},
		{
			title: "環境土木",
			description: "土木技術。",
			icon: Building,
			color: "text-teal-700",
		},
	],
	arch: [
		{
			title: "建築設計",
			description: "構造と理論。",
			icon: Ruler,
			color: "text-teal-700",
		},
		{
			title: "建築デザイン",
			description: "デザイン重視。",
			icon: Tool,
			color: "text-blue-700",
		},
	],
	// learning サブカテゴリーのサブサブ
	projDesign: [
		{
			title: "概要",
			description: "プロジェクトの基本。",
			icon: FileText,
			color: "text-blue-700",
		},
		{
			title: "事例",
			description: "実例の紹介。",
			icon: Clipboard,
			color: "text-purple-700",
		},
	],
	cdio: [
		{
			title: "概要",
			description: "CDIOの基本。",
			icon: FileText,
			color: "text-purple-700",
		},
		{
			title: "実例",
			description: "実践例。",
			icon: Clipboard,
			color: "text-green-700",
		},
	],
	collab: [
		{
			title: "配属メリット",
			description: "早期研究体験。",
			icon: Star,
			color: "text-green-700",
		},
		{
			title: "大学院連携",
			description: "連携研究。",
			icon: Puzzle,
			color: "text-blue-700",
		},
	],
	intern: [
		{
			title: "概要",
			description: "企業体験。",
			icon: Briefcase,
			color: "text-orange-700",
		},
		{
			title: "事例",
			description: "成功事例。",
			icon: ThumbsUp,
			color: "text-red-700",
		},
	],
	curriculum: [
		{
			title: "構成",
			description: "全体像。",
			icon: FileText,
			color: "text-emerald-700",
		},
		{
			title: "シラバス",
			description: "詳細内容。",
			icon: Book,
			color: "text-blue-700",
		},
		{
			title: "支援計画",
			description: "サポート概要。",
			icon: Shield,
			color: "text-gray-700",
		},
	],
	// campus-life サブカテゴリーのサブサブ
	dining: [
		{
			title: "メニュー",
			description: "食堂メニュー。",
			icon: Utensils,
			color: "text-yellow-700",
		},
	],
	dorm: [
		{
			title: "特徴",
			description: "寮の設備。",
			icon: Home,
			color: "text-teal-700",
		},
	],
	extracurricular: [
		{
			title: "サークル",
			description: "主要サークル。",
			icon: Users,
			color: "text-pink-700",
		},
		{
			title: "プロジェクト",
			description: "学生実践。",
			icon: Rocket,
			color: "text-blue-700",
		},
	],
	support: [
		{
			title: "健康",
			description: "健康管理。",
			icon: Heart,
			color: "text-gray-700",
		},
	],
	bus: [
		{
			title: "時刻表",
			description: "運行スケジュール。",
			icon: Clock,
			color: "text-green-700",
		},
	],
	// admission サブカテゴリーのサブサブ
	entrancePoint: [
		{
			title: "ポリシー",
			description: "理念概要。",
			icon: FileText,
			color: "text-gray-700",
		},
		{
			title: "ポイント",
			description: "重視項目。",
			icon: Star,
			color: "text-blue-700",
		},
	],
	entranceList: [
		{
			title: "比較",
			description: "選抜方式比較。",
			icon: BarChart,
			color: "text-violet-700",
		},
	],
	quota: [
		{
			title: "定員",
			description: "募集人数。",
			icon: Users,
			color: "text-orange-700",
		},
	],
	examSchedule: [
		{
			title: "日程",
			description: "試験日時。",
			icon: Calendar,
			color: "text-indigo-700",
		},
	],
	application: [
		{
			title: "手続き",
			description: "出願方法。",
			icon: Clipboard,
			color: "text-blue-700",
		},
	],
	pastData: [
		{
			title: "分析",
			description: "過去データ。",
			icon: LineChart,
			color: "text-blue-700",
		},
	],
	preEducation: [
		{
			title: "準備",
			description: "入学前情報。",
			icon: Book,
			color: "text-green-700",
		},
	],
	// career サブカテゴリーのサブサブ
	employment: [
		{
			title: "就職先",
			description: "主要就職先。",
			icon: Building,
			color: "text-blue-700",
		},
	],
	careerCenter: [
		{
			title: "支援",
			description: "支援内容。",
			icon: Shield,
			color: "text-gray-700",
		},
	],
	facultyIndustry: [
		{
			title: "企業出身",
			description: "実務教員。",
			icon: Briefcase,
			color: "text-orange-700",
		},
	],
	gradSchool: [
		{
			title: "専攻紹介",
			description: "各専攻の特徴。",
			icon: GraduationCap,
			color: "text-purple-700",
		},
	],
	coopReport: [
		{
			title: "報告",
			description: "産学連携成果。",
			icon: FileText,
			color: "text-red-700",
		},
	],
	// global サブカテゴリーのサブサブ
	cultural: [
		{
			title: "共創",
			description: "国際共同。",
			icon: Puzzle,
			color: "text-cyan-700",
		},
	],
	studyAbroad: [
		{
			title: "留学詳細",
			description: "留学制度。",
			icon: Plane,
			color: "text-blue-700",
		},
		{
			title: "Externship",
			description: "特定プログラム。",
			icon: Briefcase,
			color: "text-indigo-700",
		},
	],
	japaneseEdu: [
		{
			title: "講座",
			description: "日本語講座。",
			icon: MessageCircle,
			color: "text-amber-700",
		},
	],
	abroadReport: [
		{
			title: "報告書",
			description: "留学成果。",
			icon: FileText,
			color: "text-green-700",
		},
	],
	// research サブカテゴリーのサブサブ
	researchStructure: [
		{
			title: "施設",
			description: "研究所一覧。",
			icon: Building,
			color: "text-red-700",
		},
		{
			title: "テーマ",
			description: "研究テーマ。",
			icon: Lightbulb,
			color: "text-indigo-700",
		},
	],
	industryCollab: [
		{
			title: "事例",
			description: "共同研究。",
			icon: Handshake,
			color: "text-blue-700",
		},
	],
	facultyResearch: [
		{
			title: "成果",
			description: "研究成果。",
			icon: Trophy,
			color: "text-gray-700",
		},
	],
	labGuide: [
		{
			title: "特色",
			description: "各室の特徴。",
			icon: Map,
			color: "text-indigo-700",
		},
	],
	// tuition サブカテゴリーのサブサブ
	tuitionFee: [
		{
			title: "入学金",
			description: "入学金詳細。",
			icon: DollarSign,
			color: "text-blue-700",
		},
	],
	scholarship: [
		{
			title: "奨学金",
			description: "奨学金詳細。",
			icon: Gift,
			color: "text-yellow-700",
		},
	],
	gradScholarship: [
		{
			title: "特待生",
			description: "大学院特待生。",
			icon: Medal,
			color: "text-green-700",
		},
	],
	eduSupport: [
		{
			title: "修学支援",
			description: "国の支援制度。",
			icon: Shield,
			color: "text-gray-700",
		},
	],
};
