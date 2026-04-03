export function Spinner() {
  return (
    <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
  );
}

export function SpinnerPage() {
  return (
    <div className="flex items-center justify-center py-24">
      <Spinner />
    </div>
  );
}
