import { useCalculations } from '@/hooks/useCalculations';
import { useRecipeStore } from '@/store/recipeStore';
import { BJCP_STYLES } from '@/data/bjcp2021';
import { srmToHex } from '@/calculators';
import { formatGravity, formatABV, formatIBU, formatSRM } from '@/lib/utils';

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-3 bg-card rounded-lg border min-w-[80px]">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <div className="flex items-center gap-1.5 mt-1">
        {color && (
          <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color }} />
        )}
        <span className="text-lg font-bold tabular-nums">{value}</span>
      </div>
      {sub && <span className="text-xs text-muted-foreground mt-0.5">{sub}</span>}
    </div>
  );
}

function fmt(n: number): string {
  // Strip floating-point noise: round to 1 decimal, then drop trailing .0
  return parseFloat(n.toFixed(1)).toString();
}

function StyleBar({ label, value, min, max }: { label: string; value: number; min: number; max: number }) {
  const range = max - min;
  if (range <= 0) return null;
  const pct = Math.max(0, Math.min(100, ((value - min) / range) * 100));
  const inRange = value >= min && value <= max;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-8 text-muted-foreground text-right">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full relative">
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="h-full bg-amber-200 rounded-full" style={{ width: '100%' }} />
        </div>
        <div
          className="absolute top-0 h-2 w-2 rounded-full border-2 border-white -translate-x-1/2"
          style={{ left: `${pct}%`, backgroundColor: inRange ? '#22c55e' : '#ef4444' }}
        />
      </div>
      <span className="text-muted-foreground">{fmt(min)}–{fmt(max)}</span>
    </div>
  );
}

export function StatsPanel() {
  const stats = useCalculations();
  const styleId = useRecipeStore((s) => s.draft.style_id);
  const style = styleId ? BJCP_STYLES.find((s) => s.id === styleId) : undefined;

  const colorHex = srmToHex(stats.srm);

  return (
    <div className="bg-muted/30 border-b px-4 py-3">
      <div className="flex flex-wrap gap-2 justify-start">
        <StatCard label="OG" value={formatGravity(stats.og)} sub={`Pre-boil ${formatGravity(stats.preboil_og)}`} />
        <StatCard label="FG" value={formatGravity(stats.fg)} sub={`${stats.attenuation.toFixed(0)}% att.`} />
        <StatCard label="ABV" value={formatABV(stats.abv)} />
        <StatCard label="IBU" value={formatIBU(stats.ibu)} sub={`BU:GU ${stats.bu_gu.toFixed(2)}`} />
        <StatCard label="SRM" value={formatSRM(stats.srm)} color={colorHex} sub={`EBC ${(stats.ebc).toFixed(1)}`} />
        <StatCard label="Grain" value={`${stats.total_grain_kg.toFixed(2)} kg`} />
        {stats.mash_water_l > 0 && (
          <StatCard
            label="Water"
            value={`${stats.mash_water_l.toFixed(1)} L`}
            sub={`+ ${stats.sparge_water_l.toFixed(1)} L sparge`}
          />
        )}
        {stats.strike_temp_c > 0 && (
          <StatCard label="Strike" value={`${stats.strike_temp_c.toFixed(1)}°C`} />
        )}
      </div>

      {style && (
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 max-w-xl">
          <StyleBar label="OG" value={Math.round((stats.og - 1) * 1000)} min={Math.round((style.og_min - 1) * 1000)} max={Math.round((style.og_max - 1) * 1000)} />
          <StyleBar label="FG" value={Math.round((stats.fg - 1) * 1000)} min={Math.round((style.fg_min - 1) * 1000)} max={Math.round((style.fg_max - 1) * 1000)} />
          <StyleBar label="ABV" value={stats.abv} min={style.abv_min} max={style.abv_max} />
          <StyleBar label="IBU" value={stats.ibu} min={style.ibu_min} max={style.ibu_max} />
          <StyleBar label="SRM" value={stats.srm} min={style.srm_min} max={style.srm_max} />
        </div>
      )}
    </div>
  );
}
