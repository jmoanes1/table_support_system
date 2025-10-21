// Beer Menu with Pricing System
export const beerMenu = {
  individual: [
    { name: 'Budweiser', price: 120, category: 'Domestic' },
    { name: 'Coors Light', price: 110, category: 'Domestic' },
    { name: 'Miller Lite', price: 115, category: 'Domestic' },
    { name: 'Corona Extra', price: 150, category: 'Import' },
    { name: 'Heineken', price: 160, category: 'Import' },
    { name: 'Stella Artois', price: 170, category: 'Import' },
    { name: 'Guinness', price: 180, category: 'Import' },
    { name: 'Blue Moon', price: 140, category: 'Craft' },
    { name: 'Samuel Adams', price: 155, category: 'Craft' },
    { name: 'Dos Equis', price: 145, category: 'Import' },
    { name: 'Modelo Especial', price: 135, category: 'Import' },
    { name: 'Michelob Ultra', price: 125, category: 'Domestic' },
    { name: 'Pabst Blue Ribbon', price: 100, category: 'Domestic' },
    { name: 'Yuengling', price: 130, category: 'Domestic' },
    { name: 'Sierra Nevada', price: 165, category: 'Craft' },
    { name: 'San Miguel', price: 120, category: 'Domestic' },
    { name: 'Red Horse', price: 110, category: 'Domestic' },
    { name: 'Tiger Beer', price: 125, category: 'Import' }
  ],
  buckets: [
    { name: 'Bucket of Budweiser (6 bottles)', price: 650, category: 'Bucket' },
    { name: 'Bucket of Coors Light (6 bottles)', price: 600, category: 'Bucket' },
    { name: 'Bucket of Corona (6 bottles)', price: 850, category: 'Bucket' },
    { name: 'Bucket of Heineken (6 bottles)', price: 900, category: 'Bucket' },
    { name: 'Bucket of Stella Artois (6 bottles)', price: 950, category: 'Bucket' },
    { name: 'Bucket of Guinness (6 bottles)', price: 1000, category: 'Bucket' },
    { name: 'Mixed Beer Bucket (6 bottles)', price: 800, category: 'Bucket' },
    { name: 'Bucket of San Miguel (6 bottles)', price: 650, category: 'Bucket' },
    { name: 'Bucket of Red Horse (6 bottles)', price: 600, category: 'Bucket' }
  ],
  specials: [
    { name: 'Happy Hour Special', price: 90, category: 'Special' },
    { name: 'Weekend Special', price: 100, category: 'Special' },
    { name: 'Game Day Special', price: 95, category: 'Special' }
  ]
};

// Get all menu items
export const getAllMenuItems = () => {
  return [...beerMenu.individual, ...beerMenu.buckets, ...beerMenu.specials];
};

// Get price by name
export const getPriceByName = (itemName) => {
  const allItems = getAllMenuItems();
  const item = allItems.find(item => item.name === itemName);
  return item ? item.price : 0;
};

// Get category by name
export const getCategoryByName = (itemName) => {
  const allItems = getAllMenuItems();
  const item = allItems.find(item => item.name === itemName);
  return item ? item.category : 'Other';
};

// Calculate total cost
export const calculateTotalCost = (itemName, quantity = 1) => {
  const price = getPriceByName(itemName);
  return price * quantity;
};
