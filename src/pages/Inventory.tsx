import { Layout } from "@/components/Layout";

export default function Inventory() {
  return (
    <Layout>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-muted-foreground mb-4">Coming Soon</h1>
          <p className="text-lg text-muted-foreground/70">
            Inventory management features are currently in development
          </p>
        </div>
      </div>
    </Layout>
  );
}