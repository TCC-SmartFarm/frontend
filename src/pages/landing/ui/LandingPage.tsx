import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { ROUTES } from "@/shared/constants/routes";
import { HeroSection } from "./HeroSection";
import { LandscapeBand } from "./LandscapeBand";
import { StatsRow } from "./StatsRow";
import { ProblemSolution } from "./ProblemSolution";
import { HowItWorks } from "./HowItWorks";
import { WhatYouMonitor } from "./WhatYouMonitor";
import { CommunityBand } from "./CommunityBand";
import { NextGenSolutions } from "./NextGenSolutions";
import { SustainableCard } from "./SustainableCard";
import { PricingSection } from "./PricingSection";
import { JoinCTA } from "./JoinCTA";
import { LandingFooter } from "./LandingFooter";

export const LandingPage = () => {
  const { loginWithRedirect, isAuthenticated, isLoading, error } = useAuth0();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD);
    } else {
      loginWithRedirect({ appState: { returnTo: ROUTES.DASHBOARD } });
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#f3eee5",
        color: "var(--sf-fg)",
        fontFamily: "var(--sf-font-display)",
      }}
    >
      <HeroSection onLogin={handleLogin} isLoading={isLoading} error={error} />
      <LandscapeBand />
      {/* <StatsRow /> */}
      <ProblemSolution />
      <HowItWorks />
      <WhatYouMonitor />
      <CommunityBand />
      <NextGenSolutions />
      <SustainableCard />
      <PricingSection onGetStarted={handleLogin} />
      <JoinCTA onLogin={handleLogin} />
      <LandingFooter />
    </div>
  );
};
