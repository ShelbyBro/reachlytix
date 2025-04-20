
import { FC } from "react";
import { DashboardAdminNotice as MainDashboardAdminNotice } from "@/components/dashboard/DashboardAdminNotice";

interface Props {
  role: string | null;
}

export const DashboardAdminNotice: FC<Props> = ({ role }) => (
  <MainDashboardAdminNotice role={role} />
);
