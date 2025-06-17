
import { Scale, Chrome, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-orange-50 py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-8">
          {/* Logo and Brand */}
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-3 bg-orange-600 rounded-xl shadow-lg animate-pulse">
              <Scale className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">TruthScore.ai</h1>
          </div>

          {/* Tagline */}
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight animate-fade-in">
              The nutrition label
              <br />
              <span className="text-orange-600">for news</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Get AI-powered credibility scores for news articles and media content. 
              Make informed decisions about what you consume.
            </p>
            
            {/* Animated Hero Visual */}
            <div className="relative w-full max-w-md mx-auto mt-8 mb-8">
              <div className="relative h-32 flex items-center justify-center">
                {/* Floating News Cards */}
                <div className="absolute w-16 h-12 bg-white rounded-lg shadow-lg border-2 border-orange-200 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s', left: '10%', top: '10%' }}>
                  <div className="p-2">
                    <div className="w-full h-2 bg-slate-200 rounded mb-1"></div>
                    <div className="w-3/4 h-1 bg-slate-100 rounded"></div>
                  </div>
                </div>
                
                <div className="absolute w-16 h-12 bg-white rounded-lg shadow-lg border-2 border-green-200 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s', right: '10%', top: '20%' }}>
                  <div className="p-2">
                    <div className="w-full h-2 bg-slate-200 rounded mb-1"></div>
                    <div className="w-2/3 h-1 bg-slate-100 rounded"></div>
                  </div>
                </div>
                
                <div className="absolute w-16 h-12 bg-white rounded-lg shadow-lg border-2 border-red-200 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3s', left: '20%', bottom: '10%' }}>
                  <div className="p-2">
                    <div className="w-full h-2 bg-slate-200 rounded mb-1"></div>
                    <div className="w-4/5 h-1 bg-slate-100 rounded"></div>
                  </div>
                </div>
                
                {/* Central Analysis Hub */}
                <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                  <Scale className="h-8 w-8 text-white" />
                  {/* Scanning Lines */}
                  <div className="absolute inset-0 rounded-full border-4 border-orange-300 opacity-50 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-orange-400 opacity-30 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                </div>
                
                {/* Score Badges */}
                <div className="absolute -right-4 top-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-fade-in" style={{ animationDelay: '1.5s' }}>
                  85%
                </div>
                <div className="absolute -left-4 bottom-4 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-fade-in" style={{ animationDelay: '2s' }}>
                  72%
                </div>
                <div className="absolute right-2 bottom-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-fade-in" style={{ animationDelay: '2.5s' }}>
                  31%
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button 
              size="lg" 
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 hover:scale-105"
            >
              <Chrome className="h-5 w-5" />
              <span>Add to Chrome</span>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 flex items-center space-x-2 hover:scale-105"
            >
              <Smartphone className="h-5 w-5" />
              <span>Download App</span>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="pt-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
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
      
      {/* Floating Data Points */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-300 rounded-full animate-ping opacity-40"></div>
      <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-slate-400 rounded-full animate-ping opacity-30" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-green-300 rounded-full animate-ping opacity-25" style={{ animationDelay: '4s' }}></div>
    </section>
  );
};

export default Hero;
