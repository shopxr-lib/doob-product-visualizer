// Define all the products data
const productsData = {
  plop: {
    name: "Plop",
    path: "plop",
    sizes: ["Small", "Medium", "Large"],
    colors: {
      Small: [
        "Wine Red",
        "Chili Red",
        "Apple Green",
        "Caribbean Blue",
        "Candy Pink",
        "Apricot Crush",
        "Pewter Blue",
        "Sage Green",
        "Chalk Violet",
        "Winter Wheat",
        "Ash Grey",
        "Jet Black",
      ],
      Medium: [
        "Wine Red",
        "Chili Red",
        "Apple Green",
        "Caribbean Blue",
        "Candy Pink",
        "Apricot Crush",
        "Pewter Blue",
        "Sage Green",
        "Chalk Violet",
        "Winter Wheat",
        "Ash Grey",
        "Jet Black",
      ],
      Large: [
        "Wine Red",
        "Chili Red",
        "Apple Green",
        "Caribbean Blue",
        "Candy Pink",
        "Apricot Crush",
        "Pewter Blue",
        "Sage Green",
        "Chalk Violet",
        "Winter Wheat",
        "Ash Grey",
        "Jet Black",
      ],
    },
    getModelPath: (size, color) => {
      const sizeFolder = size.toLowerCase();
      const colorPath = color.toLowerCase().replace(" ", "-");
      return `/assets/plop/${sizeFolder}/doob-bean-bag-1-${colorPath}-${sizeFolder}.glb`;
    },
    dimensions: {
      Small: { width: 45, height: 30, depth: 45 },
      Medium: { width: 55, height: 40, depth: 55 },
      Large: { width: 65, height: 50, depth: 65 },
    },
  },
  oomph: {
    name: "Oomph",
    path: "oomph",
    sizes: ["Medium", "Large"],
    colors: {
      Medium: [
        "Wine Red",
        "Chili Red",
        "Apple Green",
        "Caribbean Blue",
        "Candy Pink",
        "Apricot Crush",
        "Pewter Blue",
        "Sage Green",
        "Chalk Violet",
        "Winter Wheat",
        "Ash Grey",
        "Jet Black",
      ],
      Large: [
        "Wine Red",
        "Chili Red",
        "Apple Green",
        "Caribbean Blue",
        "Candy Pink",
        "Apricot Crush",
        "Pewter Blue",
        "Sage Green",
        "Chalk Violet",
        "Winter Wheat",
        "Ash Grey",
        "Jet Black",
      ],
    },
    getModelPath: (size, color) => {
      const sizeFolder = size.toLowerCase();
      const colorPath = color.toLowerCase().replace(" ", "-");
      return `/assets/oomph/${sizeFolder}/doob-bean-bag-2-${colorPath}-${sizeFolder}.glb`;
    },
    dimensions: {
      Medium: { width: 50, height: 45, depth: 50 },
      Large: { width: 60, height: 55, depth: 60 },
    },
  },
  plopsta: {
    name: "Plopsta",
    path: "plopsta",
    sizes: ["Medium", "Large"],
    colors: {
      Medium: [
        "Wine Red",
        "Chili Red",
        "Apple Green",
        "Caribbean Blue",
        "Candy Pink",
        "Apricot Crush",
        "Pewter Blue",
        "Sage Green",
        "Chalk Violet",
        "Winter Wheat",
        "Ash Grey",
        "Jet Black",
      ],
      Large: [
        "Wine Red",
        "Chili Red",
        "Apple Green",
        "Caribbean Blue",
        "Candy Pink",
        "Apricot Crush",
        "Pewter Blue",
        "Sage Green",
        "Chalk Violet",
        "Winter Wheat",
        "Ash Grey",
        "Jet Black",
      ],
    },
    getModelPath: (size, color) => {
      const sizeFolder = size.toLowerCase();
      const colorPath = color.toLowerCase().replace(" ", "-");
      return `/assets/plopsta/${sizeFolder}/doob-bean-bag-3-${colorPath}-${sizeFolder}.glb`;
    },
    dimensions: {
      Medium: { width: 55, height: 40, depth: 55 },
      Large: { width: 65, height: 50, depth: 65 },
    },
  },
  platoopat: {
    name: "Platoopat",
    path: "platoopat",
    sizes: ["Large"],
    colors: {
      Large: [
        "Wine Red",
        "Chili Red",
        "Apple Green",
        "Caribbean Blue",
        "Candy Pink",
        "Apricot Crush",
        "Pewter Blue",
        "Sage Green",
        "Chalk Violet",
        "Winter Wheat",
        "Ash Grey",
        "Jet Black",
      ],
    },
    getModelPath: (size, color) => {
      const sizeFolder = size.toLowerCase();
      const colorPath = color.toLowerCase().replace(" ", "-");
      return `/assets/platoopat/${sizeFolder}/doob-bean-bag-4-${colorPath}-${sizeFolder}.glb`;
    },
    dimensions: {
      Large: { width: 70, height: 45, depth: 70 },
    },
  },
  toonacan: {
    name: "Toonacan",
    path: "toonacan",
    sizes: ["Large"],
    colors: {
      Large: ["Beach Sand", "Driftwood", "Seashell", "Tidal Blue", "Seagrass"],
    },
    getModelPath: (size, color) => {
      const sizeFolder = size.toLowerCase();
      const colorPath = color.toLowerCase().replace(" ", "-");
      return `/assets/toonacan/${sizeFolder}/doob-bean-bag-5-pile-fabric-${colorPath}-${sizeFolder}.glb`;
    },
    dimensions: {
      Large: { width: 65, height: 50, depth: 65 },
    },
  },
  doobsta: {
    name: "Doobsta",
    path: "doobsta",
    sizes: ["Medium", "Large"],
    colors: {
      Medium: ["Beach Sand", "Driftwood", "Seashell", "Tidal Blue", "Seagrass"],
      Large: ["Beach Sand", "Driftwood", "Seashell", "Tidal Blue", "Seagrass"],
    },
    getModelPath: (size, color) => {
      const sizeFolder = size.toLowerCase();
      const colorPath = color.toLowerCase().replace(" ", "-");
      return `/assets/doobsta/${sizeFolder}/doob-bean-bag-6-pile-fabric-${colorPath}-${sizeFolder}.glb`;
    },
    dimensions: {
      Medium: { width: 50, height: 45, depth: 50 },
      Large: { width: 60, height: 55, depth: 60 },
    },
  },
};

export default productsData;
