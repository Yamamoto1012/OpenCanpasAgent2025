import {
  BookOpen,
  GraduationCap,
  Building2,
  Briefcase,
  Globe,
  FlaskConical,
  MapPin,
  HelpCircle,
  Users,
  Calendar,
  Coffee,
  Book,
  Award,
  School,
  Landmark,
  Backpack,
} from "lucide-react";
import type { Category } from "./CategoryCard";

// メインカテゴリー
export const mainCategories: Category[] = [
  {
    id: "about",
    title: "進化する金沢工業大学とは？",
    description: "KITの特徴的な教育方針や取り組みについて",
    icon: BookOpen,
    color: "text-emerald-500",
  },
  {
    id: "new-faculty",
    title: "新しい学部・学科を知りたい",
    description: "学部・学科構成と特徴",
    icon: School,
    color: "text-blue-500",
  },
  {
    id: "learning",
    title: "金沢工業大学での学び",
    description: "実践的な学びの仕組み",
    icon: Book,
    color: "text-purple-500",
  },
  {
    id: "campus-life",
    title: "キャンパスライフ",
    description: "学生生活のリアル",
    icon: Building2,
    color: "text-orange-500",
  },
  {
    id: "admission",
    title: "入試情報",
    description: "入試制度や受験準備情報",
    icon: GraduationCap,
    color: "text-indigo-500",
  },
  {
    id: "career",
    title: "卒業後の進路",
    description: "就職・進学など卒業後の進路",
    icon: Briefcase,
    color: "text-blue-600",
  },
  {
    id: "global",
    title: "グローバルな学び",
    description: "国際交流・留学制度を紹介",
    icon: Globe,
    color: "text-cyan-500",
  },
  {
    id: "research",
    title: "研究活動",
    description: "研究所やプロジェクトを紹介",
    icon: FlaskConical,
    color: "text-red-500",
  },
  {
    id: "tuition",
    title: "学費と奨学金",
    description: "学費・奨学金制度の概要",
    icon: Award,
    color: "text-green-500",
  },
];

// サブカテゴリーのマッピング
export const subCategories: Record<string, Category[]> = {
  about: [
    {
      id: "bunri",
      title: "文理融合の教育",
      description:
        "文系と理系の学生が集い、多様な視点から社会課題解決を目指す教育について。",
      icon: BookOpen,
      color: "text-emerald-600",
    },
    {
      id: "shakaijissou",
      title: "社会実装型教育",
      description:
        "真の課題を探求し、解決できる人材育成のための実践的な学びについて。",
      icon: Briefcase,
      color: "text-blue-600",
    },
    {
      id: "kyousou",
      title: "共創学修",
      description:
        "世代・分野・文化を超えた多様な人々との学び合いについて。",
      icon: Users,
      color: "text-orange-600",
    },
    {
      id: "sxgx",
      title: "SX・GX・DXへの対応",
      description:
        "持続可能な社会実現に向けた変革をリードする人材育成について。",
      icon: FlaskConical,
      color: "text-red-600",
    },
  ],
  "new-faculty": [
    {
      id: "infoDesign",
      title: "情報デザイン学部",
      description: "経営情報学科、環境デザイン創成学科の特徴。",
      icon: School,
      color: "text-blue-600",
    },
    {
      id: "mediaInfo",
      title: "メディア情報学部",
      description: "メディア情報学科、心理情報デザイン学科の特徴。",
      icon: School,
      color: "text-purple-600",
    },
    {
      id: "infoTech",
      title: "情報理工学部",
      description:
        "情報工学科、知能情報システム学科、ロボティクス学科の特徴。",
      icon: School,
      color: "text-indigo-600",
    },
    {
      id: "bioChem",
      title: "バイオ・化学部",
      description: "環境･応用化学科、生命･応用バイオ学科の特徴。",
      icon: FlaskConical,
      color: "text-green-600",
    },
    {
      id: "eng",
      title: "工学部",
      description:
        "機械工学科、先進機械システム工学科、航空宇宙工学科、電気エネルギーシステム工学科、電子情報システム工学科、環境土木工学科の特徴。",
      icon: School,
      color: "text-orange-600",
    },
    {
      id: "arch",
      title: "建築学部",
      description: "建築学科、建築デザイン学科の特徴。",
      icon: Landmark,
      color: "text-teal-600",
    },
  ],
  learning: [
    {
      id: "projDesign",
      title: "プロジェクトデザイン教育",
      description:
        "実践的な課題解決能力を養う教育プログラムについて。",
      icon: Briefcase,
      color: "text-blue-500",
    },
    {
      id: "cdio",
      title: "CDIOの実践",
      description:
        "conception、design、implementation、operation のプロセスを通じた学びについて。",
      icon: Book,
      color: "text-purple-500",
    },
    {
      id: "collab",
      title: "学部・大学院の連携",
      description:
        "学部4年次から研究室での学びを始める仕組みについて。",
      icon: GraduationCap,
      color: "text-green-600",
    },
    {
      id: "intern",
      title: "インターンシップ・コーオプ教育",
      description:
        "企業との連携による実務体験プログラムについて。",
      icon: Building2,
      color: "text-orange-600",
    },
    {
      id: "curriculum",
      title: "カリキュラムガイド",
      description: "各学部・学科の学習内容の全体像。",
      icon: BookOpen,
      color: "text-emerald-600",
    },
  ],
  "campus-life": [
    {
      id: "dining",
      title: "学食・カフェ",
      description:
        "ラテラ、イルソーレ、エナジー、アクアなどの食堂情報やメニュー。",
      icon: Coffee,
      color: "text-yellow-600",
    },
    {
      id: "dorm",
      title: "学生寮・住まい",
      description: "KIT指定学生アパートや住まい支援情報。",
      icon: Landmark,
      color: "text-teal-600",
    },
    {
      id: "extracurricular",
      title: "課外活動",
      description: "サークルや学生プロジェクトの活動情報。",
      icon: Users,
      color: "text-pink-500",
    },
    {
      id: "support",
      title: "学生生活支援",
      description: "学生サポート体制や健康、体育施設の情報。",
      icon: HelpCircle,
      color: "text-gray-500",
    },
    {
      id: "bus",
      title: "シャトルバス",
      description: "キャンパス間の移動手段。",
      icon: MapPin,
      color: "text-green-500",
    },
  ],
  admission: [
    {
      id: "entrancePoint",
      title: "入試のポイント",
      description:
        "KITの入試で重視される点、アドミッションポリシーなど。",
      icon: HelpCircle,
      color: "text-gray-600",
    },
    {
      id: "entranceList",
      title: "入試制度一覧",
      description: "一般選抜、学校推薦型選抜、総合型選抜などの比較。",
      icon: Book,
      color: "text-violet-600",
    },
    {
      id: "quota",
      title: "学部・学科募集人員",
      description: "各学部・学科の募集定員に関する情報。",
      icon: Users,
      color: "text-orange-600",
    },
    {
      id: "examSchedule",
      title: "入学試験日程・会場",
      description: "試験日程と実施会場について。",
      icon: Calendar,
      color: "text-indigo-500",
    },
    {
      id: "application",
      title: "検定料・出願手続",
      description: "出願手順と費用、受験票などの情報。",
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      id: "pastData",
      title: "過去の入試データ",
      description: "入試結果と傾向分析。",
      icon: Backpack,
      color: "text-blue-500",
    },
    {
      id: "preEducation",
      title: "KIT入学教育",
      description: "入学前準備プログラムについて。",
      icon: GraduationCap,
      color: "text-green-500",
    },
  ],
  career: [
    {
      id: "employment",
      title: "学部卒業生 就職実績",
      description: "主な就職先や業界動向。",
      icon: Briefcase,
      color: "text-blue-600",
    },
    {
      id: "careerCenter",
      title: "進路開発センター",
      description: "キャリア支援センターの紹介。",
      icon: HelpCircle,
      color: "text-gray-600",
    },
    {
      id: "facultyIndustry",
      title: "教員の5割が企業出身者",
      description: "企業出身教員によるキャリア支援。",
      icon: Users,
      color: "text-orange-600",
    },
    {
      id: "gradSchool",
      title: "大学院進学",
      description: "大学院の専攻や進学支援。",
      icon: GraduationCap,
      color: "text-purple-600",
    },
    {
      id: "coopReport",
      title: "KITコーオプ教育プログラム報告会",
      description: "産学連携の成果報告。",
      icon: Award,
      color: "text-red-600",
    },
  ],
  global: [
    {
      id: "cultural",
      title: "文化を超えた共創学修",
      description: "海外大学との連携による共創プログラム。",
      icon: Globe,
      color: "text-cyan-500",
    },
    {
      id: "studyAbroad",
      title: "海外留学・インターンシップ",
      description: "国際体験プログラムと就業体験。",
      icon: School,
      color: "text-blue-500",
    },
    {
      id: "japaneseEdu",
      title: "日本語教育プログラム",
      description: "留学生向け日本語学習支援。",
      icon: Book,
      color: "text-amber-600",
    },
    {
      id: "abroadReport",
      title: "留学実績・報告書",
      description: "過去の留学成果と報告書。",
      icon: Award,
      color: "text-green-600",
    },
  ],
  research: [
    {
      id: "researchStructure",
      title: "研究所の構成と概要",
      description: "各研究所の概要と研究テーマ。",
      icon: FlaskConical,
      color: "text-red-600",
    },
    {
      id: "industryCollab",
      title: "産学連携",
      description: "企業との共同研究や技術開発。",
      icon: Briefcase,
      color: "text-blue-500",
    },
    {
      id: "facultyResearch",
      title: "教員紹介/教育・研究業績情報",
      description: "教員の研究分野と業績。",
      icon: Users,
      color: "text-gray-600",
    },
    {
      id: "labGuide",
      title: "研究室ガイド",
      description: "各研究室の特色と実績。",
      icon: BookOpen,
      color: "text-indigo-600",
    },
  ],
  tuition: [
    {
      id: "tuitionFee",
      title: "学費",
      description: "入学金や授業料の詳細。",
      icon: Book,
      color: "text-blue-500",
    },
    {
      id: "scholarship",
      title: "KITの奨学金制度",
      description: "大学独自の奨学金制度の概要。",
      icon: Award,
      color: "text-yellow-600",
    },
    {
      id: "gradScholarship",
      title: "大学院特待生・修学奨励金",
      description: "大学院向け支援制度の詳細。",
      icon: GraduationCap,
      color: "text-green-600",
    },
    {
      id: "eduSupport",
      title: "高等教育の修学支援新制度",
      description: "国の修学支援制度の概要。",
      icon: HelpCircle,
      color: "text-gray-600",
    },
  ],
};

// サブサブカテゴリーのマッピング
export const subSubCategories: Record<string, Category[]> = {
  // about サブカテゴリー
  bunri: [
    { title: "多様な学生によるコミュニケーションの重要性", description: "多様なバックグラウンドの学生が交流することで新たな発見やアイデアが生まれる。", icon: BookOpen, color: "text-emerald-700" },
    { title: "新たな価値やビジョンの創造", description: "異なる視点から革新的な価値やビジョンを生み出す。", icon: Users, color: "text-orange-700" },
    { title: "真の課題追究と解決", description: "現実の社会課題に真摯に向き合い、解決策を模索する。", icon: Briefcase, color: "text-blue-700" },
    { title: "文理の枠を超えた総合大学コンセプト", description: "文理融合を推進する総合大学としての特色を詳述。", icon: BookOpen, color: "text-emerald-800" },
  ],
  shakaijissou: [
    { title: "社会課題への対応", description: "現代社会の課題に取り組むための教育。", icon: HelpCircle, color: "text-blue-700" },
    { title: "産学協同による教育研究", description: "企業と連携し実践的な研究活動を展開。", icon: Briefcase, color: "text-indigo-700" },
    { title: "イノベーション創出", description: "新たな技術・ビジネスモデルを生み出す。", icon: Award, color: "text-red-700" },
    { title: "社会貢献を目指す教育", description: "社会全体の発展に寄与する人材育成。", icon: Globe, color: "text-cyan-700" },
  ],
  kyousou: [
    // 世代を超えた共創学修
    { title: "深い学びの獲得", description: "社会人との交流により深い学びを実現。", icon: BookOpen, color: "text-purple-700" },
    { title: "卓越したコミュニケーション能力の獲得", description: "異なる世代間での対話を通して能力向上。", icon: Users, color: "text-orange-700" },
    { title: "イノベーション創出能力の獲得", description: "実践的なプロジェクトで革新的な発想を養う。", icon: Briefcase, color: "text-blue-700" },
    // 分野を超えた共創学修
    { title: "クラスター研究室の活用", description: "学部横断で研究室の資源を有効活用する。", icon: Book, color: "text-green-700" },
    { title: "学部学科横断クラスの実施", description: "学科間の垣根を超えた共同授業。", icon: School, color: "text-indigo-700" },
    // 文化を超えた共創学修
    { title: "海外大学とのソーシャル・イノベーション", description: "国際連携プログラムでグローバルな視点を獲得。", icon: Globe, color: "text-cyan-700" },
    { title: "海外インターンシップ", description: "海外での実務経験を通して国際感覚を磨く。", icon: Briefcase, color: "text-blue-700" },
  ],
  sxgx: [
    { title: "SX（持続可能な社会）の取り組み", description: "環境保全や社会的責任を重視する教育。", icon: HelpCircle, color: "text-green-700" },
    { title: "GX（グリーントランスフォーメーション）への対応", description: "産業構造の変革を目指す取り組み。", icon: Building2, color: "text-teal-700" },
    { title: "DX（デジタルトランスフォーメーション）の推進", description: "先進技術を活用しデジタル変革をリード。", icon: Globe, color: "text-purple-700" },
  ],
  // new-faculty サブカテゴリーのサブサブ
  infoDesign: [
    { title: "経営情報学科の特色", description: "経営戦略と情報システムの融合。", icon: School, color: "text-blue-700" },
    { title: "環境デザイン創成学科の特色", description: "環境問題に取り組むデザイン。", icon: BookOpen, color: "text-emerald-700" },
    { title: "新設学部の目的と特色", description: "新たな時代の教育目標とビジョン。", icon: Award, color: "text-red-700" },
  ],
  mediaInfo: [
    { title: "メディア情報学科の特色", description: "映像やデジタルコンテンツの創造。", icon: School, color: "text-purple-700" },
    { title: "心理情報デザイン学科の特色", description: "心理学とデザインの融合。", icon: Book, color: "text-amber-700" },
    { title: "新設学部の目的と特色", description: "革新的なメディア教育の方向性。", icon: Award, color: "text-red-700" },
  ],
  infoTech: [
    { title: "情報工学科の特色", description: "プログラミングとシステム設計の基礎。", icon: School, color: "text-indigo-700" },
    { title: "知能情報システム学科の特色", description: "AIとデータサイエンスの実践。", icon: Book, color: "text-blue-700" },
    { title: "ロボティクス学科の特色", description: "ロボット工学と自動化技術。", icon: Briefcase, color: "text-green-700" },
    { title: "新設学部の目的と特色", description: "先端技術を用いた教育の方向性。", icon: Award, color: "text-red-700" },
  ],
  bioChem: [
    { title: "環境･応用化学科の特色", description: "環境問題に応じた化学の応用。", icon: FlaskConical, color: "text-green-700" },
    { title: "生命･応用バイオ学科の特色", description: "生命科学と技術の融合。", icon: BookOpen, color: "text-emerald-700" },
  ],
  eng: [
    { title: "機械工学科の特色", description: "機械設計と製造技術。", icon: School, color: "text-orange-700" },
    { title: "先進機械システム工学科の特色", description: "最新技術を駆使したシステム設計。", icon: Building2, color: "text-red-700" },
    { title: "航空宇宙工学科の特色", description: "航空宇宙分野の専門知識。", icon: GraduationCap, color: "text-indigo-700" },
    { title: "電気エネルギーシステム工学科の特色", description: "エネルギー効率と電気工学。", icon: Book, color: "text-blue-700" },
    { title: "電子情報システム工学科の特色", description: "電子技術と情報処理。", icon: Briefcase, color: "text-green-700" },
    { title: "環境土木工学科の特色", description: "環境配慮型土木技術。", icon: Landmark, color: "text-teal-700" },
  ],
  arch: [
    { title: "建築学科の特色", description: "構造設計と建築理論。", icon: Landmark, color: "text-teal-700" },
    { title: "建築デザイン学科の特色", description: "デザインと機能性の両立。", icon: BookOpen, color: "text-blue-700" },
  ],
  // learning サブカテゴリーのサブサブ
  projDesign: [
    { title: "プロジェクト概要", description: "実践的な課題解決の概要。", icon: Briefcase, color: "text-blue-700" },
    { title: "取り組み事例", description: "具体的なプロジェクト事例の紹介。", icon: BookOpen, color: "text-purple-700" },
  ],
  cdio: [
    { title: "CDIOの概要", description: "CDIOプロセスの基本概念。", icon: Book, color: "text-purple-700" },
    { title: "実践事例", description: "金沢工業大学での実践例。", icon: GraduationCap, color: "text-green-700" },
  ],
  collab: [
    { title: "研究室配属のメリット", description: "早期からの研究体験。", icon: GraduationCap, color: "text-green-700" },
    { title: "大学院連携", description: "大学院での研究展開。", icon: BookOpen, color: "text-blue-700" },
  ],
  intern: [
    { title: "インターンシップ概要", description: "企業連携による実務体験。", icon: Building2, color: "text-orange-700" },
    { title: "コーオプ教育事例", description: "実際の事例と成果。", icon: Briefcase, color: "text-red-700" },
  ],
  curriculum: [
    { title: "カリキュラム構成", description: "各学部の学習内容の全体像。", icon: BookOpen, color: "text-emerald-700" },
    { title: "シラバスの確認", description: "詳細な科目内容の紹介。", icon: Book, color: "text-blue-700" },
    { title: "学習支援計画", description: "学習サポート体制の概要。", icon: HelpCircle, color: "text-gray-700" },
  ],
  // campus-life サブカテゴリーのサブサブ
  dining: [
    { title: "メニュー詳細", description: "各食堂のメニューと利用方法。", icon: Coffee, color: "text-yellow-700" },
  ],
  dorm: [
    { title: "学生寮の特徴", description: "寮の設備やサポート内容。", icon: Landmark, color: "text-teal-700" },
  ],
  extracurricular: [
    { title: "サークル活動", description: "主要なサークルの活動内容。", icon: Users, color: "text-pink-700" },
    { title: "学生プロジェクト", description: "実践的なプロジェクトの事例。", icon: Briefcase, color: "text-blue-700" },
  ],
  support: [
    { title: "健康サポート", description: "健康管理やカウンセリング情報。", icon: HelpCircle, color: "text-gray-700" },
  ],
  bus: [
    { title: "時刻表", description: "シャトルバスの運行スケジュール。", icon: Calendar, color: "text-green-700" },
  ],
  // admission サブカテゴリーのサブサブ
  entrancePoint: [
    { title: "アドミッションポリシー", description: "大学の教育理念。", icon: HelpCircle, color: "text-gray-700" },
    { title: "入試のPOINT", description: "重視される試験項目。", icon: Book, color: "text-blue-700" },
  ],
  entranceList: [
    { title: "各選抜方式の比較", description: "メリット・デメリットの分析。", icon: Book, color: "text-violet-700" },
  ],
  quota: [
    { title: "募集定員詳細", description: "各学科の募集人数の内訳。", icon: Users, color: "text-orange-700" },
  ],
  examSchedule: [
    { title: "詳細日程", description: "各試験の実施日と会場。", icon: Calendar, color: "text-indigo-700" },
  ],
  application: [
    { title: "出願手続き", description: "出願に必要な手続きと費用。", icon: BookOpen, color: "text-blue-700" },
  ],
  pastData: [
    { title: "入試結果分析", description: "過去の入試データの傾向。", icon: Backpack, color: "text-blue-700" },
  ],
  preEducation: [
    { title: "入学前プログラム", description: "入学準備に関する情報。", icon: GraduationCap, color: "text-green-700" },
  ],
  // career サブカテゴリーのサブサブ
  employment: [
    { title: "就職先リスト", description: "卒業生の主要な就職先。", icon: Briefcase, color: "text-blue-700" },
  ],
  careerCenter: [
    { title: "支援内容", description: "進路支援の具体的取り組み。", icon: HelpCircle, color: "text-gray-700" },
  ],
  facultyIndustry: [
    { title: "企業出身教員の強み", description: "実務経験を持つ教員による指導。", icon: Users, color: "text-orange-700" },
  ],
  gradSchool: [
    { title: "大学院の専攻紹介", description: "各専攻の特徴と研究内容。", icon: GraduationCap, color: "text-purple-700" },
  ],
  coopReport: [
    { title: "産学連携報告", description: "コーオプ教育の成果と報告会内容。", icon: Award, color: "text-red-700" },
  ],
  // global サブカテゴリーのサブサブ
  cultural: [
    { title: "ソーシャル・イノベーション", description: "海外大学との共同プロジェクト。", icon: Globe, color: "text-cyan-700" },
  ],
  studyAbroad: [
    { title: "留学プログラム詳細", description: "各留学制度の内容。", icon: School, color: "text-blue-700" },
    { title: "Boeing Externship", description: "特定プログラムの詳細。", icon: Briefcase, color: "text-indigo-700" },
  ],
  japaneseEdu: [
    { title: "日本語講座詳細", description: "留学生向け日本語教育の具体例。", icon: Book, color: "text-amber-700" },
  ],
  abroadReport: [
    { title: "留学成果報告", description: "過去の留学事例の分析。", icon: Award, color: "text-green-700" },
  ],
  // research サブカテゴリーのサブサブ
  researchStructure: [
    { title: "研究所一覧", description: "各研究所の施設と概要。", icon: FlaskConical, color: "text-red-700" },
    { title: "研究テーマ", description: "各研究所で取り組む研究テーマ。", icon: BookOpen, color: "text-indigo-700" },
  ],
  industryCollab: [
    { title: "共同研究事例", description: "企業との連携プロジェクト。", icon: Briefcase, color: "text-blue-700" },
  ],
  facultyResearch: [
    { title: "研究成果", description: "教員の代表的な研究業績。", icon: Users, color: "text-gray-700" },
  ],
  labGuide: [
    { title: "各研究室の特色", description: "研究室ごとの取り組みと実績。", icon: BookOpen, color: "text-indigo-700" },
  ],
  // tuition サブカテゴリーのサブサブ
  tuitionFee: [
    { title: "入学金詳細", description: "入学金の内訳と支払い方法。", icon: Book, color: "text-blue-700" },
  ],
  scholarship: [
    { title: "奨学金詳細", description: "奨学金制度の申請方法と条件。", icon: Award, color: "text-yellow-700" },
  ],
  gradScholarship: [
    { title: "大学院特待生制度", description: "大学院生向け特待制度の詳細。", icon: GraduationCap, color: "text-green-700" },
  ],
  eduSupport: [
    { title: "修学支援制度", description: "国の支援制度の概要。", icon: HelpCircle, color: "text-gray-700" },
  ],
};
