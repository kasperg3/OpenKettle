export interface BJCPStyle {
  id: string;
  category: string;
  category_number: number;
  subcategory: string;
  name: string;
  og_min: number;
  og_max: number;
  fg_min: number;
  fg_max: number;
  ibu_min: number;
  ibu_max: number;
  srm_min: number;
  srm_max: number;
  abv_min: number;
  abv_max: number;
  overall_impression?: string;
  aroma?: string;
  appearance?: string;
  flavor?: string;
  mouthfeel?: string;
  comments?: string;
  examples?: string[];
  tags?: string[];
}
