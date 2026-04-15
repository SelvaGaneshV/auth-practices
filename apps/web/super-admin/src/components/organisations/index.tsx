import { AddOrganisation } from "./add-organisation";

export const Organisations = () => {
  return (
    <div className="w-full flex items-center justify-between">
      <p className="font-semibold">Organisation List</p>
      <AddOrganisation />
    </div>
  );
};
