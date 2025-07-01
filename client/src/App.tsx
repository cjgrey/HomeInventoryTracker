import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "@/components/layout";
import Home from "@/pages/home";
import Inventory from "@/pages/inventory";
import Locations from "@/pages/locations";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import AddItem from "@/pages/add-item";
import ItemDetail from "@/pages/item-detail";
import Scanner from "@/pages/scanner";
import ShareableLists from "@/pages/shareable-lists";
import NewShareableList from "@/pages/new-shareable-list";
import SharedListView from "@/pages/shared-list-view";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/locations" component={Locations} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        <Route path="/add-item" component={AddItem} />
        <Route path="/item/:id" component={ItemDetail} />
        <Route path="/scanner" component={Scanner} />
        <Route path="/shareable-lists" component={ShareableLists} />
        <Route path="/shareable-lists/new" component={NewShareableList} />
        <Route path="/share/:shareId">
          {(params) => <SharedListView shareId={params.shareId} />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
