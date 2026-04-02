import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useRecipeStore } from '@/store/recipeStore';
import { useCalculations } from '@/hooks/useCalculations';
import { produce } from 'immer';
import type { MashStep, MashProfileSnapshot } from '@/types';

const STEP_TYPES: MashStep['type'][] = ['infusion','temperature','decoction','sparge'];

function buildChartData(steps: MashStep[]) {
  const data: { time: number; temp: number }[] = [];
  let cumTime = 0;
  for (const step of steps) {
    if (step.ramp_time_min) {
      const prevTemp = data.length > 0 ? data[data.length - 1].temp : step.temp_c;
      data.push({ time: cumTime, temp: prevTemp });
      cumTime += step.ramp_time_min;
      data.push({ time: cumTime, temp: step.temp_c });
    } else {
      data.push({ time: cumTime, temp: step.temp_c });
    }
    cumTime += step.time_min;
    data.push({ time: cumTime, temp: step.temp_c });
  }
  return data;
}

export function MashTab() {
  const { draft, setMashProfile } = useRecipeStore();
  const stats = useCalculations();
  const mash = draft.mash_profile ?? { name: 'Single Infusion', steps: [], sparge_temp_c: 76, water_grain_ratio: 3.0, is_default: false };

  function update(fn: (m: MashProfileSnapshot) => void) {
    setMashProfile(produce(mash, fn));
  }

  function addStep() {
    update(m => { m.steps.push({ name: 'Mash', type: 'infusion', temp_c: 66, time_min: 60 }); });
  }
  function removeStep(i: number) { update(m => { m.steps.splice(i, 1); }); }
  function moveStep(i: number, dir: -1 | 1) { update(m => { const [s] = m.steps.splice(i,1); m.steps.splice(i+dir,0,s); }); }
  function updateStep(i: number, key: keyof MashStep, val: unknown) { update(m => { (m.steps[i] as unknown as Record<string,unknown>)[key] = val; }); }

  const chartData = buildChartData(mash.steps);

  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs text-muted-foreground">Profile Name</label>
          <input className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={mash.name} onChange={e => update(m => { m.name = e.target.value; })} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Water:Grain (L/kg)</label>
          <input type="number" min={1} max={10} step={0.1} className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={mash.water_grain_ratio} onChange={e => update(m => { m.water_grain_ratio = parseFloat(e.target.value)||3; })} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Sparge Temp (°C)</label>
          <input type="number" min={60} max={90} className="w-full mt-1 px-2 py-1.5 text-sm border rounded bg-background" value={mash.sparge_temp_c} onChange={e => update(m => { m.sparge_temp_c = parseFloat(e.target.value)||76; })} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg text-sm">
        <div><div className="text-xs text-muted-foreground">Mash Water</div><div className="font-semibold">{stats.mash_water_l.toFixed(2)} L</div></div>
        <div><div className="text-xs text-muted-foreground">Sparge Water</div><div className="font-semibold">{stats.sparge_water_l.toFixed(2)} L</div></div>
        <div><div className="text-xs text-muted-foreground">Total Water</div><div className="font-semibold">{stats.total_water_l.toFixed(2)} L</div></div>
        <div><div className="text-xs text-muted-foreground">Strike Temp</div><div className="font-semibold">{stats.strike_temp_c.toFixed(1)} °C</div></div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm">Mash Steps</h4>
          <button onClick={addStep} className="flex items-center gap-1 text-xs px-2 py-1 bg-amber-500 text-white rounded hover:bg-amber-600"><Plus className="h-3 w-3" /> Add Step</button>
        </div>
        <div className="space-y-2">
          {mash.steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 p-2 border rounded bg-background text-sm">
              <div className="flex flex-col gap-0.5">
                <button onClick={() => i > 0 && moveStep(i,-1)} disabled={i===0} className="p-0.5 hover:bg-muted rounded disabled:opacity-30"><ChevronUp className="h-3 w-3" /></button>
                <button onClick={() => i < mash.steps.length-1 && moveStep(i,1)} disabled={i===mash.steps.length-1} className="p-0.5 hover:bg-muted rounded disabled:opacity-30"><ChevronDown className="h-3 w-3" /></button>
              </div>
              <input className="flex-1 min-w-0 px-2 py-1 border rounded bg-background text-sm" value={step.name} onChange={e => updateStep(i,'name',e.target.value)} placeholder="Step name" />
              <select className="px-2 py-1 border rounded bg-background text-sm" value={step.type} onChange={e => updateStep(i,'type',e.target.value)}>
                {STEP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className="flex items-center gap-1">
                <input type="number" min={30} max={100} className="w-16 px-2 py-1 border rounded bg-background text-sm text-right" value={step.temp_c} onChange={e => updateStep(i,'temp_c',parseFloat(e.target.value)||66)} />
                <span className="text-muted-foreground text-xs">°C</span>
              </div>
              <div className="flex items-center gap-1">
                <input type="number" min={1} max={180} className="w-16 px-2 py-1 border rounded bg-background text-sm text-right" value={step.time_min} onChange={e => updateStep(i,'time_min',parseFloat(e.target.value)||60)} />
                <span className="text-muted-foreground text-xs">min</span>
              </div>
              <button onClick={() => removeStep(i)} className="p-1 hover:bg-destructive/10 text-destructive rounded"><Trash2 className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      </div>

      {chartData.length > 1 && (
        <div>
          <h4 className="font-medium text-sm mb-2">Temperature Profile</h4>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="time" label={{ value: 'Time (min)', position: 'insideBottom', offset: -2 }} tick={{ fontSize: 11 }} />
              <YAxis domain={['auto','auto']} tick={{ fontSize: 11 }} unit="°C" />
              <Tooltip formatter={(v: number) => [`${v}°C`, 'Temp']} labelFormatter={(l) => `${l} min`} />
              <Area type="stepAfter" dataKey="temp" stroke="#f59e0b" fill="#fef3c7" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
