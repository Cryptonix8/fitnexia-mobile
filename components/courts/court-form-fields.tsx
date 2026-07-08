import { Switch, StyleSheet, Text, View } from 'react-native';

import { OperatingHoursEditor } from '@/components/courts/operating-hours-editor';
import { FilterSelect } from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
import {
  COURT_LOCATION_OPTIONS,
  COURT_SPORT_OPTIONS,
  COURT_SURFACE_OPTIONS,
} from '@/constants/courts';
import type { Court, CourtSportType } from '@/services/api/courts.api';
import type { OpeningHours } from '@/types/api';

type Props = {
  name: string;
  sportType: CourtSportType;
  surface: string;
  locationType: 'indoor' | 'outdoor';
  hasLighting: boolean;
  operatingHours: OpeningHours;
  onChangeName: (v: string) => void;
  onChangeSportType: (v: CourtSportType) => void;
  onChangeSurface: (v: string) => void;
  onChangeLocationType: (v: 'indoor' | 'outdoor') => void;
  onChangeLighting: (v: boolean) => void;
  onChangeHours: (v: OpeningHours) => void;
};

export function CourtFormFields({
  name,
  sportType,
  surface,
  locationType,
  hasLighting,
  operatingHours,
  onChangeName,
  onChangeSportType,
  onChangeSurface,
  onChangeLocationType,
  onChangeLighting,
  onChangeHours,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.wrap}>
      <Input
        label="Nombre de la cancha"
        value={name}
        onChangeText={onChangeName}
        placeholder="Ej. Cancha 1 — Pádel"
      />

      <FilterSelect
        label="Deporte"
        value={sportType}
        options={[...COURT_SPORT_OPTIONS]}
        onChange={(v) => onChangeSportType((v as CourtSportType) || 'other')}
        placeholder="Tipo de deporte"
      />

      <FilterSelect
        label="Superficie"
        value={surface}
        options={[...COURT_SURFACE_OPTIONS]}
        onChange={(v) => onChangeSurface(v || 'synthetic')}
        placeholder="Superficie"
      />

      <FilterSelect
        label="Ubicación"
        value={locationType}
        options={[...COURT_LOCATION_OPTIONS]}
        onChange={(v) => onChangeLocationType((v as 'indoor' | 'outdoor') || 'outdoor')}
        placeholder="Interior / exterior"
      />

      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.switchLabel, { color: colors.text }]}>Iluminación</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>
            Indicá si la cancha tiene luces para turnos nocturnos.
          </Text>
        </View>
        <Switch value={hasLighting} onValueChange={onChangeLighting} />
      </View>

      <Text style={[styles.section, { color: colors.text }]}>Horario de operación</Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Definí apertura y cierre por día. Solo se ofrecen turnos dentro de estos horarios.
      </Text>
      <OperatingHoursEditor value={operatingHours} onChange={onChangeHours} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  switchLabel: { fontSize: 15, fontWeight: '600' },
  section: { fontSize: 16, fontWeight: '700', marginTop: Spacing.sm },
  hint: { fontSize: 13, lineHeight: 18, marginBottom: Spacing.sm },
});
