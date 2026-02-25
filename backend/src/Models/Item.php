<?php

namespace App\Models;

use PDO;

class Item
{
    private $db;
    private $tagModel;

    public function __construct($db)
    {
        $this->db = $db;
        $this->tagModel = new Tag($db);
    }

    public function getAll($search = null, $kategorien = null, $orte = null, $tags = null, $categoryMode = 'union', $locationMode = 'union', $tagMode = 'union')
    {
        // Convert single values to arrays for consistent processing
        if ($kategorien && !is_array($kategorien)) {
            $kategorien = [$kategorien];
        }
        if ($orte && !is_array($orte)) {
            $orte = [$orte];
        }
        if ($tags && !is_array($tags)) {
            $tags = [$tags];
        }

        $sql = 'SELECT DISTINCT i.*, l.name as ort_name, l.path as ort_path, c.name as kategorie_name
                FROM items i
                LEFT JOIN locations l ON i.ort_id = l.id
                LEFT JOIN categories c ON i.kategorie_id = c.id';

        if ($tags && count($tags) > 0 && $tagMode !== 'exclude') {
            $sql .= ' INNER JOIN item_tags it ON i.id = it.item_id';
        }

        $sql .= ' WHERE 1=1';
        $params = [];

        if ($search) {
            // Fuzzy search: split search terms and find items matching all words
            $searchTerms = preg_split('/\s+/', trim($search));
            $searchConditions = [];

            foreach ($searchTerms as $index => $term) {
                if (!empty($term)) {
                    $placeholder = ':search' . $index;
                    $searchConditions[] = '(i.name LIKE ' . $placeholder .
                                         ' OR i.artikelnummer LIKE ' . $placeholder .
                                         ' OR i.farbe LIKE ' . $placeholder .
                                         ' OR i.hersteller LIKE ' . $placeholder .
                                         ' OR i.haendler LIKE ' . $placeholder .
                                         ' OR i.notizen LIKE ' . $placeholder .
                                         ' OR c.name LIKE ' . $placeholder .
                                         ' OR l.name LIKE ' . $placeholder .
                                         ' OR l.path LIKE ' . $placeholder . ')';
                    $params[$placeholder] = '%' . $term . '%';
                }
            }

            if (!empty($searchConditions)) {
                $sql .= ' AND (' . implode(' AND ', $searchConditions) . ')';
            }
        }

        // Category filter - Union (OR), Intersect (AND), or Exclude (NOT)
        if ($kategorien && count($kategorien) > 0) {
            $placeholders = [];
            foreach ($kategorien as $index => $kat) {
                $placeholder = ':kategorie' . $index;
                $placeholders[] = $placeholder;
                $params[$placeholder] = $kat;
            }
            if ($categoryMode === 'exclude') {
                // Exclude: item must NOT have any of the selected categories
                $sql .= ' AND (i.kategorie_id IS NULL OR i.kategorie_id NOT IN (' . implode(',', $placeholders) . '))';
            } else {
                // Union/Intersect: item has at least one of the selected categories
                $sql .= ' AND i.kategorie_id IN (' . implode(',', $placeholders) . ')';
            }
        }

        // Location filter - Union (OR), Intersect (AND), or Exclude (NOT)
        if ($orte && count($orte) > 0) {
            $placeholders = [];
            foreach ($orte as $index => $ort) {
                $placeholder = ':ort' . $index;
                $placeholders[] = $placeholder;
                $params[$placeholder] = $ort;
            }
            if ($locationMode === 'exclude') {
                // Exclude: item must NOT have any of the selected locations
                $sql .= ' AND (i.ort_id IS NULL OR i.ort_id NOT IN (' . implode(',', $placeholders) . '))';
            } else {
                // Union/Intersect: item has at least one of the selected locations
                $sql .= ' AND i.ort_id IN (' . implode(',', $placeholders) . ')';
            }
        }

        // Tag filter - Union (OR), Intersect (AND), or Exclude (NOT)
        if ($tags && count($tags) > 0) {
            $placeholders = [];
            foreach ($tags as $index => $tag) {
                $placeholder = ':tag' . $index;
                $placeholders[] = $placeholder;
                $params[$placeholder] = $tag;
            }
            if ($tagMode === 'exclude') {
                // Exclude: item must NOT have any of the selected tags
                // We need to modify the query to exclude items with these tags
                $sql .= ' AND i.id NOT IN (SELECT item_id FROM item_tags WHERE tag_id IN (' . implode(',', $placeholders) . '))';
            } else if ($tagMode === 'intersect') {
                // Intersect: item must have ALL selected tags
                $sql .= ' AND it.tag_id IN (' . implode(',', $placeholders) . ')';
                $sql .= ' GROUP BY i.id HAVING COUNT(DISTINCT it.tag_id) = ' . count($tags);
            } else {
                // Union: item must have AT LEAST ONE selected tag
                $sql .= ' AND it.tag_id IN (' . implode(',', $placeholders) . ')';
            }
        }

        $sql .= ' ORDER BY i.created_at DESC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll();

        // Add tags to each item
        foreach ($items as &$item) {
            $item['tags'] = $this->tagModel->getItemTags($item['id']);
        }

        return $items;
    }

    public function getById($id)
    {
        $stmt = $this->db->prepare('
            SELECT i.*, l.name as ort_name, l.path as ort_path, c.name as kategorie_name
            FROM items i
            LEFT JOIN locations l ON i.ort_id = l.id
            LEFT JOIN categories c ON i.kategorie_id = c.id
            WHERE i.id = :id
        ');
        $stmt->execute([':id' => $id]);
        $item = $stmt->fetch();

        if ($item) {
            $item['tags'] = $this->tagModel->getItemTags($item['id']);
        }

        return $item;
    }

    public function create($data)
    {
        $stmt = $this->db->prepare('
            INSERT INTO items (name, artikelnummer, farbe, kategorie_id, ort_id, menge, einheit, hersteller, haendler, preis, link,
                               datenblatt_type, datenblatt_value, weitere_datei_type, weitere_datei_value, bild, notizen)
            VALUES (:name, :artikelnummer, :farbe, :kategorie_id, :ort_id, :menge, :einheit, :hersteller, :haendler, :preis, :link,
                    :datenblatt_type, :datenblatt_value, :weitere_datei_type, :weitere_datei_value, :bild, :notizen)
        ');

        $result = $stmt->execute([
            ':name' => $data['name'] ?? null,
            ':artikelnummer' => $data['artikelnummer'] ?? null,
            ':farbe' => $data['farbe'] ?? null,
            ':kategorie_id' => $data['kategorie_id'] ?? null,
            ':ort_id' => $data['ort_id'] ?? null,
            ':menge' => $data['menge'] ?? null,
            ':einheit' => $data['einheit'] ?? null,
            ':hersteller' => $data['hersteller'] ?? null,
            ':haendler' => $data['haendler'] ?? null,
            ':preis' => $data['preis'] ?? null,
            ':link' => $data['link'] ?? null,
            ':datenblatt_type' => $data['datenblatt_type'] ?? null,
            ':datenblatt_value' => $data['datenblatt_value'] ?? null,
            ':weitere_datei_type' => $data['weitere_datei_type'] ?? null,
            ':weitere_datei_value' => $data['weitere_datei_value'] ?? null,
            ':bild' => $data['bild'] ?? null,
            ':notizen' => $data['notizen'] ?? null
        ]);

        if ($result) {
            $itemId = $this->db->lastInsertId();

            // Save tags if provided
            if (isset($data['tag_ids']) && is_array($data['tag_ids'])) {
                $this->tagModel->setItemTags($itemId, $data['tag_ids']);
            }

            return $itemId;
        }

        return false;
    }

    public function update($id, $data)
    {
        $stmt = $this->db->prepare('
            UPDATE items
            SET name = :name, artikelnummer = :artikelnummer, farbe = :farbe, kategorie_id = :kategorie_id,
                ort_id = :ort_id, menge = :menge, einheit = :einheit, hersteller = :hersteller, haendler = :haendler,
                preis = :preis, link = :link, datenblatt_type = :datenblatt_type, datenblatt_value = :datenblatt_value,
                weitere_datei_type = :weitere_datei_type, weitere_datei_value = :weitere_datei_value,
                bild = :bild, notizen = :notizen, updated_at = CURRENT_TIMESTAMP
            WHERE id = :id
        ');

        $result = $stmt->execute([
            ':id' => $id,
            ':name' => $data['name'] ?? null,
            ':artikelnummer' => $data['artikelnummer'] ?? null,
            ':farbe' => $data['farbe'] ?? null,
            ':kategorie_id' => $data['kategorie_id'] ?? null,
            ':ort_id' => $data['ort_id'] ?? null,
            ':menge' => $data['menge'] ?? null,
            ':einheit' => $data['einheit'] ?? null,
            ':hersteller' => $data['hersteller'] ?? null,
            ':haendler' => $data['haendler'] ?? null,
            ':preis' => $data['preis'] ?? null,
            ':link' => $data['link'] ?? null,
            ':datenblatt_type' => $data['datenblatt_type'] ?? null,
            ':datenblatt_value' => $data['datenblatt_value'] ?? null,
            ':weitere_datei_type' => $data['weitere_datei_type'] ?? null,
            ':weitere_datei_value' => $data['weitere_datei_value'] ?? null,
            ':bild' => $data['bild'] ?? null,
            ':notizen' => $data['notizen'] ?? null
        ]);

        if ($result) {
            // Update tags if provided
            if (isset($data['tag_ids']) && is_array($data['tag_ids'])) {
                $this->tagModel->setItemTags($id, $data['tag_ids']);
            }
        }

        return $result;
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare('DELETE FROM items WHERE id = :id');
        return $stmt->execute([':id' => $id]);
    }

    public function autocomplete($query)
    {
        $stmt = $this->db->prepare('
            SELECT DISTINCT name
            FROM items
            WHERE name LIKE :query
            ORDER BY name
            LIMIT 10
        ');
        $stmt->execute([':query' => $query . '%']);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    public function bulkUpdate($itemIds, $updates)
    {
        try {
            $this->db->beginTransaction();

            foreach ($itemIds as $itemId) {
                // Update category if provided
                if (isset($updates['kategorie_id'])) {
                    $stmt = $this->db->prepare('UPDATE items SET kategorie_id = :kategorie_id WHERE id = :id');
                    $stmt->execute([
                        ':kategorie_id' => $updates['kategorie_id'],
                        ':id' => $itemId
                    ]);
                }

                // Update location if provided
                if (isset($updates['ort_id'])) {
                    $stmt = $this->db->prepare('UPDATE items SET ort_id = :ort_id WHERE id = :id');
                    $stmt->execute([
                        ':ort_id' => $updates['ort_id'],
                        ':id' => $itemId
                    ]);
                }

                // Add tags if provided
                if (isset($updates['add_tags']) && is_array($updates['add_tags'])) {
                    foreach ($updates['add_tags'] as $tagId) {
                        // Check if tag already exists for this item
                        $checkStmt = $this->db->prepare('SELECT COUNT(*) FROM item_tags WHERE item_id = :item_id AND tag_id = :tag_id');
                        $checkStmt->execute([':item_id' => $itemId, ':tag_id' => $tagId]);

                        if ($checkStmt->fetchColumn() == 0) {
                            $stmt = $this->db->prepare('INSERT INTO item_tags (item_id, tag_id) VALUES (:item_id, :tag_id)');
                            $stmt->execute([':item_id' => $itemId, ':tag_id' => $tagId]);
                        }
                    }
                }

                // Remove tags if provided
                if (isset($updates['remove_tags']) && is_array($updates['remove_tags'])) {
                    foreach ($updates['remove_tags'] as $tagId) {
                        $stmt = $this->db->prepare('DELETE FROM item_tags WHERE item_id = :item_id AND tag_id = :tag_id');
                        $stmt->execute([':item_id' => $itemId, ':tag_id' => $tagId]);
                    }
                }
            }

            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            return false;
        }
    }

    public function getStatistics()
    {
        $stats = [];

        // Total count
        $stmt = $this->db->query('SELECT COUNT(*) as total FROM items');
        $stats['total_items'] = (int) $stmt->fetchColumn();

        // Total value
        $stmt = $this->db->query('SELECT SUM(preis) as total_value FROM items WHERE preis IS NOT NULL');
        $stats['total_value'] = (float) $stmt->fetchColumn();

        // Items without image
        $stmt = $this->db->query('SELECT COUNT(*) as count FROM items WHERE bild IS NULL OR bild = ""');
        $stats['items_without_image'] = (int) $stmt->fetchColumn();

        // Items without price
        $stmt = $this->db->query('SELECT COUNT(*) as count FROM items WHERE preis IS NULL');
        $stats['items_without_price'] = (int) $stmt->fetchColumn();

        // Top categories
        $stmt = $this->db->query('
            SELECT c.name, COUNT(i.id) as count
            FROM categories c
            LEFT JOIN items i ON i.kategorie_id = c.id
            GROUP BY c.id, c.name
            ORDER BY count DESC
            LIMIT 5
        ');
        $stats['top_categories'] = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Top locations
        $stmt = $this->db->query('
            SELECT l.name, l.path, COUNT(i.id) as count
            FROM locations l
            LEFT JOIN items i ON i.ort_id = l.id
            GROUP BY l.id, l.name, l.path
            ORDER BY count DESC
            LIMIT 5
        ');
        $stats['top_locations'] = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        // Top tags
        $stmt = $this->db->query('
            SELECT t.name, t.color, COUNT(it.item_id) as count
            FROM tags t
            LEFT JOIN item_tags it ON it.tag_id = t.id
            GROUP BY t.id, t.name, t.color
            ORDER BY count DESC
            LIMIT 10
        ');
        $stats['top_tags'] = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        return $stats;
    }
}
