
import { Scale, Chrome, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-orange-50 py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-8">
          {/* Logo and Brand */}
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-3 bg-orange-600 rounded-xl shadow-lg">
              <Scale className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">TruthScore.ai</h1>
          </div>

          {/* Tagline */}
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
              The nutrition label
              <br />
              <span className="text-orange-600">for news</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Get AI-powered credibility scores for news articles and media content. 
              Make informed decisions about what you consume.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button 
              size="lg" 
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
            >
              <Chrome className="h-5 w-5" />
              <span>Add to Chrome</span>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 flex items-center space-x-2"
            >
              <Smartphone className="h-5 w-5" />
              <span>Download App</span>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="pt-12">
            <p className="text-sm text-slate-500 mb-4">Trusted by thousands of users</p>
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="text-slate-400 font-semibold">10K+ Downloads</div>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <div className="text-slate-400 font-semibold">4.8★ Rating</div>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <div className="text-slate-400 font-semibold">Featured in Chrome Store</div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-orange-100 rounded-full opacity-50 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-slate-100 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
    </section>
  );
};

export default Hero;
