import { ContextRouteApp } from "@/components/context-route-ui";
import { useContextRouteViewModel } from "@/hooks/use-context-route-view-model";

export default function HomeScreen() {
  const viewModel = useContextRouteViewModel();
  return <ContextRouteApp vm={viewModel} />;
}
