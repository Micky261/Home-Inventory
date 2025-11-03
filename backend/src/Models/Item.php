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

    public function getAll($search = null, $kategorie = null, $ort = null, $tag = null)
    {
        $sql = 'SELECT DISTINCT i.*, l.name as ort_name, l.path as ort_path, c.name as kategorie_name
                FROM items i
                LEFT JOIN locations l ON i.ort_id = l.id
                LEFT JOIN categories c ON i.kategorie_id = c.id';

        if ($tag) {
            $sql .= ' INNER JOIN item_tags it ON i.id = it.item_id';
        }

        $sql .= ' WHERE 1=1';
        $params = [];

        if ($search) {
            $sql .= ' AND (i.name LIKE :search OR c.name LIKE :search OR l.name LIKE :search OR l.path LIKE :search)';
            $params[':search'] = '%' . $search . '%';
        }

        if ($kategorie) {
            $sql .= ' AND i.kategorie_id = :kategorie';
            $params[':kategorie'] = $kategorie;
        }

        if ($ort) {
            $sql .= ' AND i.ort_id = :ort';
            $params[':ort'] = $ort;
        }

        if ($tag) {
            $sql .= ' AND it.tag_id = :tag';
            $params[':tag'] = $tag;
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
            INSERT INTO items (name, kategorie_id, ort_id, menge, einheit, haendler, preis, link,
                               datenblatt_type, datenblatt_value, bild, notizen)
            VALUES (:name, :kategorie_id, :ort_id, :menge, :einheit, :haendler, :preis, :link,
                    :datenblatt_type, :datenblatt_value, :bild, :notizen)
        ');

        $result = $stmt->execute([
            ':name' => $data['name'] ?? null,
            ':kategorie_id' => $data['kategorie_id'] ?? null,
            ':ort_id' => $data['ort_id'] ?? null,
            ':menge' => $data['menge'] ?? null,
            ':einheit' => $data['einheit'] ?? null,
            ':haendler' => $data['haendler'] ?? null,
            ':preis' => $data['preis'] ?? null,
            ':link' => $data['link'] ?? null,
            ':datenblatt_type' => $data['datenblatt_type'] ?? null,
            ':datenblatt_value' => $data['datenblatt_value'] ?? null,
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
            SET name = :name, kategorie_id = :kategorie_id, ort_id = :ort_id, menge = :menge,
                einheit = :einheit, haendler = :haendler, preis = :preis, link = :link,
                datenblatt_type = :datenblatt_type, datenblatt_value = :datenblatt_value,
                bild = :bild, notizen = :notizen, updated_at = CURRENT_TIMESTAMP
            WHERE id = :id
        ');

        $result = $stmt->execute([
            ':id' => $id,
            ':name' => $data['name'] ?? null,
            ':kategorie_id' => $data['kategorie_id'] ?? null,
            ':ort_id' => $data['ort_id'] ?? null,
            ':menge' => $data['menge'] ?? null,
            ':einheit' => $data['einheit'] ?? null,
            ':haendler' => $data['haendler'] ?? null,
            ':preis' => $data['preis'] ?? null,
            ':link' => $data['link'] ?? null,
            ':datenblatt_type' => $data['datenblatt_type'] ?? null,
            ':datenblatt_value' => $data['datenblatt_value'] ?? null,
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
}
