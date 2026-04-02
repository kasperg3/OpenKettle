import { Link } from 'react-router-dom';
import { FlaskConical, Droplets, Hop, Thermometer, BarChart3, Database, Users } from 'lucide-react';
import { RecipeCard } from '@/components/shared/RecipeCard';
import { usePublicRecipes } from '@/hooks/useRecipes';

const FEATURES = [
  { icon: BarChart3,  title: 'Live Calculators',       desc: 'OG, FG, ABV, IBU, SRM/EBC and water chemistry update instantly as you design your recipe.' },
  { icon: Hop,        title: 'IBU Methods',             desc: 'Tinseth, Rager, and Daniels IBU formulas. Per-addition IBU breakdown and BU:GU ratio.' },
  { icon: Droplets,   title: 'Water Chemistry',         desc: 'Mineral addition calculator with ion profiles, mash pH estimation, and famous water presets.' },
  { icon: Thermometer,title: 'Mash & Fermentation',    desc: 'Multi-step mash profiles with strike temp calculations. Multi-stage fermentation schedules with visual charts.' },
  { icon: Database,   title: 'Ingredient Database',     desc: 'Searchable database of malts, hops, yeast strains, and misc additions. All global data is open.' },
  { icon: Users,      title: 'Open Recipes',            desc: 'Every recipe is public by default. Browse, clone, and learn from the community — no paywalls.' },
];

export function HomePage() {
  const { data: recipes = [], isLoading } = usePublicRecipes({ limit: 6 });

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-amber-50 to-background dark:from-amber-950/20">
        <div className="mx-auto max-w-2xl">
          <FlaskConical className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">OpenKettle</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Open-source brewing calculator and recipe database.<br />
            Design beer recipes, calculate everything that matters, share with the community.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/recipes/new" className="px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors">
              Start Designing
            </Link>
            <Link to="/recipes" className="px-6 py-3 border rounded-lg font-medium hover:bg-muted transition-colors">
              Browse Recipes
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-center mb-10">Everything a homebrewer needs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-5 border rounded-xl bg-card hover:border-amber-300 transition-colors">
              <Icon className="h-8 w-8 text-amber-500 mb-3" />
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent recipes */}
      <section className="py-12 px-4 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Recipes</h2>
          <Link to="/recipes" className="text-sm text-amber-600 hover:underline">View all →</Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map(r => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No public recipes yet. <Link to="/recipes/new" className="text-amber-600 hover:underline">Be the first!</Link>
          </div>
        )}
      </section>
    </div>
  );
}
