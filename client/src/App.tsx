import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Collection from "./pages/Collection";
import Mirror from "./pages/Mirror";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderResult from "./pages/OrderResult";
import Admin from "./pages/Admin";
import Contact from "./pages/Contact";
import Privacy from "@/pages/Privacy";
import Preloader from "./components/Preloader";
import WelcomeAudio from "./components/WelcomeAudio";
import GoldenDustCursor from "./components/GoldenDustCursor";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/collection"} component={Collection} />
      <Route path={"/gallery"} component={Gallery} />
      <Route path={"/mirror"} component={Mirror} />
      <Route path={"/about"} component={About} />
      <Route path={"/cart"} component={Cart} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/checkout/result"} component={OrderResult} />
      <Route path={"/contacts"} component={Contact} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  const [showPreloader, setShowPreloader] = useState(true);
  const [preloaderLeaving, setPreloaderLeaving] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setPreloaderLeaving(true), 2500);
    const removeTimer = window.setTimeout(() => setShowPreloader(false), 3200);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <LanguageProvider>
            <CartProvider>
              <GoldenDustCursor />
              <Router />
            </CartProvider>
            <WelcomeAudio />
          </LanguageProvider>
          {showPreloader && <Preloader leaving={preloaderLeaving} />}
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
