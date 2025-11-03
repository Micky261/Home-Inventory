export interface Item {
  id?: number;
  name: string;
  kategorie?: string;
  ort_id?: number;
  ort_name?: string;
  menge?: number;
  einheit?: string;
  haendler?: string;
  preis?: number;
  link?: string;
  datenblatt_type?: 'file' | 'url';
  datenblatt_value?: string;
  bild?: string;
  notizen?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Location {
  id: number;
  name: string;
  created_at?: string;
}
