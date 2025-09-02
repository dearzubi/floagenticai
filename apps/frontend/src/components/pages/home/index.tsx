import { FC } from "react";
import {
  HeroSection,
  DemoVideoSection,
  FeaturesSection,
  HowItWorksSection,
  MCPSection,
  OpenSourceSection,
  FooterSection,
} from "./sections";

const HomePage: FC = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <DemoVideoSection />
      <HowItWorksSection />
      <FeaturesSection />
      <MCPSection />
      <OpenSourceSection />
      <FooterSection />
    </div>
  );
};

export default HomePage;
