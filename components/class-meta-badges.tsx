import { Badge } from '@/components/ui/badge';
import {
  classLanguageLabel,
  classLevelLabel,
  instructorGenderLabel,
} from '@/constants/labels';
import type { ClassListItem } from '@/types/api';

export function ClassMetaBadges({ item }: { item: ClassListItem }) {
  const level = classLevelLabel(item.level);
  const language = classLanguageLabel(item.language);
  const gender = instructorGenderLabel(item.instructor.gender);

  if (!level && !language && !gender) return null;

  return (
    <>
      {level ? <Badge label={level} /> : null}
      {language ? <Badge label={language} /> : null}
      {gender ? <Badge label={gender} variant="default" /> : null}
    </>
  );
}
