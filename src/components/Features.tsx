
import { Users, ShieldCheck, Apple } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRef } from "react";

const Features = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: Users,
      headline: "News rated by AI committee...and you",
      description: "Our advanced AI system combines multiple credibility signals with community feedback to provide comprehensive trust scores for news articles.",
      color: "bg-orange-50",
      iconColor: "text-orange-600"
    },
    {
      icon: ShieldCheck,
      headline: "Not telling you what to consume",
      description: "We don't filter or censor content. Instead, we provide transparency tools so you can make your own informed decisions about news sources.",
      color: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      icon: Apple,
      headline: "You like nutritious food. Why not nutritious media?",
      description: "Just like nutrition labels help you choose healthy food, TruthScore helps you identify high-quality, factual news content.",
      color: "bg-purple-50",
      iconColor: "text-purple-600"
    }
  ];

  const pricingData = [
    { feature: "Price/mth", free: "Free", dedicated: "$3", expert: "$5" },
    { feature: "Rated articles", free: "100", dedicated: "1,000", expert: "Unlimited" },
    { feature: "Article history", free: "7 days", dedicated: "30 days", expert: "1 year" },
    { feature: "Basic trends", free: "✓", dedicated: "✓", expert: "✓" },
    { feature: "Advanced trends", free: "✗", dedicated: "✓", expert: "✓" },
    { feature: "Feedback", free: "✗", dedicated: "✗", expert: "✓" }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            How TruthScore Works
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Scroll through our key features to understand how we're revolutionizing news consumption
          </p>
        </div>

        {/* Features Carousel */}
        <div className="relative mb-20">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-8 pb-8 scroll-smooth snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="min-w-[350px] md:min-w-[400px] p-8 snap-center hover:shadow-xl transition-all duration-300 border-0 shadow-lg"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">
                  {feature.headline}
                </h3>
                
                <p className="text-slate-600 text-lg leading-relaxed">
                  {feature.description}
                </p>

                {/* Progress Indicator */}
                <div className="flex space-x-2 mt-8">
                  {features.map((_, i) => (
                    <div 
                      key={i}
                      className={`h-2 w-8 rounded-full transition-all duration-300 ${
                        i === index ? 'bg-orange-600' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Scroll Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {features.map((_, index) => (
              <button
                key={index}
                className="w-3 h-3 rounded-full bg-slate-300 hover:bg-orange-600 transition-colors duration-200"
                onClick={() => {
                  const cardWidth = 400 + 32; // card width + gap
                  scrollRef.current?.scrollTo({
                    left: index * cardWidth,
                    behavior: 'smooth'
                  });
                }}
              />
            ))}
          </div>
        </div>

        {/* Choose Your Version Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Choose your version
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Select the plan that best fits your news consumption needs
          </p>
        </div>

        {/* Pricing Table */}
        <div className="max-w-4xl mx-auto mb-20">
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold text-slate-900">Feature</TableHead>
                  <TableHead className="font-bold text-slate-900 text-center">Free</TableHead>
                  <TableHead className="font-bold text-slate-900 text-center">Dedicated</TableHead>
                  <TableHead className="font-bold text-slate-900 text-center">Expert</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingData.map((row, index) => (
                  <TableRow key={index} className="border-b">
                    <TableCell className="font-medium text-slate-900">{row.feature}</TableCell>
                    <TableCell className="text-center">{row.free}</TableCell>
                    <TableCell className="text-center">{row.dedicated}</TableCell>
                    <TableCell className="text-center">{row.expert}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to upgrade your news diet?
          </h3>
          <p className="text-lg text-slate-600 mb-8">
            Join thousands who are already making more informed media choices
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
              Get Started Free
            </button>
            <button className="text-orange-600 hover:text-orange-700 font-semibold text-lg">
              Learn More →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
