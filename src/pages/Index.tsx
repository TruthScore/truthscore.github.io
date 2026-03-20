import AnimatedBackground from "@/components/AnimatedBackground";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Features from "@/components/Features";

const Index = () => {
  return (
    <>
      <AnimatedBackground />
      <div className="relative z-10 min-h-screen">
        <Nav />
        <Hero />
        <Features />
      </div>
    </>
  );
};

export default Index;
