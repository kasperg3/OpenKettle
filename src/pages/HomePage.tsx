import { Link } from 'react-router-dom';
import { FlaskConical, Droplets, Hop, Thermometer, BarChart3, Database, Users, ArrowRight } from 'lucide-react';
import { RecipeCard } from '@/components/shared/RecipeCard';
import { usePublicRecipes } from '@/hooks/useRecipes';

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Live Calculators',
    desc: 'OG, FG, ABV, IBU, SRM/EBC and water chemistry update instantly as you design your recipe.',
  },
  {
    icon: Hop,
    title: 'IBU Methods',
    desc: 'Tinseth, Rager, and Daniels IBU formulas. Per-addition IBU breakdown and BU:GU ratio.',
  },
  {
    icon: Droplets,
    title: 'Water Chemistry',
    desc: 'Mineral addition calculator with ion profiles, mash pH estimation, and famous water presets.',
  },
  {
    icon: Thermometer,
    title: 'Mash & Fermentation',
    desc: 'Multi-step mash profiles with strike temp calculations. Multi-stage fermentation schedules with visual charts.',
  },
  {
    icon: Database,
    title: 'Ingredient Database',
    desc: 'Searchable database of malts, hops, yeast strains, and misc additions. All global data is open.',
  },
  {
    icon: Users,
    title: 'Open Recipes',
    desc: 'Every recipe is public by default. Browse, clone, and learn from the community — no paywalls.',
  },
];

export function HomePage() {
  const { data: recipes = [], isLoading } = usePublicRecipes({ limit: 6 });

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-amber-50/40 to-background dark:from-amber-950/30 dark:via-amber-950/10 dark:to-background -z-10" />
        {/* Decorative blur orbs */}
        <div className="absolute top-8 left-1/4 w-64 h-64 bg-amber-300/20 dark:bg-amber-500/10 rounded-full blur-3xl -z-10" aria-hidden="true" />
        <div className="absolute bottom-0 right-1/4 w-96 h-48 bg-amber-200/20 dark:bg-amber-600/10 rounded-full blur-3xl -z-10" aria-hidden="true" />

        <div className="mx-auto max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-medium mb-6 border border-amber-200 dark:border-amber-800">
            <FlaskConical className="h-3.5 w-3.5" />
            Free & open source
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-5 tracking-tight">
            <span className="text-foreground">Open</span>
            <span className="text-amber-500">Kettle</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
            The open-source brewing calculator and recipe database.
            Design beer, calculate what matters, share with homebrewers worldwide.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/recipes/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 active:bg-amber-700 transition-colors shadow-sm hover:shadow-md"
            >
              Start Designing
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/recipes"
              className="inline-flex items-center gap-2 px-6 py-3 border rounded-xl font-medium hover:bg-muted transition-colors"
            >
              Browse Recipes
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-2">Everything a homebrewer needs</h2>
          <p className="text-muted-foreground text-sm">Precision tools, ingredient database, brew history — all in one place.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group p-5 border rounded-xl bg-card hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 mb-3 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
                <Icon className="h-5 w-5 text-amber-500" />
              </div>
              <h3 className="font-semibold mb-1.5">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent recipes */}
      <section className="py-12 px-4 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Recipes</h2>
          <Link to="/recipes" className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 transition-colors">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map(r => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed rounded-xl text-muted-foreground">
            <FlaskConical className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="mb-3">No public recipes yet.</p>
            <Link to="/recipes/new" className="text-sm text-amber-600 hover:underline">
              Be the first to share one →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
