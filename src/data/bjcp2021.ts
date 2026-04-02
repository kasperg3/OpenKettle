import type { BJCPStyle } from '@/types';

export const BJCP_STYLES: BJCPStyle[] = [
  // Category 1: Standard American Beer
  { id:'1A', category_number:1, category:'Standard American Beer', subcategory:'A', name:'American Light Lager', og_min:1.028, og_max:1.040, fg_min:1.000, fg_max:1.006, ibu_min:8, ibu_max:12, srm_min:2, srm_max:3, abv_min:2.8, abv_max:4.2, tags:['session-strength','pale-color','bottom-fermented','lagered'] },
  { id:'1B', category_number:1, category:'Standard American Beer', subcategory:'B', name:'American Lager', og_min:1.040, og_max:1.050, fg_min:1.004, fg_max:1.010, ibu_min:8, ibu_max:18, srm_min:2, srm_max:3, abv_min:4.2, abv_max:5.3, tags:['standard-strength','pale-color','bottom-fermented','lagered'] },
  { id:'1C', category_number:1, category:'Standard American Beer', subcategory:'C', name:'Cream Ale', og_min:1.042, og_max:1.055, fg_min:1.006, fg_max:1.012, ibu_min:8, ibu_max:20, srm_min:2, srm_max:5, abv_min:4.2, abv_max:5.6, tags:['standard-strength','pale-color','top-fermented'] },
  { id:'1D', category_number:1, category:'Standard American Beer', subcategory:'D', name:'American Wheat Beer', og_min:1.040, og_max:1.055, fg_min:1.008, fg_max:1.013, ibu_min:15, ibu_max:30, srm_min:3, srm_max:6, abv_min:4.0, abv_max:5.5, tags:['standard-strength','pale-color','top-fermented','wheat-beer-family'] },

  // Category 2: International Lager
  { id:'2A', category_number:2, category:'International Lager', subcategory:'A', name:'International Pale Lager', og_min:1.042, og_max:1.050, fg_min:1.008, fg_max:1.012, ibu_min:18, ibu_max:25, srm_min:2, srm_max:6, abv_min:4.6, abv_max:6.0, tags:['standard-strength','pale-color','bottom-fermented','lagered'] },
  { id:'2B', category_number:2, category:'International Lager', subcategory:'B', name:'International Amber Lager', og_min:1.042, og_max:1.055, fg_min:1.008, fg_max:1.014, ibu_min:8, ibu_max:25, srm_min:7, srm_max:14, abv_min:4.6, abv_max:6.0, tags:['standard-strength','amber-color','bottom-fermented','lagered'] },
  { id:'2C', category_number:2, category:'International Lager', subcategory:'C', name:'International Dark Lager', og_min:1.044, og_max:1.056, fg_min:1.008, fg_max:1.012, ibu_min:8, ibu_max:20, srm_min:14, srm_max:30, abv_min:4.2, abv_max:6.0, tags:['standard-strength','dark-color','bottom-fermented','lagered'] },

  // Category 3: Czech Lager
  { id:'3A', category_number:3, category:'Czech Lager', subcategory:'A', name:'Czech Pale Lager', og_min:1.028, og_max:1.044, fg_min:1.008, fg_max:1.014, ibu_min:20, ibu_max:35, srm_min:3, srm_max:6, abv_min:3.0, abv_max:4.1, tags:['session-strength','pale-color','bottom-fermented','lagered','central-europe'] },
  { id:'3B', category_number:3, category:'Czech Lager', subcategory:'B', name:'Czech Premium Pale Lager', og_min:1.044, og_max:1.060, fg_min:1.013, fg_max:1.017, ibu_min:30, ibu_max:45, srm_min:3, srm_max:6, abv_min:4.2, abv_max:5.8, tags:['standard-strength','pale-color','bottom-fermented','lagered','central-europe','pilsner-family'] },
  { id:'3C', category_number:3, category:'Czech Lager', subcategory:'C', name:'Czech Amber Lager', og_min:1.044, og_max:1.060, fg_min:1.013, fg_max:1.017, ibu_min:20, ibu_max:35, srm_min:10, srm_max:16, abv_min:4.4, abv_max:5.8, tags:['standard-strength','amber-color','bottom-fermented','lagered','central-europe'] },
  { id:'3D', category_number:3, category:'Czech Lager', subcategory:'D', name:'Czech Dark Lager', og_min:1.044, og_max:1.060, fg_min:1.013, fg_max:1.017, ibu_min:15, ibu_max:34, srm_min:14, srm_max:35, abv_min:4.4, abv_max:5.8, tags:['standard-strength','dark-color','bottom-fermented','lagered','central-europe'] },

  // Category 4: Pale Malty European Lager
  { id:'4A', category_number:4, category:'Pale Malty European Lager', subcategory:'A', name:'Munich Helles', og_min:1.044, og_max:1.048, fg_min:1.006, fg_max:1.012, ibu_min:16, ibu_max:22, srm_min:3, srm_max:5, abv_min:4.7, abv_max:5.4, tags:['standard-strength','pale-color','bottom-fermented','lagered','central-europe'] },
  { id:'4B', category_number:4, category:'Pale Malty European Lager', subcategory:'B', name:'Festbier', og_min:1.054, og_max:1.057, fg_min:1.010, fg_max:1.014, ibu_min:18, ibu_max:25, srm_min:4, srm_max:7, abv_min:5.8, abv_max:6.3, tags:['standard-strength','pale-color','bottom-fermented','lagered','central-europe'] },
  { id:'4C', category_number:4, category:'Pale Malty European Lager', subcategory:'C', name:'Helles Bock', og_min:1.064, og_max:1.072, fg_min:1.011, fg_max:1.018, ibu_min:23, ibu_max:35, srm_min:6, srm_max:11, abv_min:6.3, abv_max:7.4, tags:['high-strength','pale-color','bottom-fermented','lagered','central-europe','bock-family'] },

  // Category 5: Pale Bitter European Beer
  { id:'5A', category_number:5, category:'Pale Bitter European Beer', subcategory:'A', name:'German Leichtbier', og_min:1.026, og_max:1.034, fg_min:1.006, fg_max:1.010, ibu_min:15, ibu_max:28, srm_min:2, srm_max:5, abv_min:2.4, abv_max:3.6, tags:['session-strength','pale-color','bottom-fermented','lagered','central-europe'] },
  { id:'5B', category_number:5, category:'Pale Bitter European Beer', subcategory:'B', name:'Kölsch', og_min:1.044, og_max:1.050, fg_min:1.007, fg_max:1.011, ibu_min:18, ibu_max:30, srm_min:3, srm_max:5, abv_min:4.4, abv_max:5.2, tags:['standard-strength','pale-color','top-fermented','lagered','central-europe'] },
  { id:'5C', category_number:5, category:'Pale Bitter European Beer', subcategory:'C', name:'German Helles Exportbier', og_min:1.048, og_max:1.056, fg_min:1.010, fg_max:1.015, ibu_min:20, ibu_max:30, srm_min:4, srm_max:7, abv_min:4.8, abv_max:6.0, tags:['standard-strength','pale-color','bottom-fermented','lagered','central-europe'] },
  { id:'5D', category_number:5, category:'Pale Bitter European Beer', subcategory:'D', name:'German Pils', og_min:1.044, og_max:1.050, fg_min:1.008, fg_max:1.013, ibu_min:22, ibu_max:40, srm_min:2, srm_max:4, abv_min:4.4, abv_max:5.2, tags:['standard-strength','pale-color','bottom-fermented','lagered','central-europe','pilsner-family'] },

  // Category 6: Amber Malty European Lager
  { id:'6A', category_number:6, category:'Amber Malty European Lager', subcategory:'A', name:'Märzen', og_min:1.054, og_max:1.060, fg_min:1.010, fg_max:1.014, ibu_min:18, ibu_max:24, srm_min:8, srm_max:17, abv_min:5.8, abv_max:6.3, tags:['standard-strength','amber-color','bottom-fermented','lagered','central-europe'] },
  { id:'6B', category_number:6, category:'Amber Malty European Lager', subcategory:'B', name:'Rauchbier', og_min:1.050, og_max:1.057, fg_min:1.012, fg_max:1.016, ibu_min:20, ibu_max:30, srm_min:12, srm_max:22, abv_min:4.8, abv_max:6.0, tags:['standard-strength','amber-color','bottom-fermented','lagered','central-europe','smoke'] },
  { id:'6C', category_number:6, category:'Amber Malty European Lager', subcategory:'C', name:'Dunkles Bock', og_min:1.064, og_max:1.072, fg_min:1.013, fg_max:1.019, ibu_min:20, ibu_max:27, srm_min:14, srm_max:22, abv_min:6.3, abv_max:7.2, tags:['high-strength','dark-color','bottom-fermented','lagered','central-europe','bock-family'] },

  // Category 7: Amber Bitter European Beer
  { id:'7A', category_number:7, category:'Amber Bitter European Beer', subcategory:'A', name:'Vienna Lager', og_min:1.048, og_max:1.055, fg_min:1.010, fg_max:1.014, ibu_min:18, ibu_max:30, srm_min:9, srm_max:15, abv_min:4.7, abv_max:5.5, tags:['standard-strength','amber-color','bottom-fermented','lagered','central-europe'] },
  { id:'7B', category_number:7, category:'Amber Bitter European Beer', subcategory:'B', name:'Altbier', og_min:1.044, og_max:1.052, fg_min:1.008, fg_max:1.014, ibu_min:25, ibu_max:50, srm_min:11, srm_max:17, abv_min:4.3, abv_max:5.5, tags:['standard-strength','amber-color','top-fermented','lagered','central-europe'] },
  { id:'7C', category_number:7, category:'Amber Bitter European Beer', subcategory:'C', name:'Kellerbier', og_min:1.048, og_max:1.054, fg_min:1.012, fg_max:1.015, ibu_min:25, ibu_max:40, srm_min:7, srm_max:17, abv_min:4.7, abv_max:5.4, tags:['standard-strength','amber-color','bottom-fermented','lagered','central-europe'] },

  // Category 8: Dark European Lager
  { id:'8A', category_number:8, category:'Dark European Lager', subcategory:'A', name:'Munich Dunkel', og_min:1.048, og_max:1.056, fg_min:1.010, fg_max:1.016, ibu_min:18, ibu_max:28, srm_min:14, srm_max:28, abv_min:4.5, abv_max:5.6, tags:['standard-strength','dark-color','bottom-fermented','lagered','central-europe'] },
  { id:'8B', category_number:8, category:'Dark European Lager', subcategory:'B', name:'Schwarzbier', og_min:1.046, og_max:1.052, fg_min:1.010, fg_max:1.016, ibu_min:20, ibu_max:35, srm_min:17, srm_max:30, abv_min:4.4, abv_max:5.4, tags:['standard-strength','dark-color','bottom-fermented','lagered','central-europe'] },

  // Category 9: Strong European Beer
  { id:'9A', category_number:9, category:'Strong European Beer', subcategory:'A', name:'Doppelbock', og_min:1.072, og_max:1.112, fg_min:1.016, fg_max:1.024, ibu_min:16, ibu_max:26, srm_min:6, srm_max:25, abv_min:7.0, abv_max:10.0, tags:['very-high-strength','amber-color','bottom-fermented','lagered','central-europe','bock-family'] },
  { id:'9B', category_number:9, category:'Strong European Beer', subcategory:'B', name:'Eisbock', og_min:1.078, og_max:1.120, fg_min:1.020, fg_max:1.035, ibu_min:25, ibu_max:35, srm_min:18, srm_max:30, abv_min:9.0, abv_max:14.0, tags:['very-high-strength','dark-color','bottom-fermented','lagered','central-europe','bock-family'] },
  { id:'9C', category_number:9, category:'Strong European Beer', subcategory:'C', name:'Baltic Porter', og_min:1.060, og_max:1.090, fg_min:1.016, fg_max:1.024, ibu_min:20, ibu_max:40, srm_min:17, srm_max:30, abv_min:6.5, abv_max:9.5, tags:['high-strength','dark-color','bottom-fermented','lagered','eastern-europe','porter-family'] },

  // Category 10: German Wheat Beer
  { id:'10A', category_number:10, category:'German Wheat Beer', subcategory:'A', name:'Weissbier', og_min:1.044, og_max:1.052, fg_min:1.010, fg_max:1.014, ibu_min:8, ibu_max:15, srm_min:2, srm_max:6, abv_min:4.3, abv_max:5.6, tags:['standard-strength','pale-color','top-fermented','central-europe','wheat-beer-family'] },
  { id:'10B', category_number:10, category:'German Wheat Beer', subcategory:'B', name:'Dunkles Weissbier', og_min:1.044, og_max:1.056, fg_min:1.010, fg_max:1.014, ibu_min:10, ibu_max:18, srm_min:14, srm_max:23, abv_min:4.3, abv_max:5.6, tags:['standard-strength','dark-color','top-fermented','central-europe','wheat-beer-family'] },
  { id:'10C', category_number:10, category:'German Wheat Beer', subcategory:'C', name:'Weizenbock', og_min:1.064, og_max:1.090, fg_min:1.015, fg_max:1.022, ibu_min:15, ibu_max:30, srm_min:6, srm_max:25, abv_min:6.5, abv_max:9.0, tags:['high-strength','amber-color','top-fermented','central-europe','wheat-beer-family','bock-family'] },

  // Category 12: Pale Commonwealth Beer
  { id:'12A', category_number:12, category:'Pale Commonwealth Beer', subcategory:'A', name:'British Golden Ale', og_min:1.038, og_max:1.053, fg_min:1.006, fg_max:1.012, ibu_min:20, ibu_max:45, srm_min:2, srm_max:6, abv_min:3.8, abv_max:5.0, tags:['standard-strength','pale-color','top-fermented','british-isles'] },
  { id:'12B', category_number:12, category:'Pale Commonwealth Beer', subcategory:'B', name:'Australian Sparkling Ale', og_min:1.038, og_max:1.050, fg_min:1.004, fg_max:1.006, ibu_min:20, ibu_max:35, srm_min:4, srm_max:7, abv_min:4.5, abv_max:6.0, tags:['standard-strength','pale-color','top-fermented','pacific'] },
  { id:'12C', category_number:12, category:'Pale Commonwealth Beer', subcategory:'C', name:'English IPA', og_min:1.050, og_max:1.075, fg_min:1.010, fg_max:1.018, ibu_min:40, ibu_max:60, srm_min:6, srm_max:14, abv_min:5.0, abv_max:7.5, tags:['high-strength','pale-color','top-fermented','british-isles','ipa-family'] },

  // Category 13: Brown British Beer
  { id:'13A', category_number:13, category:'Brown British Beer', subcategory:'A', name:'Dark Mild', og_min:1.030, og_max:1.038, fg_min:1.008, fg_max:1.013, ibu_min:10, ibu_max:25, srm_min:12, srm_max:25, abv_min:3.0, abv_max:3.8, tags:['session-strength','dark-color','top-fermented','british-isles'] },
  { id:'13B', category_number:13, category:'Brown British Beer', subcategory:'B', name:'British Brown Ale', og_min:1.040, og_max:1.052, fg_min:1.008, fg_max:1.013, ibu_min:20, ibu_max:30, srm_min:12, srm_max:22, abv_min:4.2, abv_max:5.4, tags:['standard-strength','amber-color','top-fermented','british-isles','brown-ale-family'] },
  { id:'13C', category_number:13, category:'Brown British Beer', subcategory:'C', name:'English Porter', og_min:1.040, og_max:1.052, fg_min:1.008, fg_max:1.014, ibu_min:18, ibu_max:35, srm_min:20, srm_max:30, abv_min:4.0, abv_max:5.4, tags:['standard-strength','dark-color','top-fermented','british-isles','porter-family'] },

  // Category 14: Scottish Ale
  { id:'14A', category_number:14, category:'Scottish Ale', subcategory:'A', name:'Scottish Light', og_min:1.030, og_max:1.035, fg_min:1.010, fg_max:1.013, ibu_min:10, ibu_max:20, srm_min:17, srm_max:25, abv_min:2.5, abv_max:3.2, tags:['session-strength','dark-color','top-fermented','british-isles'] },
  { id:'14B', category_number:14, category:'Scottish Ale', subcategory:'B', name:'Scottish Heavy', og_min:1.035, og_max:1.040, fg_min:1.010, fg_max:1.014, ibu_min:10, ibu_max:20, srm_min:13, srm_max:22, abv_min:3.2, abv_max:3.9, tags:['session-strength','amber-color','top-fermented','british-isles'] },
  { id:'14C', category_number:14, category:'Scottish Ale', subcategory:'C', name:'Scottish Export', og_min:1.040, og_max:1.060, fg_min:1.010, fg_max:1.016, ibu_min:15, ibu_max:30, srm_min:13, srm_max:22, abv_min:3.9, abv_max:6.0, tags:['standard-strength','amber-color','top-fermented','british-isles'] },

  // Category 15: Irish Beer
  { id:'15A', category_number:15, category:'Irish Beer', subcategory:'A', name:'Irish Red Ale', og_min:1.036, og_max:1.046, fg_min:1.010, fg_max:1.014, ibu_min:18, ibu_max:28, srm_min:9, srm_max:14, abv_min:3.8, abv_max:5.0, tags:['standard-strength','amber-color','top-fermented','british-isles'] },
  { id:'15B', category_number:15, category:'Irish Beer', subcategory:'B', name:'Irish Stout', og_min:1.036, og_max:1.044, fg_min:1.007, fg_max:1.011, ibu_min:25, ibu_max:40, srm_min:25, srm_max:40, abv_min:4.0, abv_max:4.5, tags:['standard-strength','dark-color','top-fermented','british-isles','stout-family'] },
  { id:'15C', category_number:15, category:'Irish Beer', subcategory:'C', name:'Irish Extra Stout', og_min:1.052, og_max:1.062, fg_min:1.010, fg_max:1.014, ibu_min:35, ibu_max:50, srm_min:25, srm_max:40, abv_min:5.5, abv_max:6.5, tags:['standard-strength','dark-color','top-fermented','british-isles','stout-family'] },

  // Category 16: Dark British Beer
  { id:'16A', category_number:16, category:'Dark British Beer', subcategory:'A', name:'Sweet Stout', og_min:1.044, og_max:1.060, fg_min:1.012, fg_max:1.024, ibu_min:20, ibu_max:40, srm_min:30, srm_max:40, abv_min:4.0, abv_max:6.0, tags:['standard-strength','dark-color','top-fermented','british-isles','stout-family'] },
  { id:'16B', category_number:16, category:'Dark British Beer', subcategory:'B', name:'Oatmeal Stout', og_min:1.045, og_max:1.065, fg_min:1.010, fg_max:1.018, ibu_min:25, ibu_max:40, srm_min:22, srm_max:40, abv_min:4.2, abv_max:5.9, tags:['standard-strength','dark-color','top-fermented','british-isles','stout-family'] },
  { id:'16C', category_number:16, category:'Dark British Beer', subcategory:'C', name:'Tropical Stout', og_min:1.056, og_max:1.084, fg_min:1.010, fg_max:1.018, ibu_min:30, ibu_max:50, srm_min:30, srm_max:40, abv_min:5.5, abv_max:8.0, tags:['high-strength','dark-color','top-fermented','stout-family'] },
  { id:'16D', category_number:16, category:'Dark British Beer', subcategory:'D', name:'Foreign Extra Stout', og_min:1.056, og_max:1.075, fg_min:1.010, fg_max:1.018, ibu_min:30, ibu_max:70, srm_min:30, srm_max:40, abv_min:6.3, abv_max:8.0, tags:['high-strength','dark-color','top-fermented','british-isles','stout-family'] },

  // Category 17: Strong British Ale
  { id:'17A', category_number:17, category:'Strong British Ale', subcategory:'A', name:'British Strong Ale', og_min:1.055, og_max:1.080, fg_min:1.015, fg_max:1.022, ibu_min:30, ibu_max:60, srm_min:8, srm_max:22, abv_min:5.5, abv_max:8.0, tags:['high-strength','amber-color','top-fermented','british-isles'] },
  { id:'17B', category_number:17, category:'Strong British Ale', subcategory:'B', name:'Old Ale', og_min:1.055, og_max:1.088, fg_min:1.015, fg_max:1.022, ibu_min:30, ibu_max:60, srm_min:10, srm_max:22, abv_min:5.5, abv_max:9.0, tags:['high-strength','amber-color','top-fermented','british-isles'] },
  { id:'17C', category_number:17, category:'Strong British Ale', subcategory:'C', name:'Wee Heavy', og_min:1.070, og_max:1.130, fg_min:1.018, fg_max:1.040, ibu_min:17, ibu_max:35, srm_min:14, srm_max:25, abv_min:6.5, abv_max:10.0, tags:['very-high-strength','amber-color','top-fermented','british-isles'] },
  { id:'17D', category_number:17, category:'Strong British Ale', subcategory:'D', name:'English Barleywine', og_min:1.080, og_max:1.120, fg_min:1.018, fg_max:1.030, ibu_min:35, ibu_max:70, srm_min:8, srm_max:22, abv_min:8.0, abv_max:12.0, tags:['very-high-strength','amber-color','top-fermented','british-isles','barleywine-family'] },

  // Category 18: Pale American Ale
  { id:'18A', category_number:18, category:'Pale American Ale', subcategory:'A', name:'Blonde Ale', og_min:1.038, og_max:1.054, fg_min:1.008, fg_max:1.013, ibu_min:15, ibu_max:28, srm_min:3, srm_max:6, abv_min:3.8, abv_max:5.5, tags:['standard-strength','pale-color','top-fermented','north-america'] },
  { id:'18B', category_number:18, category:'Pale American Ale', subcategory:'B', name:'American Pale Ale', og_min:1.045, og_max:1.060, fg_min:1.010, fg_max:1.015, ibu_min:30, ibu_max:50, srm_min:5, srm_max:10, abv_min:5.0, abv_max:6.2, tags:['standard-strength','pale-color','top-fermented','north-america'] },

  // Category 19: Amber and Brown American Beer
  { id:'19A', category_number:19, category:'Amber and Brown American Beer', subcategory:'A', name:'American Amber Ale', og_min:1.045, og_max:1.060, fg_min:1.010, fg_max:1.015, ibu_min:25, ibu_max:40, srm_min:10, srm_max:17, abv_min:4.5, abv_max:6.2, tags:['standard-strength','amber-color','top-fermented','north-america'] },
  { id:'19B', category_number:19, category:'Amber and Brown American Beer', subcategory:'B', name:'California Common', og_min:1.048, og_max:1.054, fg_min:1.011, fg_max:1.014, ibu_min:30, ibu_max:45, srm_min:10, srm_max:14, abv_min:4.5, abv_max:5.5, tags:['standard-strength','amber-color','bottom-fermented','north-america'] },
  { id:'19C', category_number:19, category:'Amber and Brown American Beer', subcategory:'C', name:'American Brown Ale', og_min:1.045, og_max:1.060, fg_min:1.010, fg_max:1.016, ibu_min:20, ibu_max:40, srm_min:18, srm_max:35, abv_min:4.3, abv_max:6.2, tags:['standard-strength','dark-color','top-fermented','north-america','brown-ale-family'] },

  // Category 20: American Porter and Stout
  { id:'20A', category_number:20, category:'American Porter and Stout', subcategory:'A', name:'American Porter', og_min:1.050, og_max:1.070, fg_min:1.012, fg_max:1.018, ibu_min:25, ibu_max:50, srm_min:22, srm_max:40, abv_min:4.8, abv_max:6.5, tags:['standard-strength','dark-color','top-fermented','north-america','porter-family'] },
  { id:'20B', category_number:20, category:'American Porter and Stout', subcategory:'B', name:'American Stout', og_min:1.050, og_max:1.075, fg_min:1.010, fg_max:1.022, ibu_min:35, ibu_max:75, srm_min:30, srm_max:40, abv_min:5.0, abv_max:7.0, tags:['standard-strength','dark-color','top-fermented','north-america','stout-family'] },
  { id:'20C', category_number:20, category:'American Porter and Stout', subcategory:'C', name:'Imperial Stout', og_min:1.075, og_max:1.115, fg_min:1.018, fg_max:1.030, ibu_min:50, ibu_max:90, srm_min:30, srm_max:40, abv_min:8.0, abv_max:12.0, tags:['very-high-strength','dark-color','top-fermented','north-america','stout-family'] },

  // Category 21: IPA
  { id:'21A', category_number:21, category:'IPA', subcategory:'A', name:'American IPA', og_min:1.056, og_max:1.070, fg_min:1.008, fg_max:1.014, ibu_min:40, ibu_max:70, srm_min:6, srm_max:14, abv_min:5.5, abv_max:7.5, tags:['high-strength','pale-color','top-fermented','north-america','ipa-family'] },
  { id:'21B', category_number:21, category:'IPA', subcategory:'B', name:'Specialty IPA', og_min:1.056, og_max:1.070, fg_min:1.008, fg_max:1.014, ibu_min:40, ibu_max:70, srm_min:6, srm_max:14, abv_min:5.5, abv_max:8.0, tags:['high-strength','pale-color','top-fermented','ipa-family'] },

  // Category 22: Strong American Ale
  { id:'22A', category_number:22, category:'Strong American Ale', subcategory:'A', name:'Double IPA', og_min:1.065, og_max:1.085, fg_min:1.008, fg_max:1.018, ibu_min:60, ibu_max:120, srm_min:6, srm_max:14, abv_min:7.5, abv_max:10.0, tags:['very-high-strength','pale-color','top-fermented','north-america','ipa-family'] },
  { id:'22B', category_number:22, category:'Strong American Ale', subcategory:'B', name:'American Strong Ale', og_min:1.062, og_max:1.090, fg_min:1.014, fg_max:1.024, ibu_min:50, ibu_max:100, srm_min:7, srm_max:19, abv_min:6.3, abv_max:10.0, tags:['very-high-strength','amber-color','top-fermented','north-america'] },
  { id:'22C', category_number:22, category:'Strong American Ale', subcategory:'C', name:'American Barleywine', og_min:1.080, og_max:1.120, fg_min:1.016, fg_max:1.030, ibu_min:50, ibu_max:100, srm_min:10, srm_max:19, abv_min:8.0, abv_max:12.0, tags:['very-high-strength','amber-color','top-fermented','north-america','barleywine-family'] },
  { id:'22D', category_number:22, category:'Strong American Ale', subcategory:'D', name:'Wheatwine', og_min:1.080, og_max:1.120, fg_min:1.016, fg_max:1.030, ibu_min:30, ibu_max:60, srm_min:8, srm_max:15, abv_min:8.0, abv_max:12.0, tags:['very-high-strength','amber-color','top-fermented','north-america','wheat-beer-family','barleywine-family'] },

  // Category 23: European Sour Ale
  { id:'23A', category_number:23, category:'European Sour Ale', subcategory:'A', name:'Berliner Weisse', og_min:1.028, og_max:1.032, fg_min:1.003, fg_max:1.006, ibu_min:3, ibu_max:8, srm_min:2, srm_max:3, abv_min:2.8, abv_max:3.8, tags:['session-strength','pale-color','top-fermented','central-europe','wheat-beer-family','sour'] },
  { id:'23B', category_number:23, category:'European Sour Ale', subcategory:'B', name:'Flanders Red Ale', og_min:1.048, og_max:1.057, fg_min:1.002, fg_max:1.012, ibu_min:10, ibu_max:25, srm_min:10, srm_max:17, abv_min:4.6, abv_max:6.5, tags:['standard-strength','amber-color','top-fermented','western-europe','sour'] },
  { id:'23C', category_number:23, category:'European Sour Ale', subcategory:'C', name:'Oud Bruin', og_min:1.040, og_max:1.074, fg_min:1.008, fg_max:1.012, ibu_min:20, ibu_max:25, srm_min:15, srm_max:22, abv_min:4.0, abv_max:8.0, tags:['standard-strength','dark-color','top-fermented','western-europe','sour'] },
  { id:'23D', category_number:23, category:'European Sour Ale', subcategory:'D', name:'Lambic', og_min:1.048, og_max:1.054, fg_min:1.001, fg_max:1.010, ibu_min:0, ibu_max:10, srm_min:3, srm_max:7, abv_min:5.0, abv_max:6.5, tags:['standard-strength','pale-color','wild-fermented','western-europe','sour'] },
  { id:'23E', category_number:23, category:'European Sour Ale', subcategory:'E', name:'Gueuze', og_min:1.040, og_max:1.060, fg_min:1.000, fg_max:1.006, ibu_min:0, ibu_max:10, srm_min:3, srm_max:7, abv_min:5.0, abv_max:8.0, tags:['standard-strength','pale-color','wild-fermented','western-europe','sour'] },
  { id:'23F', category_number:23, category:'European Sour Ale', subcategory:'F', name:'Fruit Lambic', og_min:1.040, og_max:1.060, fg_min:1.000, fg_max:1.010, ibu_min:0, ibu_max:10, srm_min:3, srm_max:7, abv_min:5.0, abv_max:7.0, tags:['standard-strength','pale-color','wild-fermented','western-europe','sour','fruit'] },

  // Category 24: Belgian Ale
  { id:'24A', category_number:24, category:'Belgian Ale', subcategory:'A', name:'Witbier', og_min:1.044, og_max:1.052, fg_min:1.008, fg_max:1.012, ibu_min:8, ibu_max:20, srm_min:2, srm_max:4, abv_min:4.5, abv_max:5.5, tags:['standard-strength','pale-color','top-fermented','western-europe','wheat-beer-family'] },
  { id:'24B', category_number:24, category:'Belgian Ale', subcategory:'B', name:'Belgian Pale Ale', og_min:1.048, og_max:1.054, fg_min:1.010, fg_max:1.014, ibu_min:20, ibu_max:30, srm_min:8, srm_max:14, abv_min:4.8, abv_max:5.5, tags:['standard-strength','amber-color','top-fermented','western-europe'] },
  { id:'24C', category_number:24, category:'Belgian Ale', subcategory:'C', name:'Bière de Garde', og_min:1.060, og_max:1.080, fg_min:1.008, fg_max:1.016, ibu_min:18, ibu_max:28, srm_min:6, srm_max:19, abv_min:6.0, abv_max:8.5, tags:['high-strength','amber-color','top-fermented','western-europe'] },

  // Category 25: Strong Belgian Ale
  { id:'25A', category_number:25, category:'Strong Belgian Ale', subcategory:'A', name:'Belgian Blond Ale', og_min:1.062, og_max:1.075, fg_min:1.008, fg_max:1.018, ibu_min:15, ibu_max:30, srm_min:4, srm_max:7, abv_min:6.0, abv_max:7.5, tags:['high-strength','pale-color','top-fermented','western-europe'] },
  { id:'25B', category_number:25, category:'Strong Belgian Ale', subcategory:'B', name:'Saison', og_min:1.048, og_max:1.065, fg_min:1.002, fg_max:1.012, ibu_min:20, ibu_max:35, srm_min:5, srm_max:14, abv_min:3.5, abv_max:9.0, tags:['standard-strength','pale-color','top-fermented','western-europe'] },
  { id:'25C', category_number:25, category:'Strong Belgian Ale', subcategory:'C', name:'Belgian Golden Strong Ale', og_min:1.070, og_max:1.095, fg_min:1.005, fg_max:1.016, ibu_min:22, ibu_max:35, srm_min:3, srm_max:6, abv_min:7.5, abv_max:10.5, tags:['very-high-strength','pale-color','top-fermented','western-europe'] },

  // Category 26: Trappist Ale
  { id:'26B', category_number:26, category:'Monastic Ale', subcategory:'B', name:'Belgian Dubbel', og_min:1.062, og_max:1.075, fg_min:1.008, fg_max:1.018, ibu_min:15, ibu_max:25, srm_min:10, srm_max:17, abv_min:6.0, abv_max:7.6, tags:['high-strength','dark-color','top-fermented','western-europe'] },
  { id:'26C', category_number:26, category:'Monastic Ale', subcategory:'C', name:'Belgian Tripel', og_min:1.075, og_max:1.085, fg_min:1.008, fg_max:1.014, ibu_min:20, ibu_max:40, srm_min:4, srm_max:7, abv_min:7.5, abv_max:9.5, tags:['very-high-strength','pale-color','top-fermented','western-europe'] },
  { id:'26D', category_number:26, category:'Monastic Ale', subcategory:'D', name:'Belgian Dark Strong Ale', og_min:1.075, og_max:1.110, fg_min:1.010, fg_max:1.024, ibu_min:20, ibu_max:35, srm_min:12, srm_max:22, abv_min:8.0, abv_max:12.0, tags:['very-high-strength','dark-color','top-fermented','western-europe'] },

  // Category 27: Historical Beer (selections)
  { id:'27A', category_number:27, category:'Historical Beer', subcategory:'A', name:'Gose', og_min:1.036, og_max:1.056, fg_min:1.006, fg_max:1.010, ibu_min:5, ibu_max:15, srm_min:3, srm_max:4, abv_min:4.2, abv_max:4.8, tags:['standard-strength','pale-color','top-fermented','central-europe','wheat-beer-family','sour'] },

  // Category 29: Fruit Beer
  { id:'29A', category_number:29, category:'Fruit Beer', subcategory:'A', name:'Fruit Beer', og_min:1.030, og_max:1.110, fg_min:1.004, fg_max:1.020, ibu_min:0, ibu_max:50, srm_min:1, srm_max:40, abv_min:2.5, abv_max:12.0, tags:['varied-strength','varied-color','top-fermented','fruit'] },

  // Category 30: Spiced Beer
  { id:'30A', category_number:30, category:'Spiced Beer', subcategory:'A', name:'Spiced Herb or Vegetable Beer', og_min:1.030, og_max:1.110, fg_min:1.006, fg_max:1.020, ibu_min:0, ibu_max:50, srm_min:1, srm_max:40, abv_min:2.5, abv_max:12.0, tags:['spice'] },
  { id:'30C', category_number:30, category:'Spiced Beer', subcategory:'C', name:'Winter Seasonal Beer', og_min:1.055, og_max:1.100, fg_min:1.010, fg_max:1.030, ibu_min:0, ibu_max:60, srm_min:7, srm_max:30, abv_min:6.0, abv_max:14.0, tags:['high-strength','amber-color','spice'] },

  // Category 34: Specialty Beer
  { id:'34A', category_number:34, category:'Specialty Beer', subcategory:'A', name:'Commercial Specialty Beer', og_min:1.030, og_max:1.120, fg_min:1.006, fg_max:1.030, ibu_min:0, ibu_max:100, srm_min:1, srm_max:40, abv_min:2.5, abv_max:14.0, tags:['specialty'] },
  { id:'34B', category_number:34, category:'Specialty Beer', subcategory:'B', name:'Mixed-Style Beer', og_min:1.030, og_max:1.120, fg_min:1.006, fg_max:1.030, ibu_min:0, ibu_max:100, srm_min:1, srm_max:40, abv_min:2.5, abv_max:14.0, tags:['specialty'] },
  { id:'34C', category_number:34, category:'Specialty Beer', subcategory:'C', name:'Experimental Beer', og_min:1.030, og_max:1.120, fg_min:1.006, fg_max:1.030, ibu_min:0, ibu_max:100, srm_min:1, srm_max:40, abv_min:2.5, abv_max:14.0, tags:['specialty'] },
];
