export interface Item {
  id?: number;
  name: string;
  kategorie_id?: number;
  kategorie_name?: string;
  ort_id?: number;
  ort_name?: string;
  ort_path?: string;
  menge?: number;
  einheit?: string;
  haendler?: string;
  preis?: number;
  link?: string;
  datenblatt_type?: 'file' | 'url';
  datenblatt_value?: string;
  bild?: string;
  notizen?: string;
  tags?: Tag[];
  tag_ids?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface Location {
  id: number;
  name: string;
  parent_id?: number;
  path?: string;
  children?: Location[];
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  created_at?: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  created_at?: string;
}
