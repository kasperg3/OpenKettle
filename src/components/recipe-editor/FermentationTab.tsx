import { Plus, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useRecipeStore } from '@/store/recipeStore';
import { produce } from 'immer';
import type { FermentationStage, FermentationProfileSnapshot } from '@/types';

function buildChartData(stages: FermentationStage[]) {
  const data: { day: number; temp: number }[] = [];
  let day = 0;
  let prevTemp: number | null = null;

  for (const stage of stages) {
    if (prevTemp !== null && stage.ramp_days && stage.ramp_days > 0) {
      data.push({ day, temp: prevTemp });
      day += stage.ramp_days;
      data.push({ day, temp: stage.temp_c });
    } else {
      data.push({ day, temp: stage.temp_c });
    }
    day += stage.days;
    data.push({ day, temp: stage.temp_c });
    prevTemp = stage.temp_c;
  }
  return data;
}

export function FermentationTab() {
  const { draft, setFermentationProfile } = useRecipeStore();
  const profile = draft.fermentation_profile ?? {
    name: 'Standard', stages: [], is_default: false,
  };

  function update(fn: (p: FermentationProfileSnapshot) => void) {
    setFermentationProfile(produce(profile, fn));
  }

  function addStage() {
    update(p => {
      p.stages.push({ name: 'Primary', temp_c: 20, days: 7 });
    });
  }

  function removeStage(i: number) { update(p => { p.stages.splice(i, 1); }); }

  function updateStage(i: number, key: keyof FermentationStage, val: unknown) {
    update(p => { (p.stages[i] as unknown as Record<string,unknown>)[key] = val; });
  }

  const chartData = buildChartData(profile.stages);
  const totalDays = profile.stages.reduce((s, st) => s + st.days + (st.ramp_days ?? 0), 0);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground">Profile Name</label>
          <input className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={profile.name} onChange={e => update(p => { p.name = e.target.value; })} />
        </div>
        <div className="text-sm text-muted-foreground pt-5">
          Total: <span className="font-semibold text-foreground">{totalDays} days</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm">Fermentation Stages</h4>
          <button onClick={addStage} className="flex items-center gap-1 text-xs px-2 py-1 bg-amber-500 text-white rounded hover:bg-amber-600"><Plus className="h-3 w-3" /> Add Stage</button>
        </div>

        <div className="space-y-2">
          {profile.stages.map((stage, i) => (
            <div key={i} className="flex items-center gap-2 p-3 border rounded bg-background text-sm flex-wrap">
              <input className="flex-1 min-w-[120px] px-2 py-1 border rounded bg-background text-sm" value={stage.name} onChange={e => updateStage(i,'name',e.target.value)} placeholder="Stage name" />
              <div className="flex items-center gap-1">
                <label className="text-xs text-muted-foreground">Temp</label>
                <input type="number" min={-5} max={40} className="w-16 px-2 py-1 border rounded bg-background text-sm text-right" value={stage.temp_c} onChange={e => updateStage(i,'temp_c',parseFloat(e.target.value)||20)} />
                <span className="text-muted-foreground text-xs">°C</span>
              </div>
              <div className="flex items-center gap-1">
                <label className="text-xs text-muted-foreground">Days</label>
                <input type="number" min={1} max={365} className="w-14 px-2 py-1 border rounded bg-background text-sm text-right" value={stage.days} onChange={e => updateStage(i,'days',parseInt(e.target.value)||1)} />
              </div>
              <div className="flex items-center gap-1">
                <label className="text-xs text-muted-foreground">Ramp</label>
                <input type="number" min={0} max={30} className="w-14 px-2 py-1 border rounded bg-background text-sm text-right" value={stage.ramp_days ?? 0} onChange={e => updateStage(i,'ramp_days',parseInt(e.target.value)||0)} />
                <span className="text-muted-foreground text-xs">days</span>
              </div>
              <button onClick={() => removeStage(i)} className="p-1 hover:bg-destructive/10 text-destructive rounded ml-auto"><Trash2 className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      </div>

      {profile.stages.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">Temperature Profile</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottom', offset: -2 }} tick={{ fontSize: 11 }} />
              <YAxis domain={['auto','auto']} tick={{ fontSize: 11 }} unit="°C" />
              <Tooltip formatter={(v: number) => [`${v}°C`, 'Temp']} labelFormatter={(l) => `Day ${l}`} />
              <ReferenceLine y={20} stroke="#e5e7eb" strokeDasharray="4 4" />
              <Line type="linear" dataKey="temp" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div>
        <label className="text-xs text-muted-foreground">Profile Notes</label>
        <textarea className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background resize-none" rows={2} value={profile.notes ?? ''} onChange={e => update(p => { p.notes = e.target.value; })} placeholder="Notes about this fermentation schedule..." />
      </div>
    </div>
  );
}
