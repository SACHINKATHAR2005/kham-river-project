import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Globe, MapPin, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";

function Blog() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("global");

  // Sample blog data (in real implementation, this would come from web scraping)
  const blogData = {
    global: [
      {
        id: 1,
        title: "Singapore's NEWater: Revolutionizing Water Reclamation",
        excerpt: "How Singapore transformed wastewater into high-quality drinking water using advanced technology and innovative approaches.",
        content: "Singapore's NEWater program is a world-leading example of water reclamation. The country now produces 40% of its water needs through advanced purification technologies, including reverse osmosis and ultraviolet disinfection. This initiative has made Singapore a global leader in water sustainability.",
        source: "https://www.pub.gov.sg/watersupply/fournationaltaps/newater",
        category: "Technology",
        country: "Singapore",
        date: "2024-01-15",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
      },
      {
        id: 2,
        title: "Netherlands' Delta Works: Engineering Against Climate Change",
        excerpt: "The world's largest flood protection system protecting the Netherlands from rising sea levels and extreme weather events.",
        content: "The Delta Works is a series of construction projects in the southwest of the Netherlands to protect a large area of land around the Rhine-Meuse-Scheldt delta from the sea. This engineering marvel includes dams, sluices, locks, dikes, and storm surge barriers.",
        source: "https://www.deltawerken.com/",
        category: "Engineering",
        country: "Netherlands",
        date: "2024-01-10",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"
      },
      {
        id: 3,
        title: "Germany's Rhine River Restoration Success",
        excerpt: "How Germany successfully restored the Rhine River from industrial pollution to a thriving ecosystem.",
        content: "The Rhine River restoration project transformed one of Europe's most polluted rivers into a clean, biodiverse waterway. Through strict environmental regulations, industrial cooperation, and community involvement, the Rhine now supports over 60 species of fish and serves as a model for river restoration worldwide.",
        source: "https://www.iksr.org/",
        category: "Restoration",
        country: "Germany",
        date: "2024-01-05",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"
      }
    ],
    india: [
      {
        id: 4,
        title: "Namami Gange: India's Ambitious River Cleanup",
        excerpt: "The comprehensive program to clean and rejuvenate the sacred Ganga River through technology and community participation.",
        content: "Namami Gange is India's flagship program to clean and rejuvenate the Ganga River. The initiative includes sewage treatment plants, riverfront development, surface cleaning, and biodiversity conservation. Over 300 projects have been sanctioned with an investment of over ₹30,000 crores.",
        source: "https://nmcg.nic.in/",
        category: "Government Initiative",
        country: "India",
        date: "2024-01-20",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
      },
      {
        id: 5,
        title: "Yamuna River Restoration: Delhi's Clean Water Mission",
        excerpt: "Delhi's comprehensive plan to restore the Yamuna River through advanced treatment technologies and community engagement.",
        content: "The Yamuna River restoration project in Delhi focuses on intercepting and treating sewage before it reaches the river. The project includes construction of sewage treatment plants, interceptor sewers, and community awareness programs to prevent pollution.",
        source: "https://delhi.gov.in/",
        category: "Urban Planning",
        country: "India",
        date: "2024-01-18",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
      },
      {
        id: 6,
        title: "Kerala's Periyar River Conservation",
        excerpt: "How Kerala is protecting the Periyar River through community-based conservation and sustainable practices.",
        content: "The Periyar River conservation project in Kerala involves local communities, government agencies, and environmental organizations working together to protect the river's ecosystem. The initiative includes pollution monitoring, waste management, and biodiversity conservation.",
        source: "https://kerala.gov.in/",
        category: "Community Action",
        country: "India",
        date: "2024-01-12",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
      }
    ],
    technology: [
      {
        id: 7,
        title: "AI-Powered Water Quality Monitoring",
        excerpt: "How artificial intelligence is revolutionizing water quality monitoring and pollution detection worldwide.",
        content: "AI-powered sensors and monitoring systems are transforming how we track water quality. These systems can detect pollutants in real-time, predict contamination events, and provide early warning systems for communities and industries.",
        source: "https://www.nature.com/articles/s41545-021-00139-w",
        category: "Technology",
        country: "Global",
        date: "2024-01-25",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400"
      },
      {
        id: 8,
        title: "Nanotechnology in Water Treatment",
        excerpt: "Revolutionary nanotechnology applications for removing pollutants and purifying water at the molecular level.",
        content: "Nanotechnology is offering breakthrough solutions in water treatment, from nano-filters that remove contaminants at the molecular level to photocatalytic materials that break down pollutants using sunlight.",
        source: "https://www.sciencedirect.com/science/article/abs/pii/S0043135421001234",
        category: "Innovation",
        country: "Global",
        date: "2024-01-22",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400"
      }
    ]
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setArticles(blogData[activeTab] || []);
      setLoading(false);
    }, 1000);
  }, [activeTab]);

  const handleTabChange = (value) => {
    setActiveTab(value);
    setLoading(true);
  };

  const handleReadMore = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">River Conservation Blog</h1>
        <p className="text-muted-foreground">
          Discover global initiatives, Indian projects, and cutting-edge technology in river conservation and water quality management
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="global">Global Initiatives</TabsTrigger>
          <TabsTrigger value="india">Indian Projects</TabsTrigger>
          <TabsTrigger value="technology">Technology & Innovation</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2">Loading articles...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-200 relative">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 left-2">
                      {article.category}
                    </Badge>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{article.country}</span>
                      <Calendar className="h-4 w-4 ml-2" />
                      <span>{new Date(article.date).toLocaleDateString()}</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReadMore(article.source)}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Read More
                      </Button>
                      
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <Card className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
          <p className="text-muted-foreground mb-4">
            Get the latest news and updates on river conservation initiatives worldwide
          </p>
          <Button className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Subscribe to Newsletter
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default Blog; 