-- ============================================================
-- Seed: Common Fermentables
-- ============================================================
INSERT INTO fermentables (name, type, color_ebc, ppg, fermentability, notes, origin) VALUES
-- Base Malts
('Pilsner Malt',           'grain', 3,   37, 80, 'Light, clean base malt for lagers and light ales', 'Germany'),
('Pale Ale Malt (2-Row)',   'grain', 7,   37, 78, 'Standard base malt for most ale styles', 'UK'),
('Pale Ale Malt (Maris Otter)', 'grain', 7, 38, 78, 'Premium UK base malt, nutty/biscuit character', 'UK'),
('Vienna Malt',            'grain', 10,  35, 77, 'Light amber malt with bread/toasty character', 'Austria'),
('Munich Malt (Light)',    'grain', 15,  34, 74, 'Rich malty-sweet character, German lagers', 'Germany'),
('Munich Malt (Dark)',     'grain', 30,  34, 72, 'Intensely malty, deep amber color', 'Germany'),
('Wheat Malt',             'grain', 4,   38, 82, 'High protein, hazy beers and hefeweizens', 'Germany'),
('Rye Malt',               'grain', 8,   37, 63, 'Spicy/earthy character, adds complexity', 'Germany'),
('Oat Malt',               'grain', 5,   35, 70, 'Smooth mouthfeel, stouts and hazy IPAs', 'UK'),
('Flaked Oats',            'adjunct', 3,  33, 70, 'Increases body and head retention', NULL),
('Flaked Wheat',           'adjunct', 3,  35, 75, 'Haze-producing, protein for head retention', NULL),
('Flaked Barley',          'adjunct', 3,  32, 70, 'Adds body and head retention to stouts', NULL),
('Flaked Corn (Maize)',    'adjunct', 2,  37, 85, 'Lightens body, crisp/clean flavor', NULL),
('Flaked Rice',            'adjunct', 1,  40, 95, 'Very clean flavor, lightens body', NULL),
-- Crystal/Caramel Malts
('Caramel/Crystal 10L',    'grain', 20,  33, 35, 'Very light sweetness and color', NULL),
('Caramel/Crystal 20L',    'grain', 39,  33, 35, 'Light caramel sweetness', NULL),
('Caramel/Crystal 40L',    'grain', 79,  33, 34, 'Mild caramel, slightly sweet', NULL),
('Caramel/Crystal 60L',    'grain', 118, 34, 33, 'Rich caramel flavor, amber color', NULL),
('Caramel/Crystal 80L',    'grain', 158, 33, 30, 'Deep caramel, red color', NULL),
('Caramel/Crystal 120L',   'grain', 237, 33, 25, 'Very sweet, dark fruit, deep red', NULL),
('CaraMunich I',           'grain', 60,  34, 35, 'Sweet caramel, Munich base', 'Germany'),
('CaraMunich II',          'grain', 90,  34, 34, 'Rich caramel, deeper color', 'Germany'),
('CaraMunich III',         'grain', 120, 34, 33, 'Intense caramel, deep amber', 'Germany'),
('CaraVienna',             'grain', 50,  34, 35, 'Light caramel, malty sweetness', 'Germany'),
('Carapils (Dextrine)',    'grain', 4,   33, 15, 'Body and head retention, no flavor', NULL),
-- Roasted/Dark Malts
('Chocolate Malt',         'grain', 900, 29, 20, 'Smooth chocolate/coffee character', NULL),
('Carafa Special I',       'grain', 600, 32, 20, 'Dehusked, smooth roast, dark color', 'Germany'),
('Carafa Special II',      'grain', 800, 32, 20, 'Dehusked, intense roast character', 'Germany'),
('Carafa Special III',     'grain', 1150,32, 20, 'Dehusked, very dark, black color', 'Germany'),
('Black Patent Malt',      'grain', 1300,25, 0,  'Harsh roast, use sparingly for color', NULL),
('Roasted Barley',         'grain', 1200,25, 0,  'Dry/bitter roast, essential for stouts', NULL),
('Black Barley (Unmalted)','grain', 1100,28, 0,  'Dry roast without harsh bitterness', NULL),
-- Sugars & Extracts
('Corn Sugar (Dextrose)',  'sugar', 1,   46, 100,'Highly fermentable, clean flavor, priming', NULL),
('Table Sugar (Sucrose)',  'sugar', 1,   46, 100,'Clean fermentable, high gravity boost', NULL),
('Brown Sugar',            'sugar', 40,  45, 95, 'Caramel/molasses notes', NULL),
('Candi Sugar (Clear)',    'sugar', 2,   46, 100,'Belgian beers, very clean', 'Belgium'),
('Candi Sugar (Amber)',    'sugar', 80,  44, 98, 'Belgian dubbels, caramel notes', 'Belgium'),
('Candi Sugar (Dark)',     'sugar', 400, 44, 98, 'Belgian dark strongs, dark fruit notes', 'Belgium'),
('Honey',                  'sugar', 3,   32, 95, 'Floral aroma, dries out the beer', NULL),
('Dried Malt Extract (DME) Pale', 'dry_extract', 9, 44, 75, 'Pale base DME', NULL),
('Dried Malt Extract (DME) Wheat', 'dry_extract', 9, 42, 75, 'Wheat DME, hazy beers', NULL),
('Liquid Malt Extract (LME) Pale', 'extract', 9, 36, 75, 'Pale LME for extract brewing', NULL),
('Lactose (Milk Sugar)',   'sugar', 1,   41, 0,  'Unfermentable, adds sweetness and body', NULL),
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed: Common Hops
-- ============================================================
INSERT INTO hops (name, origin, alpha_acid, beta_acid, notes, aroma_profile) VALUES
-- American
('Cascade',      'USA',     5.5,  6.0, 'Classic American hop, grapefruit/floral/citrus', ARRAY['citrus','grapefruit','floral']),
('Centennial',   'USA',     10.0, 4.5, 'Citrus and floral, "super Cascade"', ARRAY['citrus','floral','pine']),
('Chinook',      'USA',     13.0, 3.5, 'Pine and grapefruit, bittering/dual purpose', ARRAY['pine','grapefruit','spice']),
('Columbus (CTZ)','USA',    15.0, 4.5, 'Earthy, dank, heavy bittering', ARRAY['earthy','dank','citrus']),
('Citra',        'USA',     12.0, 4.0, 'Intense tropical and citrus, modern IPA staple', ARRAY['tropical','lime','grapefruit','passionfruit']),
('Simcoe',       'USA',     13.0, 4.5, 'Pine/earthy/citrus, complex aroma', ARRAY['pine','earthy','citrus','tropical']),
('Mosaic',       'USA',     11.5, 3.5, 'Blueberry, tropical, earthy complexity', ARRAY['tropical','blueberry','earthy','citrus']),
('Amarillo',     'USA',     8.5,  6.5, 'Orange blossom and grapefruit', ARRAY['orange','grapefruit','floral']),
('Galaxy',       'Australia',14.0,5.5, 'Passionfruit, citrus, peach', ARRAY['passionfruit','citrus','peach']),
('El Dorado',    'USA',     15.0, 7.0, 'Watermelon, tropical, stone fruit', ARRAY['tropical','watermelon','candy']),
('Ekuanot',      'USA',     13.0, 4.5, 'Papaya, melon, herbal', ARRAY['tropical','papaya','melon']),
('Idaho 7',      'USA',     12.5, 5.5, 'Red grapefruit, papaya, pine', ARRAY['grapefruit','tropical','pine']),
('Strata',       'USA',     13.0, 5.5, 'Dank, passionfruit, grapefruit, strawberry', ARRAY['dank','tropical','strawberry']),
('Sabro',        'USA',     15.0, 5.0, 'Coconut, tangerine, tropical', ARRAY['coconut','tropical','tangerine']),
('Comet',        'USA',     9.5,  3.5, 'Wild American, grapefruit, earthy', ARRAY['grapefruit','earthy','wild']),
('Nugget',       'USA',     13.5, 5.0, 'Herbal, spicy bittering hop', ARRAY['herbal','spice','resin']),
('Magnum',       'Germany', 14.0, 6.5, 'Clean bittering, mild herbal', ARRAY['clean','herbal']),
('Warrior',      'USA',     16.0, 5.5, 'Clean intense bittering', ARRAY['clean','resin']),
-- German / European
('Hallertau Mittelfrüh', 'Germany', 3.5, 4.0, 'Noble hop, floral/spicy/herbal', ARRAY['floral','herbal','spice']),
('Tettnanger',   'Germany', 4.5,  4.5, 'Noble hop, spicy/earthy/floral', ARRAY['spice','earthy','floral']),
('Saaz',         'Czech Republic', 3.5, 3.5, 'Classic noble hop, soft spice/herbal', ARRAY['spice','herbal','earthy']),
('Spalt',        'Germany', 4.5,  4.5, 'Noble hop, mild spice', ARRAY['spice','herbal']),
('Perle',        'Germany', 8.0,  4.0, 'Minty, spicy, herbal', ARRAY['mint','spice','herbal']),
('Hersbrucker',  'Germany', 2.5,  5.5, 'Mild floral and spice', ARRAY['floral','spice']),
('Polaris',      'Germany', 20.0, 5.0, 'Intense mint/menthol, polar character', ARRAY['mint','tropical']),
-- English
('Fuggles',      'UK',      4.5,  2.5, 'Earthy, woody, classic English character', ARRAY['earthy','woody','herbal']),
('East Kent Goldings (EKG)', 'UK', 5.0, 2.5, 'Spicy, floral, honey — classic English ale', ARRAY['spice','floral','honey']),
('Target',       'UK',      11.0, 6.5, 'Citrusy English bittering hop', ARRAY['citrus','herbal']),
('Challenger',   'UK',      8.5,  4.5, 'Fruity, cedar, clean bittering', ARRAY['fruity','cedar']),
-- Southern Hemisphere
('Nelson Sauvin', 'New Zealand', 12.5, 7.0, 'White wine/sauvignon blanc character, tropical', ARRAY['white-wine','gooseberry','tropical']),
('Motueka',      'New Zealand', 7.0, 5.5, 'Lemon/lime, tropical', ARRAY['lemon','lime','tropical']),
('Waimea',       'New Zealand', 16.0, 7.0, 'Tangerine, pine, tropical', ARRAY['tangerine','pine','tropical']),
('Riwaka',       'New Zealand', 5.5, 4.5, 'Grapefruit, citrus, clean', ARRAY['grapefruit','citrus']),
('Vic Secret',   'Australia', 14.5, 7.0, 'Passionfruit, pine, pineapple', ARRAY['passionfruit','pine','tropical']),
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed: Common Yeasts
-- ============================================================
INSERT INTO yeasts (name, lab, code, type, form, min_attenuation, max_attenuation, avg_attenuation, min_temp_c, max_temp_c, flocculation, notes) VALUES
-- Wyeast
('American Ale',           'Wyeast', '1056', 'ale',   'liquid', 73, 77, 75, 16, 22, 'low-medium', 'Clean, neutral, very versatile. American ales, IPAs.'),
('Chico Strain',           'Wyeast', '1272', 'ale',   'liquid', 72, 76, 74, 16, 22, 'medium',     'Balanced, fruity esters, dry finish. Pale ales.'),
('American Ale II',        'Wyeast', '1272', 'ale',   'liquid', 72, 76, 74, 16, 22, 'medium',     'Slightly fruity, clean. American ales.'),
('London Ale III',         'Wyeast', '1318', 'ale',   'liquid', 71, 75, 73, 16, 22, 'high',       'Soft, round, fruity. New England IPAs.'),
('Irish Ale',              'Wyeast', '1084', 'ale',   'liquid', 71, 75, 73, 16, 22, 'medium',     'Slightly fruity, dry finish. Irish stouts.'),
('Belgian Witbier',        'Wyeast', '3944', 'ale',   'liquid', 72, 76, 74, 18, 24, 'low-medium', 'Spicy, phenolic, citrus. Witbiers.'),
('Trappist High Gravity',  'Wyeast', '3787', 'ale',   'liquid', 74, 78, 76, 18, 26, 'medium',     'Fruity/spicy Belgian. Tripels, dubbels.'),
('Bavarian Weizen',        'Wyeast', '3068', 'ale',   'liquid', 73, 77, 75, 18, 24, 'low',        'Classic German weizen, banana/clove balance.'),
('German Lager',           'Wyeast', '2124', 'lager', 'liquid', 73, 77, 75, 8,  15, 'medium',     'Smooth, clean lager. Czech/German lagers.'),
('Bohemian Lager',         'Wyeast', '2206', 'lager', 'liquid', 73, 77, 75, 8,  14, 'medium',     'Rich malty character. Doppelbocks, Czech pils.'),
('Pilsen Lager',           'Wyeast', '2007', 'lager', 'liquid', 71, 75, 73, 8,  14, 'medium',     'Very clean, crisp. American and Czech lagers.'),
-- White Labs
('California Ale (WLP001)', 'White Labs', 'WLP001', 'ale',   'liquid', 73, 80, 76, 20, 23, 'medium',     'Clean, neutral, very popular American ale yeast.'),
('East Coast Ale (WLP008)', 'White Labs', 'WLP008', 'ale',   'liquid', 70, 75, 72, 19, 22, 'medium',     'Soft, clean, slight ester. East Coast ales.'),
('London Ale (WLP013)',    'White Labs', 'WLP013', 'ale',   'liquid', 67, 75, 71, 18, 23, 'medium',     'Dry, crisp, minerally. British ales.'),
('Belgian Ale (WLP550)',   'White Labs', 'WLP550', 'ale',   'liquid', 78, 85, 81, 18, 28, 'medium',     'Spicy, phenolic. Belgian strong ales, saisons.'),
('Hefeweizen (WLP300)',    'White Labs', 'WLP300', 'ale',   'liquid', 72, 76, 74, 18, 22, 'low',        'Authentic banana/clove hefeweizen character.'),
('German Lager (WLP830)',  'White Labs', 'WLP830', 'lager', 'liquid', 74, 79, 76, 8,  14, 'medium-high', 'Very clean German lager. Widely used.'),
-- Lallemand (Dry)
('Nottingham',             'Lallemand', NULL, 'ale',   'dry', 76, 82, 79, 14, 21, 'very_high', 'Clean, highly attenuative. Very popular dry yeast.'),
('Windsor',                'Lallemand', NULL, 'ale',   'dry', 65, 72, 68, 15, 22, 'high',      'Fruity, British character, leaves body.'),
('Belle Saison',           'Lallemand', NULL, 'ale',   'dry', 78, 85, 81, 15, 35, 'low',       'Classic saison character, very attenuative.'),
('Voss Kveik',             'Lallemand', NULL, 'ale',   'dry', 75, 82, 78, 18, 42, 'medium',    'Norwegian farmhouse. Ferments hot, fruity/citrus.'),
('New England Ale',        'Lallemand', NULL, 'ale',   'dry', 74, 80, 77, 16, 22, 'low',       'Juicy, hazy IPAs. Low flocculation for NEIPA.'),
-- Fermentis (Dry)
('Safale US-05',           'Fermentis', 'US-05', 'ale',   'dry', 78, 82, 80, 15, 24, 'medium-high', 'Neutral American ale. Most versatile dry yeast.'),
('Safale S-04',            'Fermentis', 'S-04',  'ale',   'dry', 74, 82, 78, 15, 24, 'high',        'English ale, fruity/clean, high flocculation.'),
('Saflager W-34/70',       'Fermentis', 'W-34/70','lager','dry', 73, 77, 75, 9,  15, 'high',        'Weihenstephan lager strain. Most popular dry lager.'),
('Saflager S-23',          'Fermentis', 'S-23',  'lager','dry', 82, 86, 84, 9,  15, 'medium',      'Western European lager, slightly fruity.'),
('Safbrew WB-06',          'Fermentis', 'WB-06', 'ale',  'dry', 86, 90, 88, 15, 24, 'low',         'Wheat beer, fruity with low flocculation.'),
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed: Common Misc Additions
-- ============================================================
INSERT INTO miscs (name, type, use_for, notes) VALUES
('Irish Moss',          'fining',       'boil',      'Kettle fining, added last 15 min of boil. Improves clarity.'),
('Whirlfloc Tablet',    'fining',       'boil',      'Kettle fining tablet. Add 1 tablet per 20L at end of boil.'),
('Gelatin Finings',     'fining',       'cold crash', 'Cold side fining. Clears yeast and chill haze.'),
('Bentonite',           'fining',       'fermentation','Protein fining, reduces haze.'),
('Gypsum (CaSO4)',      'water_agent',  'mash/boil', 'Raises sulfate and calcium. Accentuates hop bitterness.'),
('Calcium Chloride',    'water_agent',  'mash/boil', 'Raises calcium and chloride. Enhances malt character.'),
('Lactic Acid',         'water_agent',  'mash/boil', 'pH reduction. Commonly 88% solution.'),
('Phosphoric Acid',     'water_agent',  'mash/boil', 'pH reduction, no flavor impact.'),
('Baking Soda (NaHCO3)','water_agent',  'mash',      'Raises pH and bicarbonate.'),
('Chalk (CaCO3)',       'water_agent',  'mash',      'Raises pH, adds calcium. Use for dark beers.'),
('Magnesium Sulfate',   'water_agent',  'mash/boil', 'Epsom salt. Dry/bitter edge at high levels.'),
('Yeast Nutrient',      'other',        'boil',      'Supports healthy fermentation, especially for high-gravity or fruit beers.'),
('Yeast Energizer',     'other',        'fermentation','Restart stuck fermentation. Contains DAP, vitamins.'),
('Fermcap S',           'fining',       'boil/fermentation','Anti-foam. Prevents boilovers. Add a few drops to kettle or fermenter.'),
('Star San',            'other',        'sanitizer', 'No-rinse acid sanitizer. 1 oz per 5 gallons.'),
('Coriander Seed',      'spice',        'boil',      'Citrusy spice for witbiers. Crack before adding last 5 min.'),
('Orange Peel (Sweet)', 'spice',        'boil',      'Citrus aroma for witbiers and wheat beers. Add last 5 min.'),
('Vanilla Beans',       'spice',        'secondary', 'Split and add to secondary for vanilla character in stouts and porters.'),
('Cacao Nibs',          'flavor',       'secondary', 'Chocolate flavor in stouts. Sanitize with vodka first.'),
('Coffee (Whole Bean)', 'flavor',       'secondary', 'Cold brew method: coarsely grind, steep in beer cold for 12-24 hrs.'),
('Lactose (Milk Sugar)','other',        'boil',      'Unfermentable sweetener. Add to boil for milk stouts and pastry beers.'),
('Honey',               'sugar',        'primary',   'Add post-boil or to primary. Adds fermentable sugar and floral aroma.'),
ON CONFLICT DO NOTHING;
