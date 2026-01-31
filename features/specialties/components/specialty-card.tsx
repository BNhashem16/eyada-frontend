'use client';

import Link from 'next/link';
import {
  Heart,
  Brain,
  Eye,
  Bone,
  Baby,
  Stethoscope,
  Activity,
  Pill,
  Scissors,
  Ear,
  SmilePlus,
  Syringe,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Specialty } from '@/types';
import { getLocalizedText } from '@/lib/utils/multilingual';

interface SpecialtyCardProps {
  specialty: Specialty;
}

// Map specialty icons to Lucide icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  heart: Heart,
  brain: Brain,
  eye: Eye,
  bone: Bone,
  baby: Baby,
  stethoscope: Stethoscope,
  activity: Activity,
  pill: Pill,
  scissors: Scissors,
  ear: Ear,
  tooth: SmilePlus,
  syringe: Syringe,
  default: Stethoscope,
};

export function SpecialtyCard({ specialty }: SpecialtyCardProps) {
  const Icon = iconMap[specialty.icon || 'default'] || iconMap.default;
  const name = getLocalizedText(specialty.name, 'ar');
  const description = specialty.description
    ? getLocalizedText(specialty.description, 'ar')
    : '';

  return (
    <Link href={`/doctors?specialtyId=${specialty.id}`}>
      <Card className="group h-full hover:shadow-lg hover:border-primary-200 transition-all duration-200 cursor-pointer">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary-100 flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
            <Icon className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{name}</h3>
          {description && (
            <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
