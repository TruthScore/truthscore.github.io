import AnimatedBackground from "@/components/AnimatedBackground";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <AnimatedBackground />
      <div className="relative z-10 min-h-screen">
        <Nav />
        <Hero />
        <Features />
        <Footer />
      </div>
    </>
  );
};

export default Index;
