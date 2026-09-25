import { Outlet } from "react-router-dom";
import PageLayout from "../../components/PageLayout";

export default function AdminLayout() {
  return (
    <PageLayout>
      <Outlet />
    </PageLayout>
  );
}
