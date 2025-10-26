import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Heart, Shield } from "lucide-react";
import heroImage from "@/assets/hero-jewelry.jpg";
import necklaceImage from "@/assets/necklace.jpg";
import earringsImage from "@/assets/earrings.jpg";
import braceletImage from "@/assets/bracelet.jpg";

const Index = () => {
  const collections = [
    {
      name: "Celestial Necklaces",
      image: necklaceImage,
      description: "Delicate chains that capture starlight",
    },
    {
      name: "Diamond Earrings",
      image: earringsImage,
      description: "Timeless elegance for every moment",
    },
    {
      name: "Rose Gold Bracelets",
      image: braceletImage,
      description: "Graceful designs that embrace beauty",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-serif font-semibold tracking-tight">Lumière</h1>
          <div className="hidden md:flex gap-8 font-sans text-sm">
            <a href="#collections" className="hover:text-accent transition-colors">Collections</a>
            <a href="#about" className="hover:text-accent transition-colors">Our Story</a>
            <a href="#contact" className="hover:text-accent transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-background/40 backdrop-blur-sm"></div>
        </div>
        <div className="relative z-10 text-center px-6 animate-fade-in">
          <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight">
            Timeless Elegance
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground font-sans max-w-2xl mx-auto">
            Discover exquisite handcrafted jewelry that celebrates your unique story
          </p>
          <Button 
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-sans font-medium px-8 py-6 text-lg shadow-elegant hover:scale-105 transition-all"
          >
            Explore Collections
          </Button>
        </div>
      </section>

      {/* Collections Section */}
      <section id="collections" className="py-24 px-6 bg-gradient-elegant">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h3 className="text-4xl md:text-5xl font-serif font-bold mb-4">Featured Collections</h3>
            <p className="text-muted-foreground font-sans text-lg">
              Each piece tells a story of craftsmanship and beauty
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {collections.map((collection, index) => (
              <Card 
                key={index} 
                className="overflow-hidden border-border bg-card hover:shadow-elegant transition-all duration-500 hover:scale-105 animate-fade-in group cursor-pointer"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={collection.image} 
                    alt={collection.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h4 className="text-2xl font-serif font-semibold mb-2">{collection.name}</h4>
                  <p className="text-muted-foreground font-sans">{collection.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h3 className="text-4xl font-serif font-bold mb-6">Our Story</h3>
              <p className="text-muted-foreground font-sans text-lg mb-6 leading-relaxed">
                Born from a passion for timeless beauty, Lumière creates jewelry that transcends trends. 
                Each piece is meticulously handcrafted by skilled artisans who pour their heart into every detail.
              </p>
              <p className="text-muted-foreground font-sans text-lg leading-relaxed">
                We believe jewelry is more than adornment—it's a celebration of life's precious moments, 
                a symbol of love, and an heirloom for generations to come.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-serif font-semibold text-xl mb-2">Premium Quality</h4>
                  <p className="text-muted-foreground font-sans">Ethically sourced materials and finest craftsmanship</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-serif font-semibold text-xl mb-2">Made with Love</h4>
                  <p className="text-muted-foreground font-sans">Each piece handcrafted with passion and care</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-serif font-semibold text-xl mb-2">Lifetime Guarantee</h4>
                  <p className="text-muted-foreground font-sans">We stand behind every piece we create</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-24 px-6 bg-gradient-rose-gold text-primary-foreground">
        <div className="container mx-auto text-center animate-fade-in">
          <h3 className="text-4xl md:text-5xl font-serif font-bold mb-6">Begin Your Journey</h3>
          <p className="text-xl mb-8 max-w-2xl mx-auto font-sans opacity-90">
            Let us help you find the perfect piece that speaks to your soul
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="font-sans font-medium px-8 py-6 text-lg shadow-elegant hover:scale-105 transition-all"
          >
            Schedule Consultation
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border bg-background">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-serif font-semibold mb-4">Lumière</h2>
          <p className="text-muted-foreground font-sans mb-6">
            Crafting timeless elegance since 2024
          </p>
          <div className="flex justify-center gap-6 text-sm font-sans text-muted-foreground">
            <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-accent transition-colors">Shipping Info</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
