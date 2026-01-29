import Link from 'next/link';
import {
  Calendar,
  Search,
  UserCheck,
  Clock,
  Star,
  Shield,
  Stethoscope,
  Heart,
  Brain,
  Eye,
  Bone,
  Baby,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const specialties = [
  { name: 'طب الباطنة', icon: Heart, color: 'text-red-500' },
  { name: 'طب الأطفال', icon: Baby, color: 'text-pink-500' },
  { name: 'طب العيون', icon: Eye, color: 'text-blue-500' },
  { name: 'جراحة العظام', icon: Bone, color: 'text-amber-500' },
  { name: 'المخ والأعصاب', icon: Brain, color: 'text-purple-500' },
  { name: 'طب عام', icon: Stethoscope, color: 'text-teal-500' },
];

const features = [
  {
    icon: Search,
    title: 'ابحث عن طبيبك',
    description: 'ابحث بالتخصص أو الاسم أو الموقع',
  },
  {
    icon: Calendar,
    title: 'احجز موعدك',
    description: 'اختر الوقت المناسب من المواعيد المتاحة',
  },
  {
    icon: UserCheck,
    title: 'تأكيد فوري',
    description: 'احصل على تأكيد موعدك فوراً',
  },
];

const stats = [
  { value: '500+', label: 'طبيب معتمد' },
  { value: '50+', label: 'تخصص طبي' },
  { value: '10,000+', label: 'موعد محجوز' },
  { value: '4.8', label: 'تقييم المستخدمين' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-medical">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-primary-700">عيادة</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/doctors" className="text-gray-600 hover:text-primary-600">
              الأطباء
            </Link>
            <Link href="/clinics" className="text-gray-600 hover:text-primary-600">
              العيادات
            </Link>
            <Link href="/specialties" className="text-gray-600 hover:text-primary-600">
              التخصصات
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">تسجيل الدخول</Button>
            </Link>
            <Link href="/register">
              <Button>إنشاء حساب</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-5xl lg:text-6xl">
              احجز موعدك مع
              <span className="text-primary-600"> أفضل الأطباء</span>
            </h1>
            <p className="mb-8 text-lg text-gray-600 md:text-xl">
              ابحث عن أطبائك المفضلين واحجز مواعيدك بسهولة وسرعة.
              أكثر من 500 طبيب في مختلف التخصصات.
            </p>

            {/* Search Box */}
            <div className="mx-auto max-w-2xl">
              <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-xl md:flex-row">
                <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 px-4 py-3">
                  <Search className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ابحث عن تخصص أو اسم طبيب..."
                    className="w-full border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
                  />
                </div>
                <Button size="lg" className="md:px-8">
                  بحث
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-20 -start-20 h-64 w-64 rounded-full bg-primary-100 opacity-50 blur-3xl" />
        <div className="absolute -top-20 -end-20 h-64 w-64 rounded-full bg-secondary-100 opacity-50 blur-3xl" />
      </section>

      {/* Stats Section */}
      <section className="border-y bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary-600 md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">التخصصات الشائعة</h2>
            <p className="text-gray-600">اختر التخصص المناسب لك</p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {specialties.map((specialty, index) => (
              <Card key={index} hover className="text-center">
                <CardContent className="p-6">
                  <div
                    className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-50 ${specialty.color}`}
                  >
                    <specialty.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-medium text-gray-900">{specialty.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/specialties">
              <Button variant="outline" size="lg">
                عرض جميع التخصصات
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">كيف يعمل</h2>
            <p className="text-gray-600">ثلاث خطوات بسيطة لحجز موعدك</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="relative text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="absolute -top-2 start-1/2 -ms-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-900">
                لماذا تختار عيادة؟
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                    <Star className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">أطباء معتمدون</h3>
                    <p className="text-gray-600">
                      جميع الأطباء مرخصون ومعتمدون من الجهات الرسمية
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                    <Clock className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">حجز فوري</h3>
                    <p className="text-gray-600">
                      احجز موعدك في ثوانٍ واحصل على تأكيد فوري
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                    <Shield className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">خصوصية تامة</h3>
                    <p className="text-gray-600">
                      بياناتك الطبية مشفرة ومحمية بأعلى معايير الأمان
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary-100 to-secondary-100 p-8">
                <div className="flex h-full items-center justify-center">
                  <Stethoscope className="h-32 w-32 text-primary-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-medical py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">هل أنت طبيب؟</h2>
          <p className="mb-8 text-lg text-white/90">
            انضم إلى منصتنا وابدأ في استقبال المرضى عبر الإنترنت
          </p>
          <Link href="/register?role=doctor">
            <Button
              size="lg"
              className="bg-white text-primary-600 hover:bg-gray-100"
            >
              سجل كطبيب
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-medical">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-primary-700">عيادة</span>
              </div>
              <p className="text-gray-600">
                منصة حجز المواعيد الطبية الأولى في مصر
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-gray-900">روابط سريعة</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/doctors" className="hover:text-primary-600">
                    ابحث عن طبيب
                  </Link>
                </li>
                <li>
                  <Link href="/clinics" className="hover:text-primary-600">
                    العيادات
                  </Link>
                </li>
                <li>
                  <Link href="/specialties" className="hover:text-primary-600">
                    التخصصات
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-gray-900">للأطباء</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/register?role=doctor" className="hover:text-primary-600">
                    انضم كطبيب
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-primary-600">
                    تسجيل دخول الأطباء
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold text-gray-900">تواصل معنا</h4>
              <ul className="space-y-2 text-gray-600">
                <li>البريد: support@eyada.com</li>
                <li>الهاتف: 01000000000</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t pt-8 text-center text-gray-500">
            <p>&copy; 2024 عيادة. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
