export const WATER_QUALITY_STANDARDS = {
  pH: {
    min: 6.5,
    max: 8.5,
    unit: '',
    lowSolution: "Add lime (calcium hydroxide) or sodium bicarbonate to raise pH. Monitor alkalinity levels and consider aeration systems.",
    highSolution: "Add food-grade citric acid or carbon dioxide injection. Install pH monitoring and automatic dosing systems.",
    globalInitiatives: [
      "Singapore's NEWater program uses advanced pH control in water reclamation",
      "Netherlands' Delta Works includes pH monitoring in flood control systems",
      "Japan's Lake Biwa restoration project implemented pH stabilization"
    ]
  },
  temperature: {
    min: 15,
    max: 35,
    unit: '°C',
    lowSolution: "Implement thermal pollution controls, shade structures, and riparian buffer zones. Monitor industrial discharges.",
    highSolution: "Install cooling towers, increase water flow, and implement thermal pollution controls. Monitor climate change impacts.",
    globalInitiatives: [
      "Germany's Rhine River thermal pollution control program",
      "USA's Clean Water Act thermal standards enforcement",
      "Canada's Great Lakes temperature monitoring network"
    ]
  },
  ec: {
    min: 150,
    max: 1500,
    unit: 'μS/cm',
    lowSolution: "Add mineral supplements, implement soil conservation practices, and monitor agricultural runoff.",
    highSolution: "Install reverse osmosis systems, implement industrial discharge controls, and monitor salt intrusion.",
    globalInitiatives: [
      "Israel's desalination plants reduce EC in drinking water",
      "Australia's Murray-Darling Basin salinity management",
      "India's Ganga Action Plan includes EC monitoring"
    ]
  },
  tds: {
    min: 100,
    max: 1000,
    unit: 'mg/L',
    lowSolution: "Implement mineral supplementation programs and monitor groundwater quality.",
    highSolution: "Install advanced filtration systems, implement industrial waste controls, and monitor urban runoff.",
    globalInitiatives: [
      "USA's Safe Drinking Water Act TDS standards",
      "EU's Water Framework Directive TDS monitoring",
      "China's Yangtze River TDS control program"
    ]
  },
  turbidity: {
    min: 0,
    max: 5,
    unit: 'NTU',
    lowSolution: "Monitor natural sedimentation and implement erosion control measures.",
    highSolution: "Install coagulation-flocculation systems, implement erosion controls, and monitor construction activities.",
    globalInitiatives: [
      "Brazil's Amazon River turbidity monitoring program",
      "Thailand's Chao Phraya River sediment control",
      "India's Namami Gange turbidity reduction initiatives"
    ]
  }
};

// Web scraping sources for real-time solutions
export const SOLUTION_SOURCES = {
  global: [
    "https://www.unep.org/explore-topics/water",
    "https://www.worldbank.org/en/topic/water",
    "https://www.who.int/teams/environment-climate-change-and-health/water-sanitation-and-health"
  ],
  india: [
    "https://cpcb.nic.in/",
    "https://nmcg.nic.in/",
    "https://www.moef.gov.in/"
  ],
  research: [
    "https://www.sciencedirect.com/topics/earth-and-planetary-sciences/water-quality",
    "https://www.nature.com/subjects/water-quality",
    "https://www.mdpi.com/journal/water"
  ]
};