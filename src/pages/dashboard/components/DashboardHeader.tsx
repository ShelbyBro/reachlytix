
import { FC } from "react";
import { DashboardHeader as MainDashboardHeader } from "@/components/dashboard/DashboardHeader";

interface Props {
  greeting: string;
  role: string | null;
}

export const DashboardHeader: FC<Props> = ({ greeting, role }) => (
  <MainDashboardHeader greeting={greeting} role={role} />
);
