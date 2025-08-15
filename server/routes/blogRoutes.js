import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

// Web scraping function for water quality news
async function scrapeWaterQualityNews() {
  try {
    const sources = [
      'https://www.unep.org/explore-topics/water',
      'https://www.worldbank.org/en/topic/water',
      'https://cpcb.nic.in/',
      'https://nmcg.nic.in/'
    ];

    const articles = [];

    for (const source of sources) {
      try {
        const response = await axios.get(source, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        const $ = cheerio.load(response.data);
        
        // Extract articles (this is a basic example - would need customization per site)
        $('article, .news-item, .post').each((i, element) => {
          const title = $(element).find('h1, h2, h3, .title').first().text().trim();
          const excerpt = $(element).find('p, .excerpt, .summary').first().text().trim();
          const link = $(element).find('a').first().attr('href');
          
          if (title && excerpt) {
            articles.push({
              title,
              excerpt: excerpt.substring(0, 200) + '...',
              source: source,
              link: link ? new URL(link, source).href : source,
              date: new Date().toISOString()
            });
          }
        });
      } catch (error) {
        console.error(`Error scraping ${source}:`, error.message);
      }
    }

    return articles;
  } catch (error) {
    console.error('Error in web scraping:', error);
    return [];
  }
}

// Get blog articles
router.get('/articles', async (req, res) => {
  try {
    const { category = 'all' } = req.query;
    
    // For now, return sample data
    // In production, this would call scrapeWaterQualityNews()
    const sampleArticles = [
      {
        id: 1,
        title: "Singapore's NEWater: Revolutionizing Water Reclamation",
        excerpt: "How Singapore transformed wastewater into high-quality drinking water using advanced technology.",
        source: "https://www.pub.gov.sg/watersupply/fournationaltaps/newater",
        category: "Technology",
        country: "Singapore",
        date: "2024-01-15"
      },
      {
        id: 2,
        title: "Namami Gange: India's Ambitious River Cleanup",
        excerpt: "The comprehensive program to clean and rejuvenate the sacred Ganga River.",
        source: "https://nmcg.nic.in/",
        category: "Government Initiative",
        country: "India",
        date: "2024-01-20"
      }
    ];

    const filteredArticles = category === 'all' 
      ? sampleArticles 
      : sampleArticles.filter(article => article.category === category);

    res.json({
      success: true,
      data: filteredArticles
    });
  } catch (error) {
    console.error('Error fetching blog articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog articles'
    });
  }
});

// Get water quality solutions from real sources
router.get('/solutions', async (req, res) => {
  try {
    const { parameter } = req.query;
    
    // Sample solutions based on real water treatment practices
    const solutions = {
      pH: {
        low: "Add lime (calcium hydroxide) or sodium bicarbonate to raise pH. Monitor alkalinity levels.",
        high: "Add food-grade citric acid or carbon dioxide injection. Install pH monitoring systems.",
        sources: ["https://www.who.int/water_sanitation_health/dwq/chemicals/ph.pdf"]
      },
      temperature: {
        low: "Implement thermal pollution controls and riparian buffer zones.",
        high: "Install cooling towers and increase water flow. Monitor climate change impacts.",
        sources: ["https://www.epa.gov/thermal-pollution"]
      },
      ec: {
        low: "Add mineral supplements and implement soil conservation practices.",
        high: "Install reverse osmosis systems and implement industrial discharge controls.",
        sources: ["https://www.fao.org/3/aq444e/aq444e.pdf"]
      },
      tds: {
        low: "Implement mineral supplementation programs.",
        high: "Install advanced filtration systems and implement industrial waste controls.",
        sources: ["https://www.who.int/water_sanitation_health/dwq/chemicals/tds.pdf"]
      },
      turbidity: {
        low: "Monitor natural sedimentation and implement erosion control measures.",
        high: "Install coagulation-flocculation systems and implement erosion controls.",
        sources: ["https://www.epa.gov/turbidity"]
      }
    };

    if (parameter && solutions[parameter]) {
      res.json({
        success: true,
        data: solutions[parameter]
      });
    } else {
      res.json({
        success: true,
        data: solutions
      });
    }
  } catch (error) {
    console.error('Error fetching solutions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch solutions'
    });
  }
});

export default router; 