<?php

namespace App\Models;

use PDO;

class Item
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function getAll($search = null, $kategorie = null, $ort = null)
    {
        $sql = 'SELECT i.*, l.name as ort_name
                FROM items i
                LEFT JOIN locations l ON i.ort_id = l.id
                WHERE 1=1';
        $params = [];

        if ($search) {
            $sql .= ' AND (i.name LIKE :search OR i.kategorie LIKE :search OR l.name LIKE :search)';
            $params[':search'] = '%' . $search . '%';
        }

        if ($kategorie) {
            $sql .= ' AND i.kategorie = :kategorie';
            $params[':kategorie'] = $kategorie;
        }

        if ($ort) {
            $sql .= ' AND i.ort_id = :ort';
            $params[':ort'] = $ort;
        }

        $sql .= ' ORDER BY i.created_at DESC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getById($id)
    {
        $stmt = $this->db->prepare('
            SELECT i.*, l.name as ort_name
            FROM items i
            LEFT JOIN locations l ON i.ort_id = l.id
            WHERE i.id = :id
        ');
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function create($data)
    {
        $stmt = $this->db->prepare('
            INSERT INTO items (name, kategorie, ort_id, menge, einheit, haendler, preis, link,
                               datenblatt_type, datenblatt_value, bild, notizen)
            VALUES (:name, :kategorie, :ort_id, :menge, :einheit, :haendler, :preis, :link,
                    :datenblatt_type, :datenblatt_value, :bild, :notizen)
        ');

        $result = $stmt->execute([
            ':name' => $data['name'] ?? null,
            ':kategorie' => $data['kategorie'] ?? null,
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

        return $result ? $this->db->lastInsertId() : false;
    }

    public function update($id, $data)
    {
        $stmt = $this->db->prepare('
            UPDATE items
            SET name = :name, kategorie = :kategorie, ort_id = :ort_id, menge = :menge,
                einheit = :einheit, haendler = :haendler, preis = :preis, link = :link,
                datenblatt_type = :datenblatt_type, datenblatt_value = :datenblatt_value,
                bild = :bild, notizen = :notizen, updated_at = CURRENT_TIMESTAMP
            WHERE id = :id
        ');

        return $stmt->execute([
            ':id' => $id,
            ':name' => $data['name'] ?? null,
            ':kategorie' => $data['kategorie'] ?? null,
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

    public function getCategories()
    {
        $stmt = $this->db->query('
            SELECT DISTINCT kategorie
            FROM items
            WHERE kategorie IS NOT NULL
            ORDER BY kategorie
        ');
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
}
