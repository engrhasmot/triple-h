export default function ClientLoading() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-background">
      <div className="text-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="text-muted-foreground text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
