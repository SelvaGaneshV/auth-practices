import { AddFeatureFlags } from "./add-feature-flag";

export const FeatureFlags = () => {
  return (
    <div className="w-full flex items-center justify-between">
      <p className="font-semibold">Feature flags list</p>
      <AddFeatureFlags />
    </div>
  );
};
